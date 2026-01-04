const mongoose = require('mongoose');

const shopProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  material: { type: String, required: true, trim: true },
  size: { type: String, required: true, trim: true },
  colour: { type: String, required: true, trim: true },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ShopCategory',
    required: true
  },
  subCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ShopSubCategory',
    required: false
  },
  utility: { type: String, required: true, trim: true },
  care: { type: String, required: true, trim: true },
  included: [{ type: String, trim: true }],
  excluded: [{ type: String, trim: true }],
  price: { type: Number, required: true },
  regularPrice: { type: Number, required: true },
  image: { type: String, required: true },
  images: [{ type: String }],
  inStock: { type: Boolean, default: true },
  stock: { type: Number, default: 10 },
  isBestSeller: { type: Boolean, default: false },
  isTrending: { type: Boolean, default: false },
  isMostLoved: { type: Boolean, default: false },
  rating: { type: Number, default: 0 },
  reviews: { type: Number, default: 0 },
  codAvailable: { type: Boolean, default: true },
  cities: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'City'
  }],
  date: { type: Date, default: Date.now }
});

const ShopProduct = mongoose.model('ShopProduct', shopProductSchema);
module.exports = ShopProduct;
