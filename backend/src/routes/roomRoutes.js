const express = require('express');
const router = express.Router();
const {
  getAllRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom,
  uploadRoomImage,
  deleteRoomImage,
} = require('../controllers/roomController');
const { authenticateToken, requireRole } = require('../utils/auth');
const { upload, handleUploadError } = require('../utils/upload');

/**
 * Room Routes
 * /api/rooms
 */

// Apply authentication to all routes
router.use(authenticateToken);

// GET /api/rooms - List all rooms (filtered by user access)
router.get('/', getAllRooms);

// GET /api/rooms/:id - Get room details
router.get('/:id', getRoomById);

// POST /api/rooms - Create new room (superadmin or org_admin)
router.post('/', requireRole('superadmin', 'org_admin'), createRoom);

// PUT /api/rooms/:id - Update room (superadmin or org_admin)
router.put('/:id', requireRole('superadmin', 'org_admin'), updateRoom);

// DELETE /api/rooms/:id - Delete room (superadmin or org_admin)
router.delete('/:id', requireRole('superadmin', 'org_admin'), deleteRoom);

// POST /api/rooms/:id/image - Upload room image
router.post(
  '/:id/image',
  requireRole('superadmin', 'org_admin'),
  upload.single('image'),
  handleUploadError,
  uploadRoomImage
);

// DELETE /api/rooms/:id/image - Delete room image
router.delete('/:id/image', requireRole('superadmin', 'org_admin'), deleteRoomImage);

module.exports = router;
