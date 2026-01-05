const multer = require('multer');
const { generalStorage } = require('../config/cloudinary');

const upload = multer({
  storage: generalStorage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

module.exports = upload;