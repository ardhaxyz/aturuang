const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../utils/auth');

const prisma = new PrismaClient();

/**
 * Authentication Controller
 * Database-based authentication with multi-role support
 */

/**
 * Login with username and password
 * POST /api/auth/login
 */
async function login(req, res) {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required',
      });
    }

    // Find user by username
    const user = await prisma.user.findUnique({
      where: { username },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Check if user exists
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password',
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated. Contact administrator.',
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password',
      });
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      username: user.username,
      role: user.role,
      organizationId: user.organizationId,
    });

    return res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          organization: user.organization,
        },
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
}

/**
 * Get current user info
 * GET /api/auth/me
 */
async function getMe(req, res) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    return res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
          organization: user.organization,
        },
      },
    });
  } catch (error) {
    console.error('Get user error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
}

/**
 * Change password
 * PATCH /api/auth/change-password
 */
async function changePassword(req, res) {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.userId;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters',
      });
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash },
    });

    return res.json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    console.error('Change password error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
}

module.exports = {
  login,
  getMe,
  changePassword,
};
