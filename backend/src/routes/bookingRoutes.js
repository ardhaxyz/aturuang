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
router.get('/bookings', authenticateToken, getAllBookings);

// GET /api/bookings/:id - Get booking by ID (protected)
router.get('/bookings/:id', authenticateToken, getBookingById);

// POST /api/bookings - Create new booking (protected)
router.post('/bookings', authenticateToken, validate(bookingSchema), createBooking);

// PATCH /api/bookings/:id/approve - Approve/reject booking (admin only)
router.patch(
  '/bookings/:id/approve',
  authenticateToken,
  requireAdmin,
  validate(approvalSchema),
  approveBooking
);

// DELETE /api/bookings/:id - Delete booking (admin only)
router.delete('/bookings/:id', authenticateToken, requireAdmin, deleteBooking);

module.exports = router;
