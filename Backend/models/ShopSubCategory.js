const mongoose = require("mongoose");

const shopSubCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  parentCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ShopCategory',
    required: true
  },
  image: {
    type: String,
    default: ''
  },
  video: {
    type: String,
    default: ''
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  sortOrder: {
    type: Number,
    default: 0
  },
  cities: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'City'
  }]
}, {
  timestamps: true
});

shopSubCategorySchema.index({ name: 1 });
shopSubCategorySchema.index({ slug: 1 });
shopSubCategorySchema.index({ parentCategory: 1 });

shopSubCategorySchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
  next();
});

module.exports = mongoose.model('ShopSubCategory', shopSubCategorySchema);
