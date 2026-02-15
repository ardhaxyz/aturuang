const express = require('express');
const router = express.Router();
const { login, getMe, changePassword } = require('../controllers/authController');
const { authenticateToken } = require('../utils/auth');

/**
 * Authentication Routes
 * /api/auth
 */

// POST /api/auth/login - Login with username and password
router.post('/login', login);

// GET /api/auth/me - Get current user info (protected)
router.get('/me', authenticateToken, getMe);

// PATCH /api/auth/change-password - Change password (protected)
router.patch('/change-password', authenticateToken, changePassword);

module.exports = router;
