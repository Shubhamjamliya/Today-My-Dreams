const express = require('express');
const router = express.Router();
const { isAdmin, authenticateToken } = require('../middleware/auth');

// Import the Middleware and Controller functions
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
router.get('/active', getActiveCarouselItems);
router.get('/', getAllCarouselItems);

// --- Protected Admin Routes ---
router.use(authenticateToken);
router.use(isAdmin);

router.get('/:id', getCarouselItem);

// Use uploadMiddleware directly (it handles Cloudinary upload)
router.post('/', uploadMiddleware, createCarouselItemWithFiles);

router.put('/:id', uploadMiddleware, updateCarouselItemWithFiles);

router.delete('/:id', deleteCarouselItem);
router.patch('/:id/toggle-active', toggleCarouselActive);
router.post('/update-order', updateCarouselOrder);

module.exports = router;