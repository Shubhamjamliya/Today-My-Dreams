const mongoose = require('mongoose');

const serviceContactSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['service', 'shop'],
    required: true,
    unique: true
  },
  phoneNumber: {
    type: String,
    required: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ServiceContact', serviceContactSchema);
