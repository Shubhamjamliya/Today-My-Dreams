const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Vendor = require('../models/Vendor');

exports.register = async (req, res) => {
  try {
    const { name, email, phone, password, cityText, categoryText } = req.body;
    const exists = await Vendor.findOne({ email });
    if (exists) return res.status(400).json({ success: false, message: 'Email already registered' });

    const passwordHash = await bcrypt.hash(password, 10);

    let aadharCard = null;
    let panCard = null;

    if (req.files) {
      if (req.files.aadharCard && req.files.aadharCard[0]) {
        aadharCard = req.files.aadharCard[0].path;
      }
      if (req.files.panCard && req.files.panCard[0]) {
        panCard = req.files.panCard[0].path;
      }
    }

    const v = await Vendor.create({
      name,
      email,
      phone,
      passwordHash,
      cityText,
      categoryText,
      aadharCard,
      panCard
    });
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

const crypto = require('crypto');

const { sendEmail } = require('../utils/emailService');

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const vendor = await Vendor.findOne({ email });
    if (!vendor) return res.status(404).json({ success: false, message: 'Vendor with this email does not exist.' });

    // Generate token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Set token and expiration (1 hour)
    vendor.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    vendor.resetPasswordExpires = Date.now() + 3600000; // 1 hour

    await vendor.save();

    const resetUrl = `${process.env.FRONTEND_URL}/vendor/reset-password/${resetToken}`;

    const message = `
      <h1>Password Reset Request</h1>
      <p>You have requested a password reset. Please go to this link to reset your password:</p>
      <a href="${resetUrl}" clicktracking=off>${resetUrl}</a>
      <p>This link is valid for 1 hour.</p>
    `;

    try {
      await sendEmail({
        to: vendor.email,
        subject: 'Password Reset Request',
        html: message,
      });

      res.json({ success: true, message: 'Email sent' });
    } catch (err) {
      vendor.resetPasswordToken = undefined;
      vendor.resetPasswordExpires = undefined;
      await vendor.save();
      return res.status(500).json({ success: false, message: 'Email could not be sent' });
    }

  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    // Hash the token to compare with DB
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const vendor = await Vendor.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!vendor) {
      return res.status(400).json({ success: false, message: 'Invalid or expired token' });
    }

    // Set new password
    vendor.passwordHash = await bcrypt.hash(password, 10);
    vendor.resetPasswordToken = undefined;
    vendor.resetPasswordExpires = undefined;

    await vendor.save();

    res.json({ success: true, message: 'Password Reset Successfully. You can now login.' });

  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};
