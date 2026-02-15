const express = require('express');
const { checkSetupStatus, createSuperadmin } = require('../controllers/setupController');

const router = express.Router();

// Check if setup is needed
router.get('/status', checkSetupStatus);

// Create initial superadmin (only works if no users exist)
router.post('/', createSuperadmin);

module.exports = router;
