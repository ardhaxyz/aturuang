const express = require('express');
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');
const { checkSetupStatus, createSuperadmin, importOrganizations, importUsers } = require('../controllers/setupController');

const router = express.Router();

// Ensure temp upload directory exists
const tempUploadDir = path.join(process.cwd(), 'uploads', 'temp');
if (!fs.existsSync(tempUploadDir)) {
  fs.mkdirSync(tempUploadDir, { recursive: true });
}

// Configure multer for CSV uploads
const csvStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, tempUploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${crypto.randomUUID()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const csvFilter = (req, file, cb) => {
  if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
    cb(null, true);
  } else {
    cb(new Error('Only CSV files are allowed'), false);
  }
};

const csvUpload = multer({
  storage: csvStorage,
  fileFilter: csvFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit for CSV files
  },
});

// Check if setup is needed
router.get('/status', checkSetupStatus);

// Create initial superadmin (only works if no users exist)
router.post('/', createSuperadmin);

// Import organizations from CSV
router.post('/import/organizations', csvUpload.single('file'), importOrganizations);

// Import users from CSV
router.post('/import/users', csvUpload.single('file'), importUsers);

module.exports = router;
