const mongoose = require('mongoose');

const shopOrderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'ShopProduct', required: false },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  image: { type: String, required: false },
}, { _id: false });

const shopOrderSchema = new mongoose.Schema({
  customOrderId: { type: String, unique: true, index: true },
  customerName: { type: String, required: true },
  email: { type: String, required: true, index: true },
  phone: { type: String, required: true },
  address: {
    street: { type: String, required: true },
    pincode: { type: String, required: true },
    country: { type: String, required: true },
  },
  items: [shopOrderItemSchema],
  totalAmount: { type: Number, required: true },
  paymentMethod: { type: String, required: true },
  orderStatus: {
    type: String,
    default: 'processing',
    enum: ['processing', 'confirmed', 'shipped', 'delivered', 'cancelled']
  },
  paymentStatus: {
    type: String,
    required: true,
    enum: ['pending', 'completed', 'failed']
  },
  transactionId: { type: String, required: false },
  couponCode: { type: String, required: false },
}, { timestamps: true });

module.exports = mongoose.model('ShopOrder', shopOrderSchema);
