const jwt = require('jsonwebtoken');
const Vendor = require('../models/Vendor');

module.exports = async function vendorAuth(req, res, next) {
  try {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    if (!token) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const payload = jwt.verify(token, process.env.JWT_SECRET_VENDOR || 'vendor_secret');
    const vendor = await Vendor.findById(payload.vendorId);
    if (!vendor) return res.status(401).json({ success: false, message: 'Unauthorized' });
    if (!vendor.isApproved) return res.status(403).json({ success: false, message: 'Awaiting approval' });
    if (vendor.status === 'blocked') return res.status(403).json({ success: false, message: 'Blocked' });
    req.vendor = vendor;
    next();
  } catch (e) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
};

