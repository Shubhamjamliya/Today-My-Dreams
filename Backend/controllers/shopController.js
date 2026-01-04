const ShopProduct = require('../models/ShopProduct');
const ShopCategory = require('../models/ShopCategory');
const ShopSubCategory = require('../models/ShopSubCategory');
const ShopOrder = require('../models/ShopOrder');
const mongoose = require('mongoose');
const fs = require('fs').promises;
const path = require('path');

// --- Helper for file uploads (similar to productController) ---
const baseUrl = process.env.BACKEND_URL || 'https://api.todaymydream.com';

// --- Shop Categories ---
const getShopCategories = async (req, res) => {
  try {
    const categories = await ShopCategory.find().sort({ sortOrder: 1 });
    res.json({ categories });
  } catch (error) {
    res.status(500).json({ message: "Error fetching shop categories", error: error.message });
  }
};

const getNestedShopCategories = async (req, res) => {
  try {
    const categories = await ShopCategory.find().sort({ sortOrder: 1 }).lean();
    const categoriesWithSubs = await Promise.all(categories.map(async (cat) => {
      const subCategories = await ShopSubCategory.find({ parentCategory: cat._id }).sort({ sortOrder: 1 });
      return { ...cat, subCategories };
    }));
    res.json({ data: categoriesWithSubs });
  } catch (error) {
    res.status(500).json({ message: "Error fetching nested shop categories", error: error.message });
  }
};

const createShopCategory = async (req, res) => {
  try {
    const { name, description, sortOrder } = req.body;
    const image = req.files?.image?.[0]?.path ? `${baseUrl}/todaymydream/data/categories/${req.files.image[0].filename}` : '';
    const video = req.files?.video?.[0]?.path ? `${baseUrl}/todaymydream/data/videos/${req.files.video[0].filename}` : '';

    const category = new ShopCategory({ name, description, sortOrder, image, video });
    await category.save();
    res.status(201).json({ message: "Shop category created", category });
  } catch (error) {
    res.status(500).json({ message: "Error creating shop category", error: error.message });
  }
};

const updateShopCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };
    if (req.files?.image?.[0]) {
      updates.image = `${baseUrl}/todaymydream/data/categories/${req.files.image[0].filename}`;
    }
    if (req.files?.video?.[0]) {
      updates.video = `${baseUrl}/todaymydream/data/videos/${req.files.video[0].filename}`;
    }
    const category = await ShopCategory.findByIdAndUpdate(id, updates, { new: true });
    res.json({ message: "Shop category updated", category });
  } catch (error) {
    res.status(500).json({ message: "Error updating shop category", error: error.message });
  }
};

const deleteShopCategory = async (req, res) => {
  try {
    await ShopCategory.findByIdAndDelete(req.params.id);
    res.json({ message: "Shop category deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting shop category", error: error.message });
  }
};

// --- Shop Subcategories ---
const getShopSubCategories = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const query = categoryId ? { parentCategory: categoryId } : {};
    const subcategories = await ShopSubCategory.find(query).sort({ sortOrder: 1 });
    res.json(subcategories);
  } catch (error) {
    res.status(500).json({ message: "Error fetching shop subcategories", error: error.message });
  }
};

const createShopSubCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const image = req.files?.image?.[0]?.path || '';
    const video = req.files?.video?.[0]?.path || '';

    const subCategory = new ShopSubCategory({
      ...req.body,
      parentCategory: categoryId,
      image,
      video
    });

    await subCategory.save();
    res.status(201).json(subCategory);
  } catch (error) {
    console.error("Error creating subcategory:", error);
    res.status(500).json({ message: "Error creating shop subcategory", error: error.message });
  }
};

const updateShopSubCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };
    if (req.files?.image?.[0]) {
      updates.image = req.files.image[0].path;
    }
    if (req.files?.video?.[0]) {
      updates.video = req.files.video[0].path;
    }
    const subCategory = await ShopSubCategory.findByIdAndUpdate(id, updates, { new: true });
    res.json(subCategory);
  } catch (error) {
    res.status(500).json({ message: "Error updating shop subcategory", error: error.message });
  }
};

const deleteShopSubCategory = async (req, res) => {
  try {
    await ShopSubCategory.findByIdAndDelete(req.params.id);
    res.json({ message: "Shop subcategory deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting shop subcategory", error: error.message });
  }
};

// --- Shop Products ---
const getShopProducts = async (req, res) => {
  try {
    const products = await ShopProduct.find()
      .populate('category', 'name')
      .populate('subCategory', 'name')
      .sort({ date: -1 });
    res.json({ products });
  } catch (error) {
    res.status(500).json({ message: "Error fetching shop products", error: error.message });
  }
};

const getShopProduct = async (req, res) => {
  try {
    const product = await ShopProduct.findById(req.params.id)
      .populate('category')
      .populate('subCategory');

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json({ product });
  } catch (error) {
    res.status(500).json({ message: "Error fetching shop product", error: error.message });
  }
};

const updateShopProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    // Handle Images
    const imagePaths = [];
    // If new files are uploaded, use them. 
    // This logic might need refinement: 
    // - If mainImage is uploaded, replace index 0.
    // - If imageN is uploaded, replace index N.
    // However, for simplicity and common usage, if files are sent, we might be appending or replacing.
    // Ideally, we'd merge with existing images or replace specific indices.

    // Fetch existing product to merge images if needed, or just handle what's sent.
    // For now, let's assume if mainImage is present, we update it.

    // Better strategy for update:
    // If 'image' field is present in body (as string), it might be existing URL.
    // If files are present, they are new uploads.

    // Existing implementation of createShopProduct puts all paths in 'images' array.
    // Let's grab the existing product first.
    const product = await ShopProduct.findById(id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const currentImages = product.images || [];

    if (req.files.mainImage?.[0]) currentImages[0] = req.files.mainImage[0].path;
    for (let i = 1; i <= 9; i++) {
      if (req.files[`image${i}`]?.[0]) currentImages[i] = req.files[`image${i}`][0].path;
    }

    // Filter out nulls/undefined if array was sparse (though it init to empty)
    // Actually, we want to keep positions consistent? Usually yes.

    updates.images = currentImages;
    // Main image is usually the first one
    if (currentImages[0]) updates.image = currentImages[0];

    // Parse JSON fields
    if (updates.included && typeof updates.included === 'string') updates.included = JSON.parse(updates.included);
    if (updates.excluded && typeof updates.excluded === 'string') updates.excluded = JSON.parse(updates.excluded);

    const updatedProduct = await ShopProduct.findByIdAndUpdate(id, updates, { new: true });
    res.json({ message: "Shop product updated", product: updatedProduct });
  } catch (error) {
    res.status(500).json({ message: "Error updating shop product", error: error.message });
  }
};

const createShopProduct = async (req, res) => {
  try {
    const productData = req.body;
    const imagePaths = [];
    if (req.files.mainImage?.[0]) imagePaths.push(req.files.mainImage[0].path);
    for (let i = 1; i <= 9; i++) {
      if (req.files[`image${i}`]?.[0]) imagePaths.push(req.files[`image${i}`][0].path);
    }

    const product = new ShopProduct({
      ...productData,
      image: imagePaths[0],
      images: imagePaths,
      included: productData.included ? JSON.parse(productData.included) : [],
      excluded: productData.excluded ? JSON.parse(productData.excluded) : [],
      price: parseFloat(productData.price),
      regularPrice: parseFloat(productData.regularPrice),
      stock: Number(productData.stock) || 0
    });
    await product.save();
    res.status(201).json({ message: "Shop product created", product });
  } catch (error) {
    res.status(500).json({ message: "Error creating shop product", error: error.message });
  }
};

// --- Shop Orders ---
const getShopOrders = async (req, res) => {
  try {
    const orders = await ShopOrder.find().sort({ createdAt: -1 });
    res.json({ orders });
  } catch (error) {
    res.status(500).json({ message: "Error fetching shop orders", error: error.message });
  }
};

module.exports = {
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
};
