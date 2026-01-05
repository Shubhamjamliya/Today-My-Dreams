const express = require("express");
const router = express.Router();
const multer = require('multer');
const { isAdmin, authenticateToken } = require('../middleware/auth');
const { getStorage } = require('../config/cloudinary');
const {
  getAllFeaturedProducts,
  getFeaturedProduct,
  createFeaturedProductWithFiles,
  updateFeaturedProductWithFiles,
  deleteFeaturedProduct
} = require('../controllers/featuredProductController');

// Configure storage for featured products
const storage = getStorage('featured-products');

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Configure multiple file upload fields
const uploadFields = upload.fields([
  { name: 'mainImage', maxCount: 1 },
  { name: 'image1', maxCount: 1 },
  { name: 'image2', maxCount: 1 },
  { name: 'image3', maxCount: 1 },
  { name: 'image4', maxCount: 1 },
  { name: 'image5', maxCount: 1 },
  { name: 'image6', maxCount: 1 },
  { name: 'image7', maxCount: 1 },
  { name: 'image8', maxCount: 1 },
  { name: 'image9', maxCount: 1 }
]);

// Middleware to handle multer upload
const handleUpload = (req, res, next) => {
  uploadFields(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: 'File upload error', details: err.message });
    } else if (err) {
      return res.status(500).json({ error: 'File upload error', details: err.message });
    }
    next();
  });
};

// Public routes
router.get("/", getAllFeaturedProducts);
router.get("/:id", getFeaturedProduct);

// Admin routes
// Removed transformPathsToUrls middleware
router.post("/", authenticateToken, isAdmin, handleUpload, createFeaturedProductWithFiles);
router.put("/:id", authenticateToken, isAdmin, handleUpload, updateFeaturedProductWithFiles);
router.delete("/:id", authenticateToken, isAdmin, deleteFeaturedProduct);

module.exports = router;