const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

/**
 * Setup Controller
 * Handles initial system setup - creates first superadmin
 */

/**
 * Check if setup is needed
 * GET /api/setup/status
 */
async function checkSetupStatus(req, res) {
  try {
    const userCount = await prisma.user.count();
    
    return res.json({
      success: true,
      data: {
        needsSetup: userCount === 0,
        message: userCount === 0 
          ? 'System needs initial setup. Create a superadmin account.'
          : 'System is already set up.',
      },
    });
  } catch (error) {
    console.error('Check setup status error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to check setup status',
    });
  }
}

/**
 * Create initial superadmin
 * POST /api/setup
 * Body: { username, password }
 */
async function createSuperadmin(req, res) {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required',
      });
    }

    if (username.length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Username must be at least 3 characters',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters',
      });
    }

    // Check if any users exist
    const userCount = await prisma.user.count();
    if (userCount > 0) {
      return res.status(403).json({
        success: false,
        message: 'Setup has already been completed. Cannot create another superadmin via setup.',
      });
    }

    // Check if username is taken
    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Username is already taken',
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create superadmin
    const user = await prisma.user.create({
      data: {
        username,
        passwordHash,
        role: 'superadmin',
        isActive: true,
        // No organizationId for superadmin
      },
    });

    console.log('✅ Superadmin created:', user.username);

    return res.status(201).json({
      success: true,
      message: 'Superadmin created successfully',
      data: {
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
        },
      },
    });
  } catch (error) {
    console.error('Create superadmin error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create superadmin',
    });
  }
}

module.exports = {
  checkSetupStatus,
  createSuperadmin,
};
