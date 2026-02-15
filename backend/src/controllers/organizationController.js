const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Organization Controller
 * Manages organizations (Superadmin only)
 */

/**
 * Get all organizations
 * GET /api/organizations
 */
async function getAllOrganizations(req, res) {
  try {
    const organizations = await prisma.organization.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: {
            users: true,
            rooms: true,
          },
        },
      },
    });

    return res.json({
      success: true,
      data: { organizations },
    });
  } catch (error) {
    console.error('Get organizations error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch organizations',
    });
  }
}

/**
 * Get organization by ID
 * GET /api/organizations/:id
 */
async function getOrganizationById(req, res) {
  try {
    const { id } = req.params;

    const organization = await prisma.organization.findUnique({
      where: { id },
      include: {
        users: {
          select: {
            id: true,
            username: true,
            role: true,
            isActive: true,
          },
        },
        rooms: {
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            capacity: true,
            isPublic: true,
          },
        },
        _count: {
          select: {
            users: true,
            rooms: true,
          },
        },
      },
    });

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found',
      });
    }

    return res.json({
      success: true,
      data: { organization },
    });
  } catch (error) {
    console.error('Get organization error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch organization',
    });
  }
}

/**
 * Create new organization
 * POST /api/organizations
 */
async function createOrganization(req, res) {
  try {
    const { name, description, logoUrl } = req.body;

    // Validate input
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Organization name is required',
      });
    }

    // Check if name is taken
    const existingOrg = await prisma.organization.findFirst({
      where: { name },
    });

    if (existingOrg) {
      return res.status(409).json({
        success: false,
        message: 'Organization name already exists',
      });
    }

    const organization = await prisma.organization.create({
      data: {
        name,
        description,
        logoUrl,
        isActive: true,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Organization created successfully',
      data: { organization },
    });
  } catch (error) {
    console.error('Create organization error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create organization',
    });
  }
}

/**
 * Update organization
 * PUT /api/organizations/:id
 */
async function updateOrganization(req, res) {
  try {
    const { id } = req.params;
    const { name, description, logoUrl, isActive } = req.body;

    // Check if organization exists
    const existingOrg = await prisma.organization.findUnique({
      where: { id },
    });

    if (!existingOrg) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found',
      });
    }

    // Check if new name is taken (if changing name)
    if (name && name !== existingOrg.name) {
      const nameTaken = await prisma.organization.findFirst({
        where: { name },
      });

      if (nameTaken) {
        return res.status(409).json({
          success: false,
          message: 'Organization name already exists',
        });
      }
    }

    const organization = await prisma.organization.update({
      where: { id },
      data: {
        name,
        description,
        logoUrl,
        isActive,
      },
    });

    return res.json({
      success: true,
      message: 'Organization updated successfully',
      data: { organization },
    });
  } catch (error) {
    console.error('Update organization error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update organization',
    });
  }
}

/**
 * Delete organization (soft delete via isActive)
 * DELETE /api/organizations/:id
 */
async function deleteOrganization(req, res) {
  try {
    const { id } = req.params;

    // Check if organization exists
    const existingOrg = await prisma.organization.findUnique({
      where: { id },
    });

    if (!existingOrg) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found',
      });
    }

    // Soft delete by deactivating
    await prisma.organization.update({
      where: { id },
      data: { isActive: false },
    });

    return res.json({
      success: true,
      message: 'Organization deactivated successfully',
    });
  } catch (error) {
    console.error('Delete organization error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete organization',
    });
  }
}

/**
 * Get organization stats
 * GET /api/organizations/:id/stats
 */
async function getOrganizationStats(req, res) {
  try {
    const { id } = req.params;

    const stats = await prisma.$transaction([
      // Count rooms
      prisma.room.count({
        where: { organizationId: id },
      }),
      // Count users
      prisma.user.count({
        where: { organizationId: id },
      }),
      // Count bookings for org rooms
      prisma.booking.count({
        where: {
          room: {
            organizationId: id,
          },
        },
      }),
      // Count pending approvals
      prisma.booking.count({
        where: {
          status: 'pending',
          room: {
            organizationId: id,
          },
        },
      }),
    ]);

    return res.json({
      success: true,
      data: {
        totalRooms: stats[0],
        totalUsers: stats[1],
        totalBookings: stats[2],
        pendingApprovals: stats[3],
      },
    });
  } catch (error) {
    console.error('Get organization stats error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch organization stats',
    });
  }
}

module.exports = {
  getAllOrganizations,
  getOrganizationById,
  createOrganization,
  updateOrganization,
  deleteOrganization,
  getOrganizationStats,
};
