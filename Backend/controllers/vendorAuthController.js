const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Vendor = require('../models/Vendor');

exports.register = async (req, res) => {
  try {
    const { name, email, phone, password, cityText, categoryText } = req.body;
    const exists = await Vendor.findOne({ email });
    if (exists) return res.status(400).json({ success: false, message: 'Email already registered' });
    const passwordHash = await bcrypt.hash(password, 10);
    const v = await Vendor.create({ name, email, phone, passwordHash, cityText, categoryText });
    res.json({ success: true, message: 'Registered. Await admin approval.', vendorId: v._id });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const v = await Vendor.findOne({ email });
    if (!v) return res.status(400).json({ success: false, message: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, v.passwordHash);
    if (!ok) return res.status(400).json({ success: false, message: 'Invalid credentials' });
    const token = jwt.sign({ vendorId: v._id }, process.env.JWT_SECRET_VENDOR || 'vendor_secret', { expiresIn: '7d' });
    res.json({ success: true, token });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
};

exports.me = async (req, res) => {
  const v = await Vendor.findById(req.vendor._id).populate('cityId').populate('categoryIds');
  res.json({ success: true, vendor: v });
};

exports.accept = async (req, res) => {
  try {
    const v = await Vendor.findByIdAndUpdate(req.vendor._id, { vendorAccepted: true }, { new: true });
    res.json({ success: true, vendor: v });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
};
