const express = require('express');
const router = express.Router();
const phonepeController = require('../controllers/phonepeController');
const razorpayController = require('../controllers/razorpayController');



// PhonePe Payment Routes
router.post('/phonepe', phonepeController.createPhonePeOrder);
router.post('/phonepe/callback', phonepeController.phonePeCallback);
router.get('/phonepe/status/:orderId', phonepeController.getPhonePeStatus);

// PhonePe Refund Routes
router.post('/phonepe/refund', phonepeController.refundPayment);
router.get('/phonepe/refund/:merchantRefundId/status', phonepeController.getRefundStatus);

// Razorpay Payment Routes
router.post('/razorpay/create-order', razorpayController.createOrder);
router.post('/razorpay/verify', razorpayController.verifyPayment);
router.get('/razorpay/payment/:paymentId', razorpayController.getPaymentDetails);
router.post('/razorpay/refund', razorpayController.refundPayment);

module.exports = router;
