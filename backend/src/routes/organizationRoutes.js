const express = require('express');
const router = express.Router();
const {
  getAllOrganizations,
  getOrganizationById,
  createOrganization,
  updateOrganization,
  deleteOrganization,
  getOrganizationStats,
} = require('../controllers/organizationController');
const { authenticateToken, requireSuperadmin } = require('../utils/auth');

/**
 * Organization Routes
 * /api/organizations
 * All routes require superadmin access
 */

// Apply authentication and superadmin requirement to all routes
router.use(authenticateToken);
router.use(requireSuperadmin);

// GET /api/organizations - List all organizations
router.get('/', getAllOrganizations);

// POST /api/organizations - Create new organization
router.post('/', createOrganization);

// GET /api/organizations/:id - Get organization details
router.get('/:id', getOrganizationById);

// PUT /api/organizations/:id - Update organization
router.put('/:id', updateOrganization);

// DELETE /api/organizations/:id - Deactivate organization
router.delete('/:id', deleteOrganization);

// GET /api/organizations/:id/stats - Get organization stats
router.get('/:id/stats', getOrganizationStats);

module.exports = router;
