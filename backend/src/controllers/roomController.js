const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Room Controller
 * Menangani operasi terkait ruang rapat
 */

/**
 * Get all rooms
 * GET /api/rooms
 */
async function getAllRooms(req, res) {
  try {
    const rooms = await prisma.room.findMany({
      orderBy: {
        name: 'asc',
      },
    });

    return res.json({
      success: true,
      data: { rooms },
    });
  } catch (error) {
    console.error('Get rooms error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch rooms',
    });
  }
}

/**
 * Get room by ID
 * GET /api/rooms/:id
 */
async function getRoomById(req, res) {
  try {
    const { id } = req.params;

    const room = await prisma.room.findUnique({
      where: { id },
      include: {
        bookings: {
          where: {
            date: {
              gte: new Date(),
            },
          },
          orderBy: {
            date: 'asc',
          },
          take: 10,
        },
      },
    });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found',
      });
    }

    return res.json({
      success: true,
      data: { room },
    });
  } catch (error) {
    console.error('Get room error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch room',
    });
  }
}

module.exports = {
  getAllRooms,
  getRoomById,
};
