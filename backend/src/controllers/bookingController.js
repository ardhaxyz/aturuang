const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { checkConflict } = require('../utils/validation');

/**
 * Booking Controller
 * Menangani operasi terkait booking ruang rapat
 */

/**
 * Get all bookings with optional filters
 * GET /api/bookings
 */
async function getAllBookings(req, res) {
  try {
    const { roomId, status, startDate, endDate, limit = 100 } = req.query;

    const where = {};

    // Filter by room
    if (roomId) {
      where.roomId = roomId;
    }

    // Filter by status
    if (status) {
      where.status = status;
    }

    // Filter by date range
    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = new Date(startDate);
      }
      if (endDate) {
        where.date.lte = new Date(endDate);
      }
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        room: {
          select: {
            id: true,
            name: true,
            capacity: true,
            facilities: true,
          },
        },
      },
      orderBy: [
        { date: 'asc' },
        { startTime: 'asc' },
      ],
      take: parseInt(limit),
    });

    return res.json({
      success: true,
      data: { bookings },
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings',
    });
  }
}

/**
 * Get booking by ID
 * GET /api/bookings/:id
 */
async function getBookingById(req, res) {
  try {
    const { id } = req.params;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        room: true,
      },
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    return res.json({
      success: true,
      data: { booking },
    });
  } catch (error) {
    console.error('Get booking error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch booking',
    });
  }
}

/**
 * Create new booking
 * POST /api/bookings
 */
async function createBooking(req, res) {
  try {
    const { roomId, date, startTime, endTime, title, bookerName, bookerEmail } = req.body;

    // Parse date
    const bookingDate = new Date(date);

    // Combine date and time
    const startDateTime = new Date(bookingDate);
    const [startHour, startMin] = startTime.split(':');
    startDateTime.setHours(parseInt(startHour), parseInt(startMin), 0, 0);

    const endDateTime = new Date(bookingDate);
    const [endHour, endMin] = endTime.split(':');
    endDateTime.setHours(parseInt(endHour), parseInt(endMin), 0, 0);

    // Validate time range
    if (startDateTime >= endDateTime) {
      return res.status(400).json({
        success: false,
        message: 'End time must be after start time',
      });
    }

    // Check if room exists
    const room = await prisma.room.findUnique({
      where: { id: roomId },
    });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found',
      });
    }

    // Get existing bookings for conflict detection
    const existingBookings = await prisma.booking.findMany({
      where: {
        roomId,
        status: { not: 'rejected' },
      },
    });

    // Check for conflicts
    const conflict = checkConflict(existingBookings, date, startTime, endTime, roomId);

    if (conflict) {
      return res.status(409).json({
        success: false,
        message: 'Time slot is already booked',
        conflict: conflict.existingBooking,
      });
    }

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        roomId,
        date: startDateTime,
        startTime,
        endTime,
        title,
        bookerName,
        bookerEmail: bookerEmail || null,
        status: 'pending', // Default status
      },
      include: {
        room: true,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: { booking },
    });
  } catch (error) {
    console.error('Create booking error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create booking',
    });
  }
}

/**
 * Approve or reject booking (Admin only)
 * PATCH /api/bookings/:id/approve
 */
async function approveBooking(req, res) {
  try {
    const { id } = req.params;
    const { action } = req.body; // 'approve' or 'reject'

    // Validate booking exists
    const existingBooking = await prisma.booking.findUnique({
      where: { id },
    });

    if (!existingBooking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    // Update booking status
    const booking = await prisma.booking.update({
      where: { id },
      data: {
        status: action === 'approve' ? 'approved' : 'rejected',
      },
      include: {
        room: true,
      },
    });

    return res.json({
      success: true,
      message: `Booking ${action === 'approve' ? 'approved' : 'rejected'} successfully`,
      data: { booking },
    });
  } catch (error) {
    console.error('Approve booking error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update booking',
    });
  }
}

/**
 * Delete booking (Admin only)
 * DELETE /api/bookings/:id
 */
async function deleteBooking(req, res) {
  try {
    const { id } = req.params;

    // Validate booking exists
    const existingBooking = await prisma.booking.findUnique({
      where: { id },
    });

    if (!existingBooking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    // Delete booking
    await prisma.booking.delete({
      where: { id },
    });

    return res.json({
      success: true,
      message: 'Booking deleted successfully',
    });
  } catch (error) {
    console.error('Delete booking error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete booking',
    });
  }
}

module.exports = {
  getAllBookings,
  getBookingById,
  createBooking,
  approveBooking,
  deleteBooking,
};
