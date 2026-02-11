const express = require('express');
const router = express.Router();
const { getAllRooms, getRoomById } = require('../controllers/roomController');
const { authenticateToken } = require('../utils/auth');

/**
 * Room Routes
 * /api/rooms
 */

// GET /api/rooms - Get all rooms (public)
router.get('/rooms', getAllRooms);

// GET /api/rooms/:id - Get room by ID (public)
router.get('/rooms/:id', getRoomById);

module.exports = router;
