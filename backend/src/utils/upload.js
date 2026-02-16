const multer = require('multer');
const { upload, handleUploadError, deleteFile, getFileUrl, roomsDir } = require('../services/cloudinaryService');

module.exports = {
  upload,
  handleUploadError,
  deleteFile,
  getFileUrl,
  roomsDir,
};
