const mongoose = require("mongoose");

const shopCategorySchema = new mongoose.Schema({
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

shopCategorySchema.index({ name: 1 });
shopCategorySchema.index({ slug: 1 });

shopCategorySchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
  next();
});

module.exports = mongoose.model('ShopCategory', shopCategorySchema);
