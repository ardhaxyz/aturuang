const { PrismaClient } = require('@prisma/client');
const { deleteFile, getFileUrl } = require('../utils/upload');
const { uploadToCloudinary, deleteFromCloudinary } = require('../services/cloudinaryService');

const prisma = new PrismaClient();

/**
 * Room Controller
 * Manages meeting rooms with organization support
 */

/**
 * Helper: Get accessible room IDs for a user
 */
async function getAccessibleRoomIds(user) {
  // All users can see ALL active rooms
  // Access control is enforced at booking creation time
  const rooms = await prisma.room.findMany({
    where: { isActive: true },
    select: { id: true },
  });
  return rooms.map(r => r.id);
}

/**
 * Get all rooms (filtered by user access)
 * GET /api/rooms
 */
async function getAllRooms(req, res) {
  try {
    const user = req.user;
    let where = { isActive: true };

    // NO filtering needed - all users can see ALL rooms
    // Superadmin: ALL rooms
    // Org Admin: ALL rooms (can see all org rooms)
    // User: ALL rooms (can see all org rooms, but can only book public + own org rooms)
    // Access control is enforced at booking creation time, not here

    const rooms = await prisma.room.findMany({
      where,
      orderBy: { name: 'asc' },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Parse facilities JSON string to array
    const roomsWithParsedFacilities = rooms.map(room => ({
      ...room,
      facilities: room.facilities ? JSON.parse(room.facilities) : [],
    }));

    return res.json({
      success: true,
      data: { rooms: roomsWithParsedFacilities },
    });
  } catch (error) {
    console.error('Get rooms error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch rooms',
    });
  }
}

/**
 * Get room by ID
 * GET /api/rooms/:id
 */
async function getRoomById(req, res) {
  try {
    const { id } = req.params;
    const user = req.user;

    const room = await prisma.room.findUnique({
      where: { id },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
        bookings: {
          orderBy: { date: 'asc' },
          take: 10,
          include: {
            room: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found',
      });
    }

    // Check access permissions
    if (user.role !== 'superadmin') {
      const hasAccess = room.isPublic || room.organizationId === user.organizationId;
      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: 'Access denied',
        });
      }
    }

    // Parse facilities JSON string to array
    const roomWithParsedFacilities = {
      ...room,
      facilities: room.facilities ? JSON.parse(room.facilities) : [],
    };

    return res.json({
      success: true,
      data: { room: roomWithParsedFacilities },
    });
  } catch (error) {
    console.error('Get room error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch room',
    });
  }
}

/**
 * Create new room
 * POST /api/rooms
 */
async function createRoom(req, res) {
  try {
    const user = req.user;
    const { name, capacity, facilities, organizationId, isPublic, imageUrl } = req.body;

    // Validate input
    if (!name || !capacity) {
      return res.status(400).json({
        success: false,
        message: 'Name and capacity are required',
      });
    }

    // Check permissions
    if (user.role === 'org_admin') {
      // Org admin can only create rooms for their own organization
      if (organizationId && organizationId !== user.organizationId) {
        return res.status(403).json({
          success: false,
          message: 'Can only create rooms for your own organization',
        });
      }
    }

    // Validate organization exists (if provided)
    if (organizationId) {
      const org = await prisma.organization.findUnique({
        where: { id: organizationId },
      });

      if (!org) {
        return res.status(404).json({
          success: false,
          message: 'Organization not found',
        });
      }
    }

    // Determine if room is public based on organizationId
    // If no organization selected, room is public
    const isPublicRoom = !organizationId;

    // Handle image upload to Cloudinary
    let finalImageUrl = imageUrl;
    if (req.file) {
      try {
        const cloudinaryResult = await uploadToCloudinary(req.file.buffer, req.file.originalname);
        finalImageUrl = cloudinaryResult.url;
        console.log('Image uploaded to Cloudinary:', finalImageUrl);
      } catch (uploadError) {
        console.error('Failed to upload image to Cloudinary:', uploadError.message);
        // Continue without image - room will be created without image
      }
    }

    const room = await prisma.room.create({
      data: {
        name,
        capacity: parseInt(capacity),
        facilities: facilities ? JSON.stringify(facilities) : '[]',
        imageUrl: finalImageUrl,
        isPublic: isPublicRoom,
        organizationId: organizationId || null,
        isActive: true,
      },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Parse facilities for response
    const roomWithParsedFacilities = {
      ...room,
      facilities: room.facilities ? JSON.parse(room.facilities) : [],
    };

    return res.status(201).json({
      success: true,
      message: 'Room created successfully',
      data: { room: roomWithParsedFacilities },
    });
  } catch (error) {
    console.error('Create room error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create room',
    });
  }
}

/**
 * Update room
 * PUT /api/rooms/:id
 */
async function updateRoom(req, res) {
  try {
    const { id } = req.params;
    const user = req.user;
    const { name, capacity, facilities, organizationId, isPublic, isActive, imageUrl } = req.body;

    // Check if room exists
    const existingRoom = await prisma.room.findUnique({
      where: { id },
    });

    if (!existingRoom) {
      return res.status(404).json({
        success: false,
        message: 'Room not found',
      });
    }

    // Normalize organizationId (treat empty string as null/undefined)
    const normalizedOrgId = organizationId && organizationId !== '' ? organizationId : null;
    
    // Check permissions
    if (user.role === 'org_admin') {
      // Org admin can update:
      // 1. Public rooms (organizationId: null)
      // 2. Rooms in their own organization
      const isPublicRoom = !existingRoom.organizationId;
      
      if (!isPublicRoom && existingRoom.organizationId !== user.organizationId) {
        return res.status(403).json({
          success: false,
          message: 'Can only update rooms in your organization',
        });
      }
      
      // Cannot change organization of non-public rooms
      if (!isPublicRoom && normalizedOrgId && normalizedOrgId !== user.organizationId) {
        return res.status(403).json({
          success: false,
          message: 'Cannot change room organization',
        });
      }
      
      // Org admin cannot convert public room to org room (only superadmin can)
      if (isPublicRoom && normalizedOrgId && normalizedOrgId !== user.organizationId) {
        return res.status(403).json({
          success: false,
          message: 'Cannot assign public room to another organization',
        });
      }
    }

    // Determine isPublic based on organizationId changes (using normalized value)
    let updateIsPublic = undefined;
    if (organizationId !== undefined) {
      // If organizationId is being updated
      updateIsPublic = !normalizedOrgId; // true if no org (null/empty), false if has org
    }

    // Handle image upload to Cloudinary
    let finalImageUrl = imageUrl;
    if (req.file) {
      try {
        const cloudinaryResult = await uploadToCloudinary(req.file.buffer, req.file.originalname);
        finalImageUrl = cloudinaryResult.url;
        console.log('Image uploaded to Cloudinary:', finalImageUrl);
      } catch (uploadError) {
        console.error('Failed to upload image to Cloudinary:', uploadError.message);
        // Continue with existing image URL or null
      }
    }

    const room = await prisma.room.update({
      where: { id },
      data: {
        name,
        capacity: capacity ? parseInt(capacity) : undefined,
        facilities: facilities ? JSON.stringify(facilities) : undefined,
        imageUrl: finalImageUrl,
        isPublic: updateIsPublic,
        isActive: isActive !== undefined ? isActive : undefined,
        organizationId: user.role === 'superadmin' ? normalizedOrgId : undefined,
      },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Parse facilities for response
    const roomWithParsedFacilities = {
      ...room,
      facilities: room.facilities ? JSON.parse(room.facilities) : [],
    };

    return res.json({
      success: true,
      message: 'Room updated successfully',
      data: { room: roomWithParsedFacilities },
    });
  } catch (error) {
    console.error('Update room error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update room',
    });
  }
}

/**
 * Delete room (soft delete)
 * DELETE /api/rooms/:id
 */
async function deleteRoom(req, res) {
  try {
    const { id } = req.params;
    const user = req.user;

    // Check if room exists
    const existingRoom = await prisma.room.findUnique({
      where: { id },
    });

    if (!existingRoom) {
      return res.status(404).json({
        success: false,
        message: 'Room not found',
      });
    }

    // Check permissions
    if (user.role === 'org_admin') {
      if (existingRoom.organizationId !== user.organizationId) {
        return res.status(403).json({
          success: false,
          message: 'Can only delete rooms in your organization',
        });
      }
    }

    // Soft delete by deactivating
    await prisma.room.update({
      where: { id },
      data: { isActive: false },
    });

    return res.json({
      success: true,
      message: 'Room deleted successfully',
    });
  } catch (error) {
    console.error('Delete room error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete room',
    });
  }
}

/**
 * Upload room image
 * POST /api/rooms/:id/image
 */
async function uploadRoomImage(req, res) {
  try {
    const { id } = req.params;
    const user = req.user;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided',
      });
    }

    // Check if room exists
    const existingRoom = await prisma.room.findUnique({
      where: { id },
    });

    if (!existingRoom) {
      // Delete uploaded file if room doesn't exist
      await deleteFile(req.file.filename);
      return res.status(404).json({
        success: false,
        message: 'Room not found',
      });
    }

    // Check permissions
    if (user.role === 'org_admin') {
      // Org admin can upload images to:
      // 1. Public rooms (organizationId: null)
      // 2. Rooms in their own organization
      const isPublicRoom = !existingRoom.organizationId;
      
      if (!isPublicRoom && existingRoom.organizationId !== user.organizationId) {
        return res.status(403).json({
          success: false,
          message: 'Can only update rooms in your organization',
        });
      }
    }

    // Upload to Imgur
    let imageUrl;
    try {
      const cloudinaryResult = await uploadToCloudinary(req.file.buffer, req.file.originalname);
      imageUrl = cloudinaryResult.url;
      console.log('Room image uploaded to Cloudinary:', imageUrl);
    } catch (uploadError) {
      console.error('Failed to upload room image to Cloudinary:', uploadError.message);
      return res.status(500).json({
        success: false,
        message: 'Failed to upload image to Cloudinary',
      });
    }

    // Update room with new image URL
    const room = await prisma.room.update({
      where: { id },
      data: { imageUrl },
    });

    return res.json({
      success: true,
      message: 'Image uploaded successfully',
      data: { imageUrl: room.imageUrl },
    });
  } catch (error) {
    console.error('Upload room image error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to upload image',
    });
  }
}

/**
 * Delete room image
 * DELETE /api/rooms/:id/image
 */
async function deleteRoomImage(req, res) {
  try {
    const { id } = req.params;
    const user = req.user;

    // Check if room exists
    const existingRoom = await prisma.room.findUnique({
      where: { id },
    });

    if (!existingRoom) {
      return res.status(404).json({
        success: false,
        message: 'Room not found',
      });
    }

    // Check permissions
    if (user.role === 'org_admin') {
      // Org admin can delete images from:
      // 1. Public rooms (organizationId: null)
      // 2. Rooms in their own organization
      const isPublicRoom = !existingRoom.organizationId;
      
      if (!isPublicRoom && existingRoom.organizationId !== user.organizationId) {
        return res.status(403).json({
          success: false,
          message: 'Can only update rooms in your organization',
        });
      }
    }

    // Delete Cloudinary image if exists
    if (existingRoom.imageUrl && existingRoom.imageUrl.includes('cloudinary.com')) {
      const publicId = extractCloudinaryPublicId(existingRoom.imageUrl);
      if (publicId) {
        await deleteFromCloudinary(publicId);
      }
    }

    // Update room to remove image URL
    await prisma.room.update({
      where: { id },
      data: { imageUrl: null },
    });

    return res.json({
      success: true,
      message: 'Image deleted successfully',
    });
  } catch (error) {
    console.error('Delete room image error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete image',
    });
  }
}

function extractCloudinaryPublicId(url) {
  const match = url.match(/aturuang\/([^.]+)/);
  return match ? `aturuang/${match[1]}` : null;
}

module.exports = {
  getAllRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom,
  uploadRoomImage,
  deleteRoomImage,
};
