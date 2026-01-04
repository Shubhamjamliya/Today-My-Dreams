const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require('path');
const fs = require('fs');
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
  getShopOrders,
  getNestedShopCategories
} = require('../controllers/shopController');

// Ensure upload directories exist
const uploadDir = path.join(__dirname, '../data/products');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const categoryDir = path.join(__dirname, '../data/categories');
if (!fs.existsSync(categoryDir)) fs.mkdirSync(categoryDir, { recursive: true });

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === 'image' || file.fieldname === 'video') {
      cb(null, categoryDir);
    } else {
      cb(null, uploadDir);
    }
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

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

const transformPathsToUrls = (req, res, next) => {
  if (req.files) {
    const baseUrl = process.env.BACKEND_URL || 'https://api.todaymydream.com';
    Object.keys(req.files).forEach(key => {
      req.files[key].forEach(file => {
        const filename = file.filename;
        const subDir = (key === 'image' || key === 'video') ? 'categories' : 'products';
        file.path = `${baseUrl}/todaymydream/data/${subDir}/${filename}`;
      });
    });
  }
  next();
};

// --- Shop Categories Routes ---
router.get("/categories", getShopCategories);
router.get("/categories/nested", getNestedShopCategories);
router.post("/categories", handleUpload, transformPathsToUrls, createShopCategory);
router.put("/categories/:id", handleUpload, transformPathsToUrls, updateShopCategory);
router.delete("/categories/:id", deleteShopCategory);

// --- Shop Subcategories Routes ---
router.get("/categories/:categoryId/subcategories", getShopSubCategories);
router.post("/categories/:categoryId/subcategories", handleUpload, transformPathsToUrls, createShopSubCategory);
router.put("/subcategories/:id", handleUpload, transformPathsToUrls, updateShopSubCategory);
router.delete("/subcategories/:id", deleteShopSubCategory);

// --- Shop Products Routes ---
router.get("/", getShopProducts);
router.get("/products", getShopProducts);
router.get("/products/:id", getShopProduct); // get single product
router.post("/products/upload", handleUpload, transformPathsToUrls, createShopProduct);
router.put("/products/:id", handleUpload, transformPathsToUrls, updateShopProduct); // update product

// --- Shop Orders Routes ---
router.get("/orders", getShopOrders);

module.exports = router;