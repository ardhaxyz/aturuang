const express = require('express');
const router = express.Router();
const { login, getMe } = require('../controllers/authController');
const { authenticateToken } = require('../utils/auth');

/**
 * Authentication Routes
 * /api/auth
 */

// POST /api/auth - Login with password
router.post('/auth', login);

// GET /api/me - Get current user info (protected)
router.get('/me', authenticateToken, getMe);

module.exports = router;
