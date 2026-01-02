import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle,
  Home,
  RefreshCw,
  CreditCard,
  Truck,
  Shield,
  ArrowLeft,
  Package,
  MapPin,
  User,
  Mail,
  Phone,
  Calendar,
  Receipt,
  Copy,
  Download,
  CheckCircle2,
  X,
  Loader2
} from 'lucide-react';
import paymentService from '../services/paymentService';
import orderService from '../services/orderService';
import { toast } from 'react-hot-toast';
import Loader from '../components/Loader';

import { useAuth } from '../context/AuthContext';

const PaymentStatus = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState(null); // 'success', 'failed', 'pending', 'unknown', 'error'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const placingOrderRef = useRef(false);

  // Get cart and user context
  const { user } = useAuth();

  // Try to get form data and cart from localStorage (set in Checkout before payment)
  let savedFormData = {};
  let savedCoupon = null;
  let savedCartItems = [];
  try {
    savedFormData = JSON.parse(localStorage.getItem('checkoutFormData') || '{}') || {};
  } catch (e) { savedFormData = {}; }
  try {
    savedCoupon = JSON.parse(localStorage.getItem('appliedCoupon') || 'null') || JSON.parse(localStorage.getItem('checkoutAppliedCoupon') || 'null');
  } catch (e) { savedCoupon = null; }
  try {
    savedCartItems = JSON.parse(localStorage.getItem('checkoutCartItems') || '[]') || [];
  } catch (e) { savedCartItems = []; }

  const orderId = searchParams.get('orderId');
  const transactionId = searchParams.get('transactionId');

  // Use cart from localStorage
  const cartItems = savedCartItems;

  // Helper to calculate total with coupon
  const getFinalTotal = () => {
    const subtotal = cartItems.reduce((sum, item) => sum + (item.product?.price || item.price) * item.quantity, 0);
    const discount = savedCoupon && typeof savedCoupon.discountAmount === 'number' ? savedCoupon.discountAmount : 0;
    const total = subtotal - discount;
    return total > 0 ? total : 0;
  };

  // Helper to get item image
  const getItemImage = (item) => {
    if (item.product?.images?.[0]) return item.product.images[0];
    if (item.product?.image) return item.product.image;
    if (item.image) return item.image;
    if (item.images?.[0]) return item.images[0];
    return '';
  };

  // Prepare order data from saved form data and cart items
  const prepareOrderData = () => {
    // Get sellerToken from URL params
    const urlParams = new URLSearchParams(window.location.search);
    const sellerToken = urlParams.get('seller') || '';

    // Structure the address payload
    const addressPayload = {
      street: savedFormData.address || '',
      city: savedFormData.city || '',
      pincode: savedFormData.zipCode || savedFormData.pincode || '',
      country: savedFormData.country || 'India',
    };

    // Handle scheduled delivery if present
    let scheduledDeliveryISO = null;
    if (savedFormData.scheduledDate && savedFormData.scheduledTime) {
      scheduledDeliveryISO = new Date(`${savedFormData.scheduledDate}T${savedFormData.scheduledTime}`).toISOString();
    }

    // Map cart items to order items format
    const orderItems = cartItems.map(item => ({
      productId: item.product?._id || item.product?.id || item._id || item.id,
      name: item.product?.name || item.name,
      quantity: item.quantity || 1,
      price: item.product?.price || item.price,
      image: getItemImage(item)
    }));

    // Handle add-ons if present
    const addOns = savedFormData.addOns || savedFormData.selectedAddons || [];
    const formattedAddOns = Array.isArray(addOns) ? addOns.map(addon => ({
      name: addon.name,
      price: addon.price,
      quantity: addon.quantity || 1
    })) : [];

    const orderData = {
      customerName: savedFormData.fullName || savedFormData.customerName || '',
      email: savedFormData.email || user?.email || '',
      phone: savedFormData.phone || '',
      address: addressPayload,
      items: orderItems,
      addOns: formattedAddOns,
      totalAmount: getFinalTotal(),
      shippingCost: savedFormData.shippingCost || 0,
      codExtraCharge: savedFormData.codExtraCharge || 0,
      finalTotal: getFinalTotal(),
      paymentMethod: savedFormData.paymentMethod || 'online',
      sellerToken: sellerToken,
      couponCode: savedCoupon?.code || savedFormData.couponCode,
      scheduledDelivery: scheduledDeliveryISO,
      transactionId: transactionId || orderId,
      phonepeOrderId: orderId || transactionId,
    };

    return orderData;
  };

  // Place order after successful payment
  const placeOrder = async () => {
    // Check if order has already been placed for this payment
    const orderKey = `order_placed_${orderId || transactionId}`;
    const orderAlreadyPlaced = localStorage.getItem(orderKey);
    
    if (orderAlreadyPlaced === 'true') {
      setOrderPlaced(true);
      return;
    }

    // Validate required data
    if (!savedFormData || !cartItems || cartItems.length === 0) {
      console.error('Missing required data for order placement');
      toast.error('Unable to place order: Missing order information');
      return;
    }

    try {
      placingOrderRef.current = true;
      
      // Prepare order data
      const orderData = {
        ...prepareOrderData(),
        paymentStatus: 'completed',
        upfrontAmount: 0,
        remainingAmount: 0,
      };

      // Create order
      const response = await orderService.createOrder(orderData);

      if (response.success) {
        // Mark order as placed to prevent duplicates
        localStorage.setItem(orderKey, 'true');
        setOrderPlaced(true);
        toast.success('Order placed successfully!');
        
        // Update orderDetails with the created order
        if (response.order) {
          setOrderDetails(prev => ({
            ...prev,
            ...response.order,
            customOrderId: response.order.customOrderId || response.order._id,
            orderId: response.order._id
          }));
        }
        
        // Clear persisted checkout data after successful order
        localStorage.removeItem('checkoutFormData');
        localStorage.removeItem('checkoutCartItems');
        localStorage.removeItem('appliedCoupon');
        localStorage.removeItem('checkoutAppliedCoupon');
      } else {
        toast.error(response.message || 'Failed to place order');
        placingOrderRef.current = false;
      }
    } catch (err) {
      console.error('Error placing order:', err);
      toast.error('Failed to place order: ' + (err.message || 'Unknown error'));
      placingOrderRef.current = false;
    }
  };

  useEffect(() => {
    if (!orderId && !transactionId) {
      setError('No order ID or transaction ID provided');
      setLoading(false);
      return;
    }
    checkPaymentStatus();
    // eslint-disable-next-line
  }, [orderId, transactionId, retryCount]);

  // Place order after payment is successful
  useEffect(() => {
    if (status === 'success' && !orderPlaced && !placingOrderRef.current && !loading) {
      placeOrder();
    }
    // eslint-disable-next-line
  }, [status, orderPlaced, loading]);

 

  const checkPaymentStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      const idToCheck = orderId || transactionId;
      const response = await paymentService.getPhonePeStatus(idToCheck);
      setStatus(response.status);
      setOrderDetails(response.data?.data || response.data);
      // No redirect here; wait for order placement
    } catch (err) {
      setError(err.message || 'Failed to check payment status');
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  // Get displayable items: prefer cartItems (local), then orderDetails payloads
  const getDisplayItems = () => {
    if (Array.isArray(cartItems) && cartItems.length > 0) return cartItems;
    // Try various shapes from orderDetails (PhonePe response / created order)
    const candidates = [
      orderDetails?.items,
      orderDetails?.order?.items,
      orderDetails?.newOrderData?.order?.items,
      orderDetails?.newOrderData?.items,
      orderDetails?.paymentDetails,
    ];
    for (const c of candidates) {
      if (Array.isArray(c) && c.length > 0) return c;
    }
    return [];
  };

  const renderProductList = () => {
    const items = getDisplayItems();
    if (!items || items.length === 0) return null;

    return (
      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-3">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-1.5">
            <Package className="w-4 h-4 text-[#FCD24C]" />
            Order Items
          </h3>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
            {items.length} {items.length === 1 ? 'item' : 'items'}
          </span>
        </div>
        <div className="space-y-2">
          {items.map((item, idx) => {
            const product = item.product || item;
            const img = product?.image || product?.images?.[0] || product?.imageUrl || product?.imageUrlSmall || '';
            const name = product?.name || product?.title || product?.label || item.name || 'Product';
            const qty = item.quantity || product?.quantity || 1;
            const unitPrice = product?.price ?? item.price ?? 0;
            const price = unitPrice * (item.quantity || 1);
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-center gap-2.5 p-2.5 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="w-14 h-14 bg-white rounded-lg overflow-hidden flex-shrink-0 shadow-sm border border-gray-200">
                  {img ? (
                    <img src={img} alt={name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl bg-gradient-to-br from-[#FCD24C] to-yellow-400">🎈</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-gray-900 mb-0.5 truncate">{name}</h4>
                  <div className="flex items-center gap-3 text-xs text-gray-600">
                    <span className="flex items-center gap-0.5">
                      <span className="font-medium">Qty:</span> {qty}
                    </span>
                    <span className="flex items-center gap-0.5">
                      <span className="font-medium">Unit:</span> ₹{unitPrice.toFixed(2)}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-gray-900">₹{price.toFixed(2)}</div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    );
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const renderOrderSummary = () => {
    const subtotal = cartItems.reduce((sum, item) => sum + (item.product?.price || item.price) * item.quantity, 0);
    const discount = savedCoupon && typeof savedCoupon.discountAmount === 'number' ? savedCoupon.discountAmount : 0;
    const shipping = savedFormData?.shippingCost || 0;
    const codExtra = savedFormData?.codExtraCharge || 0;
    const total = getFinalTotal();

    return (
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-3 border border-gray-200">
        <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-1.5">
          <Receipt className="w-4 h-4 text-[#FCD24C]" />
          Order Summary
        </h3>
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-medium text-gray-900">₹{subtotal.toFixed(2)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-xs">
              <span className="text-gray-600 flex items-center gap-1">
                <span>Discount</span>
                {savedCoupon?.code && (
                  <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">({savedCoupon.code})</span>
                )}
              </span>
              <span className="font-medium text-green-600">-₹{discount.toFixed(2)}</span>
            </div>
          )}
          {shipping > 0 && (
            <div className="flex justify-between text-xs">
              <span className="text-gray-600">Shipping</span>
              <span className="font-medium text-gray-900">₹{shipping.toFixed(2)}</span>
            </div>
          )}
          {codExtra > 0 && (
            <div className="flex justify-between text-xs">
              <span className="text-gray-600">COD Charge</span>
              <span className="font-medium text-gray-900">₹{codExtra.toFixed(2)}</span>
            </div>
          )}
          <div className="border-t border-gray-300 pt-2 mt-2">
            <div className="flex justify-between">
              <span className="text-sm font-bold text-gray-900">Total</span>
              <span className="text-lg font-bold text-[#FCD24C]">₹{total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderCustomerInfo = () => {
    if (!savedFormData || (!savedFormData.fullName && !savedFormData.email && !savedFormData.phone)) return null;

    return (
      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-3">
        <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-1.5">
          <User className="w-4 h-4 text-[#FCD24C]" />
          Customer Information
        </h3>
        <div className="space-y-2">
          {savedFormData.fullName && (
            <div className="flex items-start gap-2">
              <User className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <div className="text-xs text-gray-500 mb-0.5">Name</div>
                <div className="text-xs font-medium text-gray-900">{savedFormData.fullName}</div>
              </div>
            </div>
          )}
          {savedFormData.email && (
            <div className="flex items-start gap-2">
              <Mail className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <div className="text-xs text-gray-500 mb-0.5">Email</div>
                <div className="text-xs font-medium text-gray-900">{savedFormData.email}</div>
              </div>
            </div>
          )}
          {savedFormData.phone && (
            <div className="flex items-start gap-2">
              <Phone className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <div className="text-xs text-gray-500 mb-0.5">Phone</div>
                <div className="text-xs font-medium text-gray-900">{savedFormData.phone}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderDeliveryAddress = () => {
    if (!savedFormData || !savedFormData.address) return null;

    return (
      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-3">
        <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-[#FCD24C]" />
          Delivery Address
        </h3>
        <div className="space-y-1 text-xs text-gray-700">
          <div className="font-medium">{savedFormData.fullName || savedFormData.customerName}</div>
          <div>{savedFormData.address}</div>
          <div>
            {savedFormData.city && <span>{savedFormData.city}, </span>}
            {savedFormData.zipCode && <span>{savedFormData.zipCode}</span>}
          </div>
          {savedFormData.country && <div>{savedFormData.country}</div>}
        </div>
        {savedFormData.scheduledDate && savedFormData.scheduledTime && (
          <div className="mt-2 pt-2 border-t border-gray-200">
            <div className="flex items-center gap-1.5 text-xs text-gray-600">
              <Calendar className="w-3.5 h-3.5" />
              <span className="font-medium">Scheduled:</span>
              <span>{formatDate(`${savedFormData.scheduledDate}T${savedFormData.scheduledTime}`)}</span>
            </div>
          </div>
        )}
      </div>
    );
  };



  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoToOrders = () => {
    navigate('/account?tab=orders');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FCD24C] via-white to-[#FCD24C] flex items-center justify-center p-3">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 bg-gradient-to-br from-[#FCD24C] to-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <Loader2 size={32} className="text-white" />
          </motion.div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">Checking Payment Status</h2>
          <p className="text-sm text-gray-600">Please wait while we verify your payment...</p>
        </motion.div>
      </div>
    );
  }

  if (error && !status) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FCD24C] via-white to-[#FCD24C] flex items-center justify-center p-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-5 max-w-md w-full mx-3"
        >
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <AlertCircle size={32} className="text-red-500" />
            </motion.div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Error</h2>
            <p className="text-sm text-gray-600 mb-5">{error}</p>
            <div className="space-y-2">
              <button
                onClick={handleRetry}
                className="w-full bg-[#FCD24C] hover:bg-yellow-500 text-white px-4 py-2.5 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-sm"
              >
                <RefreshCw size={18} />
                Try Again
              </button>
              <button
                onClick={handleGoHome}
                className="w-full bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 px-4 py-2.5 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 text-sm"
              >
                <Home size={18} />
                Go Home
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  const renderSuccessStatus = () => {
    const orderIdDisplay = orderDetails?.customOrderId || orderDetails?.orderId || orderId || transactionId || 'N/A';
    const transactionIdDisplay = transactionId || orderId || 'N/A';
    const amount = orderDetails?.amount ? (orderDetails.amount / 100).toFixed(2) : getFinalTotal().toFixed(2);

    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FCD24C] via-white to-[#FCD24C] py-4 px-3">
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-4"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-md"
            >
              <CheckCircle2 size={32} className="text-white" />
            </motion.div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
            <p className="text-sm text-gray-600 mb-3">Your order has been confirmed and payment received</p>
            <div className="inline-flex items-center gap-1.5 bg-green-50 border border-green-200 rounded-full px-3 py-1.5 mb-4">
              <Shield size={16} className="text-green-600" />
              <span className="text-green-700 font-medium text-xs">Secure payment processed successfully</span>
            </div>
          </motion.div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-4">
            {/* Left Column - Order Details & Payment Info */}
            <div className="lg:col-span-2 space-y-3">
              {/* Order Information Card */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-xl shadow-lg border border-gray-100 p-4"
              >
                <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-[#FCD24C]" />
                  Order Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-0.5 block">Order ID</label>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold text-gray-900 font-mono">{orderIdDisplay}</span>
                        <button
                          onClick={() => copyToClipboard(orderIdDisplay)}
                          className="p-1 hover:bg-gray-100 rounded transition-colors"
                          title="Copy Order ID"
                        >
                          <Copy size={14} className="text-gray-500" />
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-0.5 block">Transaction ID</label>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-medium text-gray-700 font-mono break-all">{transactionIdDisplay}</span>
                        <button
                          onClick={() => copyToClipboard(transactionIdDisplay)}
                          className="p-1 hover:bg-gray-100 rounded transition-colors flex-shrink-0"
                          title="Copy Transaction ID"
                        >
                          <Copy size={14} className="text-gray-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-0.5 block">Payment Status</label>
                      <div className="inline-flex items-center gap-1.5 bg-green-100 text-green-700 px-2.5 py-1 rounded-md">
                        <CheckCircle2 size={14} />
                        <span className="font-semibold text-xs">Completed</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-0.5 block">Payment Method</label>
                      <div className="flex items-center gap-1.5">
                        <CreditCard size={14} className="text-gray-500" />
                        <span className="text-xs font-medium text-gray-700">{savedFormData?.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-0.5 block">Amount Paid</label>
                      <span className="text-xl font-bold text-[#FCD24C]">₹{amount}</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Product List */}
              {renderProductList()}

              {/* Customer Info & Delivery Address */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {renderCustomerInfo()}
                {renderDeliveryAddress()}
              </div>
            </div>

            {/* Right Column - Order Summary & Next Steps */}
            <div className="space-y-3">
              {/* Order Summary */}
              {renderOrderSummary()}

              {/* What's Next Card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-md border border-blue-100 p-3"
              >
                <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-blue-600" />
                  What's Next?
                </h3>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-blue-600 font-bold text-xs">1</span>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 text-xs mb-0.5">Order Confirmed</div>
                      <div className="text-xs text-gray-600">Your order has been received and confirmed</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-blue-600 font-bold text-xs">2</span>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 text-xs mb-0.5">Processing</div>
                      <div className="text-xs text-gray-600">We're preparing your order for shipment</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-blue-600 font-bold text-xs">3</span>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 text-xs mb-0.5">Shipping</div>
                      <div className="text-xs text-gray-600">Order will be shipped within 5-7 business days</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-blue-600 font-bold text-xs">4</span>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 text-xs mb-0.5">Delivery</div>
                      <div className="text-xs text-gray-600">You'll receive tracking information via email</div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <button
                  onClick={handleGoToOrders}
                  className="w-full bg-[#FCD24C] hover:bg-yellow-500 text-white px-4 py-2.5 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-sm"
                >
                  <Package size={18} />
                  View My Orders
                </button>
                <button
                  onClick={handleGoHome}
                  className="w-full bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 px-4 py-2.5 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 text-sm"
                >
                  <Home size={18} />
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderFailedStatus = () => {
    const orderIdDisplay = orderDetails?.newOrderData?.customOrderId || orderDetails?.merchantOrderId || orderDetails?.orderId || orderId || transactionId || 'N/A';
    const amount = orderDetails?.amount ? (orderDetails.amount / 100).toFixed(2) : getFinalTotal().toFixed(2);

    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FCD24C] via-white to-[#FCD24C] py-4 px-3">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-4"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-md"
            >
              <XCircle size={32} className="text-white" />
            </motion.div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Payment Failed</h1>
            <p className="text-sm text-gray-600 mb-3">Your online payment could not be processed</p>
            <div className="inline-flex items-center gap-1.5 bg-orange-50 border border-orange-200 rounded-full px-3 py-1.5 mb-4">
              <AlertCircle size={16} className="text-orange-600" />
              <span className="text-orange-700 font-medium text-xs">Don't worry, you can try again or use Cash on Delivery</span>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-4">
            <div className="lg:col-span-2 space-y-3">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-xl shadow-lg border border-gray-100 p-4"
              >
                <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-orange-500" />
                  Payment Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-0.5 block">Order ID</label>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-gray-900 font-mono">{orderIdDisplay}</span>
                      <button
                        onClick={() => copyToClipboard(orderIdDisplay)}
                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                        title="Copy Order ID"
                      >
                        <Copy size={14} className="text-gray-500" />
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-0.5 block">Amount</label>
                    <span className="text-xl font-bold text-gray-900">₹{amount}</span>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-0.5 block">Payment Status</label>
                    <div className="inline-flex items-center gap-1.5 bg-red-100 text-red-700 px-2.5 py-1 rounded-md">
                      <XCircle size={14} />
                      <span className="font-semibold text-xs">Failed</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-0.5 block">Payment Method</label>
                    <div className="flex items-center gap-1.5">
                      <CreditCard size={14} className="text-gray-500" />
                      <span className="text-xs font-medium text-gray-700">Online Payment</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {renderProductList()}
            </div>

            <div className="space-y-3">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl shadow-md border border-orange-100 p-3"
              >
                <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-orange-600" />
                  What Happened?
                </h3>
                <div className="space-y-2 text-xs text-gray-700">
                  <p>Your payment could not be processed. This could be due to:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Insufficient funds</li>
                    <li>Network issues</li>
                    <li>Payment gateway timeout</li>
                    <li>Card/bank restrictions</li>
                  </ul>
                  <p className="pt-1 font-medium">You can try again or use Cash on Delivery option.</p>
                </div>
              </motion.div>

              <div className="space-y-2">
                <button
                  onClick={handleGoHome}
                  className="w-full bg-[#FCD24C] hover:bg-yellow-500 text-white px-4 py-2.5 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-sm"
                >
                  <Home size={18} />
                  Return to Home
                </button>
                <button
                  onClick={handleGoToOrders}
                  className="w-full bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 px-4 py-2.5 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 text-sm"
                >
                  <Package size={18} />
                  View My Orders
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderPendingStatus = () => {
    const orderIdDisplay = orderDetails?.merchantOrderId || orderDetails?.orderId || orderId || transactionId || 'N/A';
    const amount = orderDetails?.amount ? (orderDetails.amount / 100).toFixed(2) : getFinalTotal().toFixed(2);

    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FCD24C] via-white to-[#FCD24C] py-4 px-3">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-4"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full flex items-center justify-center mx-auto mb-3 shadow-md"
            >
              <Loader2 size={32} className="text-white" />
            </motion.div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Payment Pending</h1>
            <p className="text-sm text-gray-600 mb-3">Your payment is being processed. Please wait...</p>
            <div className="inline-flex items-center gap-1.5 bg-yellow-50 border border-yellow-200 rounded-full px-3 py-1.5 mb-4">
              <Clock size={16} className="text-yellow-600" />
              <span className="text-yellow-700 font-medium text-xs">This may take a few minutes to complete</span>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-4">
            <div className="lg:col-span-2 space-y-3">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-xl shadow-lg border border-gray-100 p-4"
              >
                <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-yellow-500" />
                  Payment Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-0.5 block">Order ID</label>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-gray-900 font-mono">{orderIdDisplay}</span>
                      <button
                        onClick={() => copyToClipboard(orderIdDisplay)}
                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                        title="Copy Order ID"
                      >
                        <Copy size={14} className="text-gray-500" />
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-0.5 block">Amount</label>
                    <span className="text-xl font-bold text-gray-900">₹{amount}</span>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-0.5 block">Payment Status</label>
                    <div className="inline-flex items-center gap-1.5 bg-yellow-100 text-yellow-700 px-2.5 py-1 rounded-md">
                      <Clock size={14} />
                      <span className="font-semibold text-xs">Pending</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-0.5 block">Payment Method</label>
                    <div className="flex items-center gap-1.5">
                      <CreditCard size={14} className="text-gray-500" />
                      <span className="text-xs font-medium text-gray-700">Online Payment</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {renderProductList()}
            </div>

            <div className="space-y-3">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl shadow-md border border-yellow-100 p-3"
              >
                <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-yellow-600" />
                  What's Happening?
                </h3>
                <div className="space-y-2 text-xs text-gray-700">
                  <div className="flex items-start gap-2">
                    <RefreshCw size={14} className="text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-semibold mb-0.5">Payment Verification</div>
                      <div className="text-xs text-gray-600">Your payment is being verified by the payment gateway</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Shield size={14} className="text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-semibold mb-0.5">Your Money is Safe</div>
                      <div className="text-xs text-gray-600">No charges have been made yet</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Clock size={14} className="text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-semibold mb-0.5">Please Wait</div>
                      <div className="text-xs text-gray-600">This process usually takes 1-2 minutes</div>
                    </div>
                  </div>
                </div>
              </motion.div>

              <div className="space-y-2">
                <button
                  onClick={handleRetry}
                  disabled={retryCount >= 3}
                  className="w-full bg-[#FCD24C] hover:bg-yellow-500 text-white px-4 py-2.5 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#FCD24C]"
                >
                  <RefreshCw size={18} />
                  Check Status Again ({3 - retryCount} attempts left)
                </button>
                <button
                  onClick={handleGoHome}
                  className="w-full bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 px-4 py-2.5 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 text-sm"
                >
                  <Home size={18} />
                  Go Home
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderUnknownStatus = () => (
    <div className="min-h-screen bg-gradient-to-br from-[#FCD24C] via-white to-[#FCD24C] flex items-center justify-center p-3">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl shadow-lg p-5 max-w-md w-full mx-3"
      >
        <div className="text-center mb-5">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-16 h-16 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md"
          >
            <AlertCircle size={32} className="text-white" />
          </motion.div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Unknown Payment Status</h1>
          <p className="text-sm text-gray-600 mb-4">We couldn't determine the payment status. Please try again or contact support.</p>
          <div className="inline-flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-full px-3 py-1.5 mb-4">
            <AlertCircle size={16} className="text-gray-500" />
            <span className="text-gray-700 font-medium text-xs">Unable to verify payment status</span>
          </div>
        </div>
        <div className="text-center space-y-2">
          <button
            onClick={handleRetry}
            className="w-full bg-[#FCD24C] hover:bg-yellow-500 text-white px-4 py-2.5 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-sm"
          >
            <RefreshCw size={18} />
            Try Again
          </button>
          <button
            onClick={handleGoHome}
            className="w-full bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 px-4 py-2.5 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 text-sm"
          >
            <Home size={18} />
            Go Home
          </button>
        </div>
      </motion.div>
    </div>
  );

  return (
    <AnimatePresence mode="wait">
      {status === 'success' && renderSuccessStatus()}
      {status === 'failed' && renderFailedStatus()}
      {status === 'pending' && renderPendingStatus()}
      {status === 'unknown' && renderUnknownStatus()}
    </AnimatePresence>
  );
};

export default PaymentStatus; 
