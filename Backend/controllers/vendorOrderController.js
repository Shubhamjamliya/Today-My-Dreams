const Order = require('../models/Order');
const mongoose = require('mongoose');

exports.list = async (req, res) => {
  try {
    const cityId = req.vendor.cityId;
    const orders = await Order.find({ cityId }).sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    console.error('List Orders Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.detail = async (req, res) => {
  try {
    const cityId = req.vendor.cityId;
    const order = await Order.findOne({ _id: req.params.id, cityId });
    if (!order) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, order });
  } catch (error) {
    console.error('Order Detail Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const cityId = req.vendor.cityId;
    const o = await Order.findOneAndUpdate(
      { _id: req.params.id, cityId },
      { orderStatus: status, assignedVendorId: req.vendor._id },
      { new: true }
    );
    if (!o) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, order: o });
  } catch (error) {
    console.error('Update Status Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.stats = async (req, res) => {
  try {
    const cityId = req.vendor.cityId;

    // Ensure cityId is valid for aggregation
    const cityIdObj = new mongoose.Types.ObjectId(cityId);

    // Count counts of orders in City (Potential)
    const ordersCount = await Order.countDocuments({ cityId });
    const pendingCount = await Order.countDocuments({ cityId, orderStatus: 'processing' });
    const completedCount = await Order.countDocuments({ cityId, orderStatus: 'service_completed' });

    // Personal Stats (Assigned to this Vendor)
    const vendorIdObj = new mongoose.Types.ObjectId(req.vendor._id);
    const myOrdersCount = await Order.countDocuments({ assignedVendorId: vendorIdObj });
    const myCompletedCount = await Order.countDocuments({ assignedVendorId: vendorIdObj, orderStatus: 'service_completed' });

    // Calculating Revenue (My Orders only)
    const revenueAgg = await Order.aggregate([
      { $match: { assignedVendorId: vendorIdObj, orderStatus: 'service_completed' } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ]);

    const revenue = revenueAgg[0] ? revenueAgg[0].total : 0;

    // Chart Data (Last 7 Days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const dailyStats = await Order.aggregate([
      {
        $match: {
          assignedVendorId: vendorIdObj,
          createdAt: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          orders: { $sum: 1 },
          revenue: {
            $sum: {
              $cond: [{ $eq: ["$orderStatus", "service_completed"] }, "$totalAmount", 0]
            }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Upcoming Schedule (Assignments)
    const upcomingOrders = await Order.find({
      assignedVendorId: vendorIdObj,
      orderStatus: { $ne: 'service_completed' } // Fetch active orders (not completed)
    })
      .sort({ scheduledDelivery: 1, createdAt: -1 }) // Prioritize scheduled date
      .limit(5)
      .select('customerName orderStatus scheduledDelivery createdAt items customOrderId');

    res.json({
      success: true,
      stats: {
        orders: ordersCount, // Market Opportunity
        pending: pendingCount,
        completed: completedCount,
        myOrders: myOrdersCount, // Actual Work
        myCompleted: myCompletedCount,
        revenue, // Actual Revenue
        chartData: dailyStats, // Time Series
        upcoming: upcomingOrders // Schedule
      }
    });
  } catch (error) {
    console.error('Dashboard Stats Error:', error);
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

