const bcrypt = require('bcryptjs');

/**
 * Authentication Controller
 * Menangani login dan verifikasi password
 */

/**
 * Login dengan single password system
 * POST /api/auth
 */
async function login(req, res) {
  try {
    const { password } = req.body;

    // Validasi input
    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required',
      });
    }

    // Check admin password
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    const isAdmin = password === adminPassword;

    // Check guest password
    const guestPassword = process.env.GUEST_PASSWORD || 'guest123';
    const isGuest = password === guestPassword;

    if (!isAdmin && !isGuest) {
      return res.status(401).json({
        success: false,
        message: 'Invalid password',
      });
    }

    // Generate JWT token
    const { generateToken } = require('../utils/auth');
    const token = generateToken({
      role: isAdmin ? 'admin' : 'guest',
      timestamp: Date.now(),
    });

    return res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          role: isAdmin ? 'admin' : 'guest',
          username: isAdmin ? 'admin' : 'guest',
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
 * GET /api/me
 */
async function getMe(req, res) {
  try {
    return res.json({
      success: true,
      data: {
        user: {
          role: req.user.role,
          username: req.user.username,
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

module.exports = {
  login,
  getMe,
};
