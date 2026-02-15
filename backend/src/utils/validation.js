const { z } = require('zod');

/**
 * Validation Schemas untuk Booking
 */
const bookingSchema = z.object({
  roomId: z.string().min(1, 'Room ID is required'),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid date format',
  }),
  startTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Invalid time format (HH:MM)',
  }),
  endTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Invalid time format (HH:MM)',
  }),
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  bookerName: z.string().min(1, 'Booker name is required').max(100, 'Name too long'),
  bookerEmail: z.string().email('Invalid email').optional().or(z.literal('')),
});

/**
 * Validation Schemas untuk Approval
 */
const approvalSchema = z.object({
  action: z.enum(['approve', 'reject'], {
    errorMap: () => ({ message: 'Action must be either approve or reject' }),
  }),
});

/**
 * Validation Helper Middleware
 */
function validate(schema) {
  return (req, res, next) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.errors.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        });
      }
      next(error);
    }
  };
}

/**
 * Check for booking conflict
 * @param {Object} bookings - Array of existing bookings
 * @param {Date} date - Booking date
 * @param {string} startTime - Start time (HH:MM)
 * @param {string} endTime - End time (HH:MM)
 * @param {string} roomId - Room ID
 * @returns {Object|null} Conflict details or null
 */
function checkConflict(bookings, date, startTime, endTime, roomId) {
  const newStart = parseInt(startTime.split(':')[0]) * 60 + parseInt(startTime.split(':')[1]);
  const newEnd = parseInt(endTime.split(':')[0]) * 60 + parseInt(endTime.split(':')[1]);

  for (const booking of bookings) {
    // Skip if same room, different date, already rejected, or same booking
    if (booking.roomId !== roomId) continue;
    if (booking.date !== date) continue;
    if (booking.status === 'rejected') continue;

    const existingStart = parseInt(booking.startTime.split(':')[0]) * 60 + parseInt(booking.startTime.split(':')[1]);
    const existingEnd = parseInt(booking.endTime.split(':')[0]) * 60 + parseInt(booking.endTime.split(':')[1]);

    // Check for overlap: (newStart < existingEnd) AND (newEnd > existingStart)
    if (newStart < existingEnd && newEnd > existingStart) {
      return {
        conflict: true,
        existingBooking: booking,
      };
    }
  }

  return null;
}

module.exports = {
  bookingSchema,
  approvalSchema,
  validate,
  checkConflict,
};
