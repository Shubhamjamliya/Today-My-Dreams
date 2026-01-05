const Category = require('../models/Category');

exports.list = async (req, res) => {
  const ids = req.vendor.categoryIds || [];
  const categories = await Category.find({ _id: { $in: ids } });
  res.json({ success: true, categories });
};

