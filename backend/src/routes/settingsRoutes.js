const express = require('express');
const { getSettings, updateSettings } = require('../controllers/settingsController');
const { authenticateToken, requireSuperadmin } = require('../utils/auth');

const router = express.Router();

// GET /api/settings - Get all settings (public)
router.get('/', getSettings);

// PUT /api/settings - Update settings (superadmin only)
router.put('/', authenticateToken, requireSuperadmin, updateSettings);

module.exports = router;
