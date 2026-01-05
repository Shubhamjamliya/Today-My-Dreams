const Vendor = require('../models/Vendor');

exports.list = async (req, res) => {
  const { status } = req.query;
  const q = {};
  if (status) q.status = status;
  const vendors = await Vendor.find(q)
    .populate('cityId', 'name')
    .populate('categoryIds', 'name')
    .sort({ createdAt: -1 });
  res.json({ success: true, vendors });
};

exports.approve = async (req, res) => {
  const v = await Vendor.findByIdAndUpdate(req.params.id, { isApproved: true }, { new: true });
  res.json({ success: true, vendor: v });
};

exports.block = async (req, res) => {
  const v = await Vendor.findByIdAndUpdate(req.params.id, { status: 'blocked' }, { new: true });
  res.json({ success: true, vendor: v });
};

exports.unblock = async (req, res) => {
  const v = await Vendor.findByIdAndUpdate(req.params.id, { status: 'active' }, { new: true });
  res.json({ success: true, vendor: v });
};

exports.assign = async (req, res) => {
  try {
    const { cityId, categoryIds } = req.body;
    const v = await Vendor.findByIdAndUpdate(
      req.params.id,
      { cityId, categoryIds },
      { new: true }
    );
    res.json({ success: true, vendor: v });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
};
