const express = require("express");
const router = express.Router();
const multer = require("multer");
const { storage } = require('../config/cloudinary');
const {
  getShopCategories,
  createShopCategory,
  updateShopCategory,
  deleteShopCategory,
  getShopSubCategories,
  createShopSubCategory,
  updateShopSubCategory,
  deleteShopSubCategory,
  getShopProducts,
  getShopProduct,
  createShopProduct,
  updateShopProduct,
  deleteShopProduct,
  getShopOrders,
  updateShopOrderStatus,
  getNestedShopCategories
} = require('../controllers/shopController');

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }
});

// Upload multiple images
const uploadImages = upload.fields([
  { name: 'mainImage', maxCount: 1 },
  { name: 'image1', maxCount: 1 },
  { name: 'image2', maxCount: 1 },
  { name: 'image3', maxCount: 1 },
  { name: 'image4', maxCount: 1 },
  { name: 'image5', maxCount: 1 },
  { name: 'image6', maxCount: 1 },
  { name: 'image7', maxCount: 1 },
  { name: 'image8', maxCount: 1 },
  { name: 'image9', maxCount: 1 },
  { name: 'image', maxCount: 1 },
  { name: 'video', maxCount: 1 }
]);

const handleUpload = (req, res, next) => {
  uploadImages(req, res, function (err) {
    if (err) return res.status(500).json({ error: 'File upload error', details: err.message });
    next();
  });
};

// --- Shop Categories Routes ---
router.get("/categories", getShopCategories);
router.get("/categories/nested", getNestedShopCategories);
router.post("/categories", handleUpload, createShopCategory);
router.put("/categories/:id", handleUpload, updateShopCategory);
router.delete("/categories/:id", deleteShopCategory);

// --- Shop Subcategories Routes ---
router.get("/categories/:categoryId/subcategories", getShopSubCategories);
router.post("/categories/:categoryId/subcategories", handleUpload, createShopSubCategory);
router.put("/subcategories/:id", handleUpload, updateShopSubCategory);
router.delete("/subcategories/:id", deleteShopSubCategory);

// --- Shop Products Routes ---
router.get("/", getShopProducts);
router.get("/products", getShopProducts);
router.get("/products/:id", getShopProduct); // get single product
router.post("/products/upload", handleUpload, createShopProduct);
router.put("/products/:id", handleUpload, updateShopProduct); // update product
router.delete("/products/:id", deleteShopProduct);

// --- Shop Orders Routes ---
router.get("/orders", getShopOrders);
router.put("/orders/:id/status", updateShopOrderStatus);

module.exports = router;