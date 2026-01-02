const express = require('express');
const router = express.Router();
const { isAdmin, authenticateToken } = require('../middleware/auth');

// Import the corrected middleware and controller functions
const {
  uploadMiddleware,
  getAllCarouselItems,
  getCarouselItem,
  getActiveCarouselItems,
  createCarouselItemWithFiles,
  updateCarouselItemWithFiles,
  deleteCarouselItem,
  toggleCarouselActive,
  updateCarouselOrder
} = require('../controllers/heroCarouselController');

// --- Public Routes ---
// Get all active carousel items for the public-facing site
router.get('/active', getActiveCarouselItems);

// Get all carousel items (useful for an admin panel)
router.get('/', getAllCarouselItems);


// --- Protected Admin Routes ---
// All routes below this point require authentication and admin privileges
router.use(authenticateToken);
router.use(isAdmin);

// Get a single carousel item by its ID
router.get('/:id', getCarouselItem);

// Create a new carousel item (with image upload)
router.post('/', (req, res, next) => {
  uploadMiddleware(req, res, (err) => {
    if (err) return next(err);
    
    const baseUrl = process.env.BACKEND_URL || 'https://api.todaymydream.com';
    
    if (req.files) {
      Object.keys(req.files).forEach(key => {
        req.files[key].forEach(file => {
          const filename = file.filename;
          file.path = `${baseUrl}/todaymydream/data/hero-carousel/${filename}`;
        });
      });
    }
    next();
  });
}, createCarouselItemWithFiles);

// Update an existing carousel item by ID (with optional new image upload)
router.put('/:id', (req, res, next) => {
  uploadMiddleware(req, res, (err) => {
    if (err) return next(err);
    
    const baseUrl = process.env.BACKEND_URL || 'https://api.todaymydream.com';
    
    if (req.files) {
      Object.keys(req.files).forEach(key => {
        req.files[key].forEach(file => {
          const filename = file.filename;
          file.path = `${baseUrl}/todaymydream/data/hero-carousel/${filename}`;
        });
      });
    }
    next();
  });
}, updateCarouselItemWithFiles);

// Delete a carousel item by ID
router.delete('/:id', deleteCarouselItem);

// Toggle the 'isActive' status of a carousel item
router.patch('/:id/toggle-active', toggleCarouselActive);

// Update the display order of all carousel items
router.post('/update-order', updateCarouselOrder);

module.exports = router;