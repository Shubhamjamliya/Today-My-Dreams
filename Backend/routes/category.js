const express = require('express');
const router = express.Router();
const multer = require('multer');
const { isAdmin, authenticateToken } = require('../middleware/auth');
const categoryController = require('../controllers/categoryController');
const { getStorage } = require('../config/cloudinary');

const SubCategory = require('../models/SubCategory');

// Configure storage for categories
const storage = getStorage('categories');

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit for videos
  },
  fileFilter: (req, file, cb) => {
    // Accept images and videos
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image and video files are allowed!'), false);
    }
  }
});

// Upload multiple files (image + video)
const uploadFiles = upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'video', maxCount: 1 }
]);

// Middleware to handle multer upload
const handleUpload = (req, res, next) => {
  uploadFiles(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: 'File upload error', details: err.message });
    } else if (err) {
      return res.status(500).json({ error: 'File upload error', details: err.message });
    }
    next();
  });
};

// Public routes
router.get('/', categoryController.getAllCategories);
router.get('/nested', categoryController.getNestedCategories);
router.get('/:id', categoryController.getCategory);

// Admin routes - get all categories (including inactive)
router.get('/admin/all', authenticateToken, isAdmin, categoryController.getAllCategoriesAdmin);

// Protected admin routes with file upload
// Removed transformPathsToUrls middleware as Cloudinary returns URL in path
router.post('/', authenticateToken, isAdmin, handleUpload, categoryController.createCategory);
router.post('/upload', authenticateToken, isAdmin, handleUpload, categoryController.createCategory);
router.post('/update-order', authenticateToken, isAdmin, categoryController.updateCategoryOrder);
router.put('/:id', authenticateToken, isAdmin, handleUpload, categoryController.updateCategory);
router.put('/:id/upload', authenticateToken, isAdmin, handleUpload, categoryController.updateCategory);
router.delete('/:id', authenticateToken, isAdmin, categoryController.deleteCategory);

module.exports = router;