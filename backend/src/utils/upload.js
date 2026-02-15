const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// Ensure upload directories exist
const uploadDir = process.env.UPLOAD_DIR || './uploads';
const roomsDir = path.join(uploadDir, 'rooms');

// Create directories if they don't exist
[uploadDir, roomsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
});

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, roomsDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${crypto.randomUUID()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

// File filter - only allow images
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPG and PNG files are allowed'), false);
  }
};

// Configure multer
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 2 * 1024 * 1024, // 2MB default
  },
});

// Error handling middleware for multer
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 2MB.',
      });
    }
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
  
  if (err) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
  
  next();
};

// Delete file utility
const deleteFile = (filename) => {
  return new Promise((resolve, reject) => {
    const filePath = path.join(roomsDir, filename);
    fs.unlink(filePath, (err) => {
      if (err) {
        if (err.code === 'ENOENT') {
          resolve(false); // File didn't exist
        } else {
          reject(err);
        }
      } else {
        resolve(true);
      }
    });
  });
};

// Get file URL
const getFileUrl = (filename) => {
  return `/uploads/rooms/${filename}`;
};

module.exports = {
  upload,
  handleUploadError,
  deleteFile,
  getFileUrl,
  roomsDir,
};
