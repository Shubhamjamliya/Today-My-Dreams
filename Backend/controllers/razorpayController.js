const Razorpay = require('razorpay');
const crypto = require('crypto');

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create Razorpay Order
exports.createOrder = async (req, res) => {
  try {
    const {
      amount,
      customerName,
      email,
      phone,
      address,
      city,
      pincode,
      country,
      items,
      totalAmount,
      shippingCost,
      codExtraCharge,
      finalTotal,
      paymentMethod,
      paymentStatus,
      upfrontAmount,
      remainingAmount,
      sellerToken,
      couponCode,
      scheduledDelivery,
      addOns
    } = req.body;

    // Validate amount
    if (!amount || amount < 1) {
      return res.status(400).json({
        success: false,
        message: 'Invalid amount. Minimum amount is ₹1'
      });
    }

    // Create Razorpay order
    const options = {
      amount: Math.round(amount * 100), // Razorpay expects amount in paise
      currency: 'INR',
      receipt: `order_${Date.now()}`,
      notes: {
        customerName,
        email,
        phone,
        address: typeof address === 'object' ? address.street : address,
        city: typeof address === 'object' ? address.city : city,
        pincode: typeof address === 'object' ? address.pincode : pincode,
        couponCode: couponCode || '',
        sellerToken: sellerToken || ''
      }
    };

    const order = await razorpay.orders.create(options);

    // Store order data in session/temp storage for later use
    // You might want to save this to database instead
    const pendingOrderData = {
      razorpayOrderId: order.id,
      customerName,
      email,
      phone,
      address,
      city,
      pincode,
      country,
      items,
      totalAmount: finalTotal || totalAmount,
      shippingCost,
      codExtraCharge,
      finalTotal,
      paymentMethod,
      paymentStatus,
      upfrontAmount,
      remainingAmount,
      sellerToken,
      couponCode,
      scheduledDelivery,
      addOns
    };

    res.status(200).json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      orderData: pendingOrderData
    });

  } catch (error) {
    console.error('Razorpay order creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment order',
      error: error.message
    });
  }
};

// Verify Razorpay Payment
exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body;

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      // Payment is verified
      res.status(200).json({
        success: true,
        message: 'Payment verified successfully',
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Payment verification failed - Invalid signature'
      });
    }

  } catch (error) {
    console.error('Razorpay payment verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Payment verification failed',
      error: error.message
    });
  }
};

// Get Payment Details
exports.getPaymentDetails = async (req, res) => {
  try {
    const { paymentId } = req.params;

    const payment = await razorpay.payments.fetch(paymentId);

    res.status(200).json({
      success: true,
      payment
    });

  } catch (error) {
    console.error('Razorpay fetch payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment details',
      error: error.message
    });
  }
};

// Process Refund
exports.refundPayment = async (req, res) => {
  try {
    const { paymentId, amount, notes } = req.body;

    const refund = await razorpay.payments.refund(paymentId, {
      amount: amount ? Math.round(amount * 100) : undefined, // If not provided, full refund
      notes: notes || {}
    });

    res.status(200).json({
      success: true,
      message: 'Refund initiated successfully',
      refund
    });

  } catch (error) {
    console.error('Razorpay refund error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process refund',
      error: error.message
    });
  }
};
