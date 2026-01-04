import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useCity } from '../context/CityContext';
import {
  MapPinIcon,
  CreditCardIcon,
  ShieldCheckIcon,
  LockClosedIcon,
  TruckIcon,
  ShoppingBagIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  BanknotesIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import config from '../config/config';
import SEO from '../components/SEO/SEO';
import Loader from '../components/Loader';
import AuthPrompt from '../components/AuthPrompt';
import orderService from '../services/orderService';
import paymentService from '../services/paymentService';

const ShopCheckout = () => {
  const navigate = useNavigate();
  const { cartItems, getCartTotal, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { selectedCity } = useCity();

  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('shipping'); // shipping, payment
  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: selectedCity || user?.city || '',
    pincode: user?.zipCode || '',
    paymentMethod: 'razorpay'
  });

  const [fieldErrors, setFieldErrors] = useState({});

  const subtotal = getCartTotal();
  const shipping = subtotal > 1000 ? 0 : 99;
  const total = subtotal + shipping;

  useEffect(() => {
    if (cartItems.length === 0) {
      navigate('/shop/cart');
    }
  }, [cartItems, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.fullName.trim()) errors.fullName = 'Full name is required';
    if (!formData.email.trim()) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Email is invalid';
    if (!formData.phone.trim()) errors.phone = 'Phone number is required';
    if (!formData.address.trim()) errors.address = 'Street address is required';
    if (!formData.city.trim()) errors.city = 'City is required';
    if (!formData.pincode.trim()) errors.pincode = 'Pincode is required';
    else if (!/^\d{6}$/.test(formData.pincode)) errors.pincode = 'Pincode must be 6 digits';

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNextStep = () => {
    if (validateForm()) {
      setStep('payment');
      window.scrollTo(0, 0);
    }
  };

  const handleRazorpayPayment = async (orderData) => {
    try {
      const paymentPayload = {
        ...orderData,
        amount: total,
        paymentStatus: 'processing'
      };

      const data = await paymentService.createRazorpayOrder(paymentPayload);

      if (data.success && data.orderId) {
        if (!window.Razorpay) {
          const script = document.createElement('script');
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.async = true;
          document.body.appendChild(script);
          await new Promise((resolve) => script.onload = resolve);
        }

        const options = {
          key: data.keyId,
          amount: data.amount,
          currency: data.currency || 'INR',
          name: 'TodayMyDream',
          description: 'Shop Order Payment',
          order_id: data.orderId,
          handler: async function (response) {
            try {
              const verifyResult = await paymentService.verifyRazorpayPayment({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              });

              if (verifyResult.success) {
                const orderPayload = {
                  ...paymentPayload,
                  paymentStatus: 'completed',
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpayOrderId: response.razorpay_order_id
                };

                const orderResponse = await orderService.createOrder(orderPayload);

                if (orderResponse.success) {
                  toast.success('Payment successful! Order placed.');
                  clearCart();
                  navigate(`/order-confirmation/${orderResponse.order._id}`, { state: { order: orderResponse.order } });
                } else {
                  toast.error('Payment successful but order creation failed. Please contact support.');
                  setLoading(false);
                }
              } else {
                toast.error('Payment verification failed.');
                setLoading(false);
              }
            } catch (err) {
              console.error('Payment verification error:', err);
              toast.error('Payment verification failed.');
              setLoading(false);
            }
          },
          prefill: {
            name: formData.fullName,
            email: formData.email,
            contact: formData.phone
          },
          theme: {
            color: '#000000'
          },
          modal: {
            ondismiss: function () {
              setLoading(false);
              toast.error('Payment was cancelled.');
            }
          }
        };

        const razorpay = new window.Razorpay(options);
        razorpay.open();
      } else {
        toast.error(data.message || 'Failed to initiate payment');
        setLoading(false);
      }
    } catch (error) {
      console.error('Razorpay Error:', error);
      toast.error('Something went wrong with payment initiation.');
      setLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      const orderData = {
        customerName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        address: {
          street: formData.address,
          city: formData.city,
          pincode: formData.pincode,
          country: 'India'
        },
        items: cartItems.map(item => ({
          productId: item._id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          image: item.images?.[0] || item.image
        })),
        totalAmount: total,
        shippingCost: shipping,
        finalTotal: total,
        paymentMethod: formData.paymentMethod,
        module: 'shop'
      };

      if (formData.paymentMethod === 'cod') {
        const response = await orderService.createOrder(orderData);
        if (response.success) {
          toast.success('Order placed successfully!');
          clearCart();
          navigate(`/order-confirmation/${response.order._id}`, { state: { order: response.order } });
        } else {
          toast.error(response.message || 'Failed to place order');
        }
        setLoading(false);
      } else {
        // Razorpay Payment Flow
        await handleRazorpayPayment(orderData);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  if (!isAuthenticated) return <AuthPrompt onLogin={() => window.location.reload()} />;
  if (loading) return <Loader text="Processing your order..." />;

  return (
    <div className="min-h-screen bg-[#FAFAFA] py-12 md:py-20">
      <SEO title="Checkout | TodayMyDream" />
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">

          {/* Main Content */}
          <div className="lg:col-span-8 space-y-8">
            {/* Stepper */}
            <div className="flex items-center gap-4 bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
              <div className={`flex items-center gap-3 ${step === 'shipping' ? 'text-black' : 'text-green-600'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${step === 'shipping' ? 'bg-black text-white shadow-lg shadow-black/20' : 'bg-green-100'}`}>
                  {step === 'shipping' ? '1' : <CheckCircleIcon className="w-6 h-6" />}
                </div>
                <span className="font-bold hidden sm:inline">Shipping Details</span>
              </div>

              <div className="h-0.5 flex-1 bg-gray-100 mx-4 relative overflow-hidden">
                <motion.div
                  initial={{ width: '0%' }}
                  animate={{ width: step === 'payment' ? '100%' : '0%' }}
                  className="absolute inset-y-0 left-0 bg-green-500"
                  transition={{ duration: 0.5 }}
                />
              </div>

              <div className={`flex items-center gap-3 ${step === 'payment' ? 'text-black' : 'text-gray-400'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${step === 'payment' ? 'bg-black text-white shadow-lg shadow-black/20' : 'bg-gray-100'}`}>2</div>
                <span className="font-bold hidden sm:inline">Payment Method</span>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {step === 'shipping' ? (
                <motion.div
                  key="shipping"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100"
                >
                  <div className="flex items-center gap-4 mb-10">
                    <div className="p-3.5 bg-black rounded-2xl text-white shadow-lg shadow-black/20">
                      <MapPinIcon className="w-6 h-6" />
                    </div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">Where to ship?</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 ml-1">Full Name</label>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        className={`w-full bg-gray-50/50 border ${fieldErrors.fullName ? 'border-red-500 bg-red-50/50' : 'border-gray-200'} px-6 py-4 rounded-2xl text-gray-900 font-bold focus:bg-white focus:border-black focus:ring-4 focus:ring-gray-100 transition-all outline-none`}
                        placeholder="Enter your full name"
                      />
                      {fieldErrors.fullName && <p className="text-red-500 text-xs mt-2 ml-1 font-bold flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-red-500 inline-block"></span>{fieldErrors.fullName}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 ml-1">Email Address</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`w-full bg-gray-50/50 border ${fieldErrors.email ? 'border-red-500 bg-red-50/50' : 'border-gray-200'} px-6 py-4 rounded-2xl text-gray-900 font-bold focus:bg-white focus:border-black focus:ring-4 focus:ring-gray-100 transition-all outline-none`}
                        placeholder="john@example.com"
                      />
                      {fieldErrors.email && <p className="text-red-500 text-xs mt-2 ml-1 font-bold flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-red-500 inline-block"></span>{fieldErrors.email}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 ml-1">Phone Number</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className={`w-full bg-gray-50/50 border ${fieldErrors.phone ? 'border-red-500 bg-red-50/50' : 'border-gray-200'} px-6 py-4 rounded-2xl text-gray-900 font-bold focus:bg-white focus:border-black focus:ring-4 focus:ring-gray-100 transition-all outline-none`}
                        placeholder="+91 98765 43210"
                      />
                      {fieldErrors.phone && <p className="text-red-500 text-xs mt-2 ml-1 font-bold flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-red-500 inline-block"></span>{fieldErrors.phone}</p>}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 ml-1">Street Address</label>
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        rows="3"
                        className={`w-full bg-gray-50/50 border ${fieldErrors.address ? 'border-red-500 bg-red-50/50' : 'border-gray-200'} px-6 py-4 rounded-2xl text-gray-900 font-bold focus:bg-white focus:border-black focus:ring-4 focus:ring-gray-100 transition-all outline-none resize-none`}
                        placeholder="House/Flat No., Building Name, Street"
                      ></textarea>
                      {fieldErrors.address && <p className="text-red-500 text-xs mt-2 ml-1 font-bold flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-red-500 inline-block"></span>{fieldErrors.address}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 ml-1">City</label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className={`w-full bg-gray-50/50 border ${fieldErrors.city ? 'border-red-500 bg-red-50/50' : 'border-gray-200'} px-6 py-4 rounded-2xl text-gray-900 font-bold focus:bg-white focus:border-black focus:ring-4 focus:ring-gray-100 transition-all outline-none`}
                        placeholder="City"
                      />
                      {fieldErrors.city && <p className="text-red-500 text-xs mt-2 ml-1 font-bold flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-red-500 inline-block"></span>{fieldErrors.city}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 ml-1">Pincode</label>
                      <input
                        type="text"
                        name="pincode"
                        value={formData.pincode}
                        onChange={handleInputChange}
                        maxLength={6}
                        className={`w-full bg-gray-50/50 border ${fieldErrors.pincode ? 'border-red-500 bg-red-50/50' : 'border-gray-200'} px-6 py-4 rounded-2xl text-gray-900 font-bold focus:bg-white focus:border-black focus:ring-4 focus:ring-gray-100 transition-all outline-none`}
                        placeholder="000000"
                      />
                      {fieldErrors.pincode && <p className="text-red-500 text-xs mt-2 ml-1 font-bold flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-red-500 inline-block"></span>{fieldErrors.pincode}</p>}
                    </div>
                  </div>

                  <button
                    onClick={handleNextStep}
                    className="w-full mt-10 bg-black text-white py-5 rounded-2xl font-black text-lg uppercase tracking-widest shadow-xl shadow-gray-900/10 hover:bg-gray-800 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-3 group"
                  >
                    Proceed to payment
                    <ShoppingBagIcon className="w-6 h-6 group-hover:animate-bounce" />
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="payment"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100"
                >
                  <div className="flex items-center gap-4 mb-10">
                    <div className="p-3.5 bg-black rounded-2xl text-white shadow-lg shadow-black/20">
                      <CreditCardIcon className="w-6 h-6" />
                    </div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">How to pay?</h2>
                  </div>

                  <div className="space-y-4">
                    <label className={`block relative p-6 rounded-3xl border-2 transition-all cursor-pointer group ${formData.paymentMethod === 'razorpay' ? 'border-black bg-gray-50 ring-2 ring-gray-100' : 'border-gray-100 hover:border-gray-300'}`}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="razorpay"
                        checked={formData.paymentMethod === 'razorpay'}
                        onChange={handleInputChange}
                        className="absolute right-6 top-6 w-6 h-6 accent-black"
                      />
                      <div className="flex items-start gap-5">
                        <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm border border-gray-100 group-hover:scale-110 transition-transform">
                          <CreditCardIcon className="w-8 h-8" />
                        </div>
                        <div>
                          <p className="font-black text-lg text-gray-900">Online Payment</p>
                          <p className="text-sm text-gray-500 mt-1 font-medium">Cards, UPI, Net Banking, Wallets</p>
                          <div className="flex gap-2 mt-3 opacity-60">
                            {/* Icons can act as trust signals here */}
                            <div className="h-6 w-10 bg-gray-200 rounded"></div>
                            <div className="h-6 w-10 bg-gray-200 rounded"></div>
                            <div className="h-6 w-10 bg-gray-200 rounded"></div>
                          </div>
                        </div>
                      </div>
                    </label>

                    <label className={`block relative p-6 rounded-3xl border-2 transition-all cursor-pointer group ${formData.paymentMethod === 'cod' ? 'border-black bg-gray-50 ring-2 ring-gray-100' : 'border-gray-100 hover:border-gray-300'}`}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cod"
                        checked={formData.paymentMethod === 'cod'}
                        onChange={handleInputChange}
                        className="absolute right-6 top-6 w-6 h-6 accent-black"
                      />
                      <div className="flex items-start gap-5">
                        <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-green-600 shadow-sm border border-gray-100 group-hover:scale-110 transition-transform">
                          <BanknotesIcon className="w-8 h-8" />
                        </div>
                        <div>
                          <p className="font-black text-lg text-gray-900">Cash on Delivery</p>
                          <p className="text-sm text-gray-500 mt-1 font-medium">Pay in cash when order is delivered</p>
                        </div>
                      </div>
                    </label>
                  </div>

                  <div className="mt-8 p-5 bg-blue-50/50 rounded-2xl border border-blue-100 flex gap-4">
                    <ShieldCheckIcon className="w-6 h-6 text-blue-600 flex-shrink-0" />
                    <div>
                      <h4 className="font-bold text-blue-900 text-sm">100% Secure Transaction</h4>
                      <p className="text-xs text-blue-700/80 mt-1 leading-relaxed">
                        Your payment information is encrypted and processed securely. We never store your card details.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4 mt-10">
                    <button
                      onClick={() => setStep('shipping')}
                      className="flex-1 py-5 rounded-2xl font-bold text-lg text-gray-500 bg-gray-50 hover:bg-gray-100 hover:text-black transition-all"
                    >
                      Back
                    </button>
                    <button
                      onClick={handlePlaceOrder}
                      className="flex-[2] bg-black text-white py-5 rounded-2xl font-black text-lg uppercase tracking-widest shadow-xl shadow-gray-900/10 hover:bg-gray-800 hover:scale-[1.01] active:scale-[0.99] transition-all"
                    >
                      Pay ₹{total.toFixed(0)}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Order Sidebar */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100">
              <h3 className="font-black text-xl text-gray-900 mb-6 flex items-center justify-between">
                <span>Order Items</span>
                <span className="text-xs px-2.5 py-1 bg-gray-900 text-white rounded-lg font-bold">{cartItems.length}</span>
              </h3>

              <div className="space-y-4 max-h-80 overflow-y-auto pr-2 custom-scrollbar mb-6">
                {cartItems.map(item => (
                  <div key={item._id} className="flex gap-4 group">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0 border border-gray-100">
                      <img
                        src={config.fixImageUrl(item.images?.[0] || item.image)}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <p className="font-bold text-gray-900 text-sm truncate">{item.name}</p>
                      <div className="flex justify-between items-center mt-1">
                        <p className="text-xs text-gray-500 font-medium">{item.quantity} x ₹{item.price}</p>
                        <p className="text-sm font-black text-gray-900">₹{(item.quantity * item.price).toFixed(0)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 pt-6 border-t border-dashed border-gray-200">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 font-medium">Subtotal</span>
                  <span className="text-gray-900 font-bold">₹{subtotal.toFixed(0)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 font-medium">Shipping</span>
                  <span className={shipping === 0 ? 'text-green-600 font-bold' : 'text-gray-900 font-bold'}>
                    {shipping === 0 ? 'FREE' : `₹${shipping}`}
                  </span>
                </div>
                <div className="flex justify-between items-end pt-4 border-t border-gray-100">
                  <span className="text-lg font-black text-gray-900">Total</span>
                  <span className="text-2xl font-black text-gray-900">₹{total.toFixed(0)}</span>
                </div>
              </div>
            </div>

            <Link
              to="/shop/cart"
              className="flex items-center justify-center gap-2 text-gray-400 font-bold hover:text-black transition-colors py-2"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              Return to Cart
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopCheckout;
