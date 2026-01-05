const mongoose = require('mongoose');

const VendorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, index: true, required: true },
  phone: { type: String },
  passwordHash: { type: String, required: true },
  // Free-text submitted at registration
  cityText: { type: String },
  categoryText: { type: String },
  // Assigned by admin after acceptance
  cityId: { type: mongoose.Schema.Types.ObjectId, ref: 'City' },
  categoryIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
  // Documents
  aadharCard: { type: String },
  panCard: { type: String },
  // Approval flow
  isApproved: { type: Boolean, default: false },
  vendorAccepted: { type: Boolean, default: false },
  status: { type: String, enum: ['active', 'blocked'], default: 'active' }
}, { timestamps: true });

module.exports = mongoose.model('Vendor', VendorSchema);
