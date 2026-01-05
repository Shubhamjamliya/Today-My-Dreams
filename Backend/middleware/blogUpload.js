const multer = require('multer');
const { blogStorage } = require('../config/cloudinary');

// Multer configuration for blog featured image
const uploadFeaturedImage = multer({
  storage: blogStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 1
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
}).single('featuredImage');

// Middleware to handle blog image upload
const handleBlogImageUpload = (req, res, next) => {
  uploadFeaturedImage(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({
        success: false,
        error: 'File upload error',
        details: err.message
      });
    } else if (err) {
      return res.status(500).json({
        success: false,
        error: 'File upload error',
        details: err.message
      });
    }

    // Cloudinary URL is already in file.path, no transformation needed
    next();
  });
};

module.exports = {
  handleBlogImageUpload,
  hasCloudinaryCredentials: true
};
