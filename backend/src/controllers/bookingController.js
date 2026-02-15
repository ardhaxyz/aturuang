const { PrismaClient } = require('@prisma/client');
const { checkConflict } = require('../utils/validation');

const prisma = new PrismaClient();

/**
 * Booking Controller
 * Handles booking operations with organization-based access control
 */

/**
 * Get all bookings with optional filters
 * GET /api/bookings
 */
async function getAllBookings(req, res) {
  try {
    const user = req.user;
    const { roomId, status, startDate, endDate, limit = 100 } = req.query;

    const where = {};

    // Filter by room
    if (roomId) {
      where.roomId = roomId;
    }

    // Filter by status
    if (status) {
      where.status = status;
    }

    // Filter by date range
    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = startDate;
      }
      if (endDate) {
        where.date.lte = endDate;
      }
    }

    // Apply organization-based access control
    if (user.role !== 'superadmin') {
      // Fetch fresh organizationId from database (in case token is stale)
      const freshUser = await prisma.user.findUnique({
        where: { id: user.userId },
        select: { organizationId: true },
      });
      
      const organizationId = freshUser?.organizationId || user.organizationId;
      
      where.room = {
        OR: [
          { isPublic: true },
          { organizationId: organizationId },
        ],
      };
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        room: {
          select: {
            id: true,
            name: true,
            capacity: true,
            facilities: true,
            organizationId: true,
            isPublic: true,
          },
        },
      },
      orderBy: [
        { date: 'asc' },
        { startTime: 'asc' },
      ],
      take: parseInt(limit),
    });

    // Parse facilities JSON string to array for each booking
    const bookingsWithParsedFacilities = bookings.map(booking => ({
      ...booking,
      room: booking.room ? {
        ...booking.room,
        facilities: booking.room.facilities ? JSON.parse(booking.room.facilities) : [],
      } : null,
    }));

    return res.json({
      success: true,
      data: { bookings: bookingsWithParsedFacilities },
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings',
    });
  }
}

/**
 * Get booking by ID
 * GET /api/bookings/:id
 */
async function getBookingById(req, res) {
  try {
    const { id } = req.params;
    const user = req.user;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        room: true,
      },
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    // Check access permissions
    if (user.role !== 'superadmin') {
      const room = await prisma.room.findUnique({
        where: { id: booking.roomId },
      });
      
      const hasAccess = room.isPublic || room.organizationId === user.organizationId;
      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: 'Access denied',
        });
      }
    }

    // Parse facilities JSON string to array
    const bookingWithParsedFacilities = {
      ...booking,
      room: booking.room ? {
        ...booking.room,
        facilities: booking.room.facilities ? JSON.parse(booking.room.facilities) : [],
      } : null,
    };

    return res.json({
      success: true,
      data: { booking: bookingWithParsedFacilities },
    });
  } catch (error) {
    console.error('Get booking error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch booking',
    });
  }
}

/**
 * Create new booking
 * POST /api/bookings
 */
async function createBooking(req, res) {
  try {
    const user = req.user;
    const { roomId, date, startTime, endTime, title, bookerName, bookerEmail } = req.body;

    // Validate time range (compare as time strings)
    if (startTime >= endTime) {
      return res.status(400).json({
        success: false,
        message: 'End time must be after start time',
      });
    }

    // Check if room exists and user has access
    const room = await prisma.room.findUnique({
      where: { id: roomId },
    });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found',
      });
    }

    // Check access permissions
    if (user.role !== 'superadmin') {
      // Fetch fresh organizationId from database (in case token is stale)
      const freshUser = await prisma.user.findUnique({
        where: { id: user.userId },
        select: { organizationId: true },
      });
      
      const organizationId = freshUser?.organizationId || user.organizationId;
      const hasAccess = room.isPublic || room.organizationId === organizationId;
      
      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: 'You do not have access to book this room',
        });
      }
    }

    // Get existing bookings for conflict detection
    const existingBookings = await prisma.booking.findMany({
      where: {
        roomId,
        status: { not: 'rejected' },
      },
    });

    // Check for conflicts
    const conflict = checkConflict(existingBookings, date, startTime, endTime, roomId);

    if (conflict) {
      return res.status(409).json({
        success: false,
        message: 'Time slot is already booked',
        conflict: conflict.existingBooking,
      });
    }

    // Create booking (date is stored as string in YYYY-MM-DD format)
    const booking = await prisma.booking.create({
      data: {
        roomId,
        date,
        startTime,
        endTime,
        title,
        bookerName,
        bookerEmail: bookerEmail || null,
        status: 'pending', // Default status
      },
      include: {
        room: true,
      },
    });

    // Parse facilities JSON string to array
    const bookingWithParsedFacilities = {
      ...booking,
      room: booking.room ? {
        ...booking.room,
        facilities: booking.room.facilities ? JSON.parse(booking.room.facilities) : [],
      } : null,
    };

    return res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: { booking: bookingWithParsedFacilities },
    });
  } catch (error) {
    console.error('Create booking error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create booking',
    });
  }
}

/**
 * Approve or reject booking (Admin only)
 * PATCH /api/bookings/:id/approve
 */
async function approveBooking(req, res) {
  try {
    const { id } = req.params;
    const user = req.user;
    const { action } = req.body; // 'approve' or 'reject'

    // Validate booking exists
    const existingBooking = await prisma.booking.findUnique({
      where: { id },
      include: {
        room: true,
      },
    });

    if (!existingBooking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    // Check approval permissions
    if (user.role !== 'superadmin') {
      // Org admin can only approve bookings for their org rooms
      if (user.role === 'org_admin') {
        if (existingBooking.room.organizationId !== user.organizationId) {
          return res.status(403).json({
            success: false,
            message: 'Can only approve bookings for your organization\'s rooms',
          });
        }
      } else {
        // Regular users cannot approve
        return res.status(403).json({
          success: false,
          message: 'Admin access required',
        });
      }
    }

    // Update booking status
    const booking = await prisma.booking.update({
      where: { id },
      data: {
        status: action === 'approve' ? 'approved' : 'rejected',
      },
      include: {
        room: true,
      },
    });

    // Parse facilities JSON string to array
    const bookingWithParsedFacilities = {
      ...booking,
      room: booking.room ? {
        ...booking.room,
        facilities: booking.room.facilities ? JSON.parse(booking.room.facilities) : [],
      } : null,
    };

    return res.json({
      success: true,
      message: `Booking ${action === 'approve' ? 'approved' : 'rejected'} successfully`,
      data: { booking: bookingWithParsedFacilities },
    });
  } catch (error) {
    console.error('Approve booking error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update booking',
    });
  }
}

/**
 * Delete booking (Admin only)
 * DELETE /api/bookings/:id
 */
async function deleteBooking(req, res) {
  try {
    const { id } = req.params;
    const user = req.user;

    // Validate booking exists
    const existingBooking = await prisma.booking.findUnique({
      where: { id },
      include: {
        room: true,
      },
    });

    if (!existingBooking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    // Check delete permissions
    if (user.role !== 'superadmin') {
      if (user.role === 'org_admin') {
        if (existingBooking.room.organizationId !== user.organizationId) {
          return res.status(403).json({
            success: false,
            message: 'Can only delete bookings for your organization\'s rooms',
          });
        }
      } else {
        return res.status(403).json({
          success: false,
          message: 'Admin access required',
        });
      }
    }

    // Delete booking
    await prisma.booking.delete({
      where: { id },
    });

    return res.json({
      success: true,
      message: 'Booking deleted successfully',
    });
  } catch (error) {
    console.error('Delete booking error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete booking',
    });
  }
}

module.exports = {
  getAllBookings,
  getBookingById,
  createBooking,
  approveBooking,
  deleteBooking,
};
