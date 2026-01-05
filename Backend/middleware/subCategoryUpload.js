const multer = require('multer');
const { getStorage } = require('../config/cloudinary');

// Configure storage for subcategory images
const storage = getStorage('subcategories');

// Multer configuration for subcategory image upload
const uploadSubCategoryImage = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1 // Only 1 file
  },
  fileFilter: (req, file, cb) => {
    // Check file type (images and videos)
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image and video files are allowed!'), false);
    }
  }
}).single('image');

// Middleware for handling subcategory image upload
const handleSubCategoryImage = (req, res, next) => {
  uploadSubCategoryImage(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'File too large. Maximum size is 5MB.'
        });
      }
      return res.status(400).json({
        success: false,
        message: 'File upload error: ' + err.message
      });
    } else if (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }

    // No transformation needed as file.path contains Cloudinary URL
    next();
  });
};

module.exports = {
  handleSubCategoryImage,
  cloudinary: null
};
