const express = require('express');
const router = express.Router();
const {
  getAllBookings,
  getBookingById,
  createBooking,
  approveBooking,
  deleteBooking,
} = require('../controllers/bookingController');
const { authenticateToken, requireAdmin } = require('../utils/auth');
const { validate, bookingSchema, approvalSchema } = require('../utils/validation');

/**
 * Booking Routes
 * /api/bookings
 */

// GET /api/bookings - Get all bookings (protected)
router.get('/', authenticateToken, getAllBookings);

// GET /api/bookings/:id - Get booking by ID (protected)
router.get('/:id', authenticateToken, getBookingById);

// POST /api/bookings - Create new booking (protected)
router.post('/', authenticateToken, validate(bookingSchema), createBooking);

// PATCH /api/bookings/:id/approve - Approve/reject booking (admin only)
router.patch(
  '/:id/approve',
  authenticateToken,
  requireAdmin,
  validate(approvalSchema),
  approveBooking
);

// DELETE /api/bookings/:id - Delete booking (admin only)
router.delete('/:id', authenticateToken, requireAdmin, deleteBooking);

module.exports = router;
