const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  resetUserPassword,
} = require('../controllers/userController');
const { authenticateToken, requireRole } = require('../utils/auth');

/**
 * User Routes
 * /api/users
 */

// Apply authentication to all routes
router.use(authenticateToken);

// All routes require admin access (superadmin or org_admin)
router.use(requireRole('superadmin', 'org_admin'));

// GET /api/users - List all users
router.get('/', getAllUsers);

// POST /api/users - Create new user
router.post('/', createUser);

// GET /api/users/:id - Get user details
router.get('/:id', getUserById);

// PUT /api/users/:id - Update user
router.put('/:id', updateUser);

// DELETE /api/users/:id - Deactivate user
router.delete('/:id', deleteUser);

// POST /api/users/:id/reset-password - Reset user password
router.post('/:id/reset-password', resetUserPassword);

module.exports = router;
