import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { CalendarDays, X } from 'lucide-react'; // Make sure to import icons
import { MapPin, RefreshCw, AlertCircle } from "lucide-react";

import {
  ArrowLeft,
  CreditCard,
  Lock,

  Phone,
  User,
  Mail,
  Building,
  Truck,
  Shield,
  CheckCircle,

  Sparkles,
  Gift,
  Clock,

  Calendar
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCity } from '../context/CityContext';
import orderService from '../services/orderService';
import paymentService from '../services/paymentService';
import { toast } from 'react-hot-toast';
import config from '../config/config.js';
import apiService from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import Loader from '../components/Loader';
import AuthPrompt from '../components/AuthPrompt';
import FlashMessage from '../components/FlashMessage';


import { settingsAPI, pinCodeServiceFeeAPI } from '../services/api';
// --- Helper for time validation ---
const validateTime = (time) => {
  if (!time) return false;
  const [hours, minutes] = time.split(':').map(Number);
  const selectedTime = new Date();
  selectedTime.setHours(hours, minutes, 0, 0);

  // Check if time is within business hours (9 AM to 9 PM)
  const businessStart = new Date();
  businessStart.setHours(9, 0, 0, 0);
  const businessEnd = new Date();
  businessEnd.setHours(21, 0, 0, 0);

  return selectedTime >= businessStart && selectedTime <= businessEnd;
};

const minDate = new Date();
minDate.setDate(minDate.getDate() + 1);


// Get PhonePe checkout object
const getPhonePeCheckout = () => {
  return new Promise((resolve, reject) => {
    if (window.PhonePeCheckout) {
      resolve(window.PhonePeCheckout);
      return;
    }

    // Wait for script to load if not already available
    const checkInterval = setInterval(() => {
      if (window.PhonePeCheckout) {
        clearInterval(checkInterval);
        resolve(window.PhonePeCheckout);
      }
    }, 100);

    // Timeout after 5 seconds
    setTimeout(() => {
      clearInterval(checkInterval);
      reject(new Error('PhonePe checkout script not loaded'));
    }, 5000);
  });
};

const Checkout = () => {
  const navigate = useNavigate();
  const routeLocation = useLocation();
  const { product, quantity, addons: initialAddons = [] } = routeLocation.state || {};
  const { user, isAuthenticated } = useAuth();
  const { selectedCity } = useCity();
  const [searchParams] = useSearchParams();

  // Add-ons state
  const [selectedAddons, setSelectedAddons] = useState(initialAddons);
  const [availableAddons, setAvailableAddons] = useState([]);
  const [showAddonsModal, setShowAddonsModal] = useState(false);
  const [addonsLoading, setAddonsLoading] = useState(false);

  const cartItems = product ? [{ product, quantity, addons: selectedAddons }] : [];

  const getTotalPrice = () => {
    if (!product) return 0;
    const productTotal = product.price * quantity;
    const addonsTotal = selectedAddons.reduce((total, addon) => total + (addon.price * addon.quantity), 0);
    return productTotal + addonsTotal;
  };

  const getAddonsTotal = () => {
    return selectedAddons.reduce((total, addon) => total + (addon.price * addon.quantity), 0);
  };

  // Fetch available add-ons
  useEffect(() => {
    const fetchAvailableAddons = async () => {
      try {
        setAddonsLoading(true);
        const url = `${config.API_BASE_URL}/api/addons?active=true`;
        const response = await fetch(url);

        if (!response.ok) {
          // Failed to fetch add-ons
          return;
        }

        const data = await response.json();
        if (data.success && data.data && Array.isArray(data.data)) {
          setAvailableAddons(data.data);
        }
      } catch (error) {
        // Error fetching add-ons
      } finally {
        setAddonsLoading(false);
      }
    };

    fetchAvailableAddons();
  }, []);

  const handleAddonToggle = (addon) => {
    setSelectedAddons(prev => {
      const exists = prev.find(a => a.addonId === addon._id);
      if (exists) {
        return prev.filter(a => a.addonId !== addon._id);
      } else {
        return [...prev, {
          addonId: addon._id,
          name: addon.name,
          price: addon.price,
          quantity: 1
        }];
      }
    });
  };

  const handleAddonQuantityChange = (addonId, newQuantity) => {
    if (newQuantity < 1) return;
    setSelectedAddons(prev =>
      prev.map(addon =>
        addon.addonId === addonId
          ? { ...addon, quantity: newQuantity }
          : addon
      )
    );
  };

  const handleRemoveAddon = (addonId) => {
    setSelectedAddons(prev => prev.filter(a => a.addonId !== addonId));
  };

  const clearCart = () => {
    // Do nothing, as there is no cart to clear
  };

  const getItemImage = (item) => {
    return item.product.images[0];
  };


  // Check if we're coming from successful payment
  const paymentSuccess = searchParams.get('paymentSuccess');
  const orderId = searchParams.get('orderId');



  // Handle successful payment redirect
  useEffect(() => {
    if (paymentSuccess === 'true' && orderId && cartItems.length > 0) {
      // Automatically place order for successful payment
      handleSuccessfulPaymentOrder();
    }
  }, [paymentSuccess, orderId, cartItems]);

  // Fetch COD upfront amount
  useEffect(() => {
    const fetchCodUpfrontAmount = async () => {
      try {
        const response = await settingsAPI.getCodUpfrontAmount();
        // Accept 0 as a valid value
        let amount = (typeof response.data?.amount !== 'undefined') ? Number(response.data.amount) : (typeof response.amount !== 'undefined' ? Number(response.amount) : 39);
        if (isNaN(amount)) amount = 39;
        setCodUpfrontAmount(amount);
        localStorage.setItem('codUpfrontAmount', amount); // Store for PaymentStatus.jsx
      } catch (error) {
        // Keep default value of 39
      }
    };
    fetchCodUpfrontAmount();
  }, []);

  const [activeStep, setActiveStep] = useState('shipping');
  const [formData, setFormData] = useState({
    // Shipping Information
    fullName: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: selectedCity || 'Patna', // Auto-select from header
    zipCode: user?.zipCode || '',
    country: user?.country || 'India',

    // Billing Information
    billingSameAsShipping: true,
    billingFullName: '',
    billingEmail: '',
    billingPhone: '',
    billingAddress: '',
    billingZipCode: '',
    billingCountry: 'India',

    // Payment Information - will be set after cart loads
    paymentMethod: 'phonepe'
  });

  // NEW: State for new fields
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');


  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);

  // Pin code service fee state
  const [pinCodeServiceFee, setPinCodeServiceFee] = useState(0);
  const [pinCodeServiceFeeLoading, setPinCodeServiceFeeLoading] = useState(false);
  const [pinCodeServiceFeeChecked, setPinCodeServiceFeeChecked] = useState(false);
  const [pinCodeServiceFeeError, setPinCodeServiceFeeError] = useState('');
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [cartLoading, setCartLoading] = useState(true);
  const [codUpfrontAmount, setCodUpfrontAmount] = useState(39); // Default value
  const [cartLoaded, setCartLoaded] = useState(false);
  const [isFetchingAddress, setIsFetchingAddress] = useState(false);

  useEffect(() => {
    // Since cart items are passed directly, we can consider them "loaded" immediately.
    setCartLoading(false);
    setCartLoaded(true);
  }, []);

  // --- Add this state to your Checkout component ---

  const [showScheduler, setShowScheduler] = useState(false);


  // Pre-fill form with user data if logged in
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        city: selectedCity || user.city || 'Patna',
      }));
    }
  }, [user, selectedCity]);

  // Update city when selectedCity changes
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      city: selectedCity || 'Patna'
    }));
  }, [selectedCity]);

  // Copy shipping address to billing when checkbox is checked
  useEffect(() => {
    if (formData.billingSameAsShipping) {
      setFormData(prev => ({
        ...prev,
        billingFullName: prev.fullName,
        billingEmail: prev.email,
        billingPhone: prev.phone,
        billingAddress: prev.address,
        billingZipCode: prev.zipCode,
        billingCountry: prev.country,
      }));
    }
  }, [formData.billingSameAsShipping, formData.fullName, formData.email, formData.phone, formData.address, formData.zipCode, formData.country]);





  const validateForm = () => {
    const errors = {};
    const requiredFields = ['fullName', 'email', 'phone', 'city', 'address', 'zipCode'];

    requiredFields.forEach(field => {
      if (!formData[field] || formData[field].trim() === '') {
        const fieldLabel = field === 'zipCode' ? 'PIN Code' :
          field === 'fullName' ? 'Full Name' :
            field.charAt(0).toUpperCase() + field.slice(1);
        errors[field] = `${fieldLabel} is required`;
      }
    });

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      errors.email = 'Invalid email format';
    }

    // Phone validation
    const phoneRegex = /^[\d\s-+()]{10,}$/;
    if (formData.phone && !phoneRegex.test(formData.phone)) {
      errors.phone = 'Invalid phone number';
    }

    // Pin code validation - must be checked before order placement
    if (formData.zipCode && /^\d{6}$/.test(formData.zipCode) && !pinCodeServiceFeeChecked) {
      errors.zipCode = 'Please wait for pin code verification to complete';
    }

    // Pin code service fee error validation
    if (pinCodeServiceFeeError) {
      errors.zipCode = pinCodeServiceFeeError;
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }

    // Reset pin code service fee when pin code changes
    if (name === 'zipCode') {
      setPinCodeServiceFee(0);
      setPinCodeServiceFeeChecked(false);
      setPinCodeServiceFeeError('');

      // Auto-check pin code when user enters 6 digits
      if (value && /^\d{6}$/.test(value)) {
        checkPinCodeServiceFee(value);
      }
    }
  };


  // Calculate shipping cost based on payment method and order total
  const calculateShippingCost = () => {
    // Free delivery for all orders
    return 0;
  };

  // Calculate COD extra charge (dynamic amount for COD orders)
  const getCodExtraCharge = () => {
    return formData.paymentMethod === 'cod' ? codUpfrontAmount : 0;
  };

  // Check pin code service fee AND validate city
  const checkPinCodeServiceFee = async (pinCode) => {
    if (!pinCode || !/^\d{6}$/.test(pinCode)) {
      setPinCodeServiceFeeError('Please enter a valid 6-digit pin code');
      return;
    }

    setPinCodeServiceFeeLoading(true);
    setPinCodeServiceFeeError('');
    setPinCodeServiceFeeChecked(false);

    try {
      // 1. Validate Pin Code against City
      const pinCodeResponse = await fetch(`https://api.postalpincode.in/pincode/${pinCode}`);
      const pinCodeData = await pinCodeResponse.json();

      if (pinCodeData && pinCodeData[0].Status === "Success") {
        const postOffices = pinCodeData[0].PostOffice;
        const selectedCity = formData.city.toLowerCase().trim();

        const matchFound = postOffices.some(po => {
          const district = po.District ? po.District.toLowerCase() : '';
          const division = po.Division ? po.Division.toLowerCase() : '';
          const region = po.Region ? po.Region.toLowerCase() : '';
          const block = po.Block ? po.Block.toLowerCase() : '';

          // Check if district, division, region or block matches the selected city
          return [district, division, region, block].some(field =>
            field && (
              field === selectedCity ||
              field.includes(selectedCity) ||
              selectedCity.includes(field)
            )
          );
        });

        if (!matchFound) {
          setPinCodeServiceFeeError(`This pin code does not belong to ${formData.city}. Please enter a valid pin code for ${formData.city}.`);
          setPinCodeServiceFeeLoading(false);
          return;
        }

      } else {
        setPinCodeServiceFeeError('Invalid Pin Code');
        setPinCodeServiceFeeLoading(false);
        return;
      }

      // 2. If valid, check service fee (Existing logic)
      const response = await pinCodeServiceFeeAPI.checkPinCodeServiceFee(pinCode);
      const serviceFee = response.data.serviceFee || 0;

      setPinCodeServiceFee(serviceFee);
      setPinCodeServiceFeeChecked(true);

      if (serviceFee > 0) {
        toast.success(`Service fee for pin code ${pinCode}: ₹${serviceFee}`);
      } else {
        toast.success(`No additional service fee for pin code ${pinCode}`);
      }
    } catch (error) {
      // Error checking pin code service fee
      console.error(error);
      setPinCodeServiceFeeError('Failed to validate pin code. Please try again.');
      toast.error('Failed to check service fee');
    } finally {
      setPinCodeServiceFeeLoading(false);
    }
  };

  // Re-validate pin code when city changes
  useEffect(() => {
    if (formData.zipCode && /^\d{6}$/.test(formData.zipCode)) {
      checkPinCodeServiceFee(formData.zipCode);
    }
  }, [formData.city]);

  // Calculate final total
  const getFinalTotal = () => {
    const subtotal = getTotalPrice();
    const shipping = calculateShippingCost();
    const codExtra = getCodExtraCharge();
    // Use discounted price if coupon is applied
    const discountedSubtotal = appliedCoupon ? appliedCoupon.finalPrice : subtotal;
    return discountedSubtotal + shipping + codExtra + pinCodeServiceFee;
  };

  // Calculate amount to be paid online (for COD: only 39 rupees upfront, for online: full amount)
  const getOnlinePaymentAmount = () => {
    if (formData.paymentMethod === 'cod') {
      return getCodExtraCharge(); // Only 39 rupees for COD upfront
    } else {
      return getFinalTotal(); // Full amount for online payment (discounted if coupon applied)
    }
  };

  // Prepares the full order data object for submission
  const prepareOrderData = () => {
    let scheduledDeliveryISO = null;
    if (scheduledDate && scheduledTime && validateTime(scheduledTime)) {
      scheduledDeliveryISO = new Date(`${scheduledDate}T${scheduledTime}`).toISOString();
    }

    // NEW: Structure the address payload with city and location

    const addressPayload = {
      street: formData.address,
      city: formData.city,
      pincode: formData.zipCode,
      country: formData.country,
    };

    // Get sellerToken from URL params
    const urlParams = new URLSearchParams(window.location.search);
    const sellerToken = urlParams.get('seller');

    // NEW: Persist all form data including new fields
    const checkoutDataToSave = {
      ...formData,
      scheduledDate,
      scheduledTime
    };
    localStorage.setItem('checkoutFormData', JSON.stringify(checkoutDataToSave));
    localStorage.setItem('checkoutCartItems', JSON.stringify(cartItems));

    const orderData = {
      customerName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      address: addressPayload, // Use the new structured address payload
      items: cartItems.map(item => ({
        productId: item.product?._id || item.id,
        name: item.product?.name || item.name,
        quantity: item.quantity,
        price: item.product?.price || item.price,
        image: getItemImage(item)
      })),
      addOns: selectedAddons.map(addon => ({
        name: addon.name,
        price: addon.price,
        quantity: addon.quantity
      })),
      totalAmount: getFinalTotal(),
      shippingCost: calculateShippingCost(),
      codExtraCharge: getCodExtraCharge(),
      finalTotal: getFinalTotal(),
      paymentMethod: formData.paymentMethod,
      sellerToken: sellerToken || '',
      couponCode: appliedCoupon ? appliedCoupon.code : undefined,
      scheduledDelivery: scheduledDeliveryISO, // Add the new field
    };


    return orderData;
  };

  const handleCodOrder = async () => {
    if (codUpfrontAmount > 0) {
      await handlePhonePePayment(); // This handles the upfront payment via PhonePe
      return;
    }

    setLoading(true);
    setError(null);
    if (!validateForm()) {
      setError("Please fill in all required fields correctly.");
      setLoading(false);
      return;
    }

    const orderData = {
      ...prepareOrderData(),
      paymentStatus: 'pending',
      upfrontAmount: 0,
      remainingAmount: getFinalTotal(),
    };

    try {
      const response = await orderService.createOrder(orderData);
      if (response.success) {
        toast.success('Order placed successfully! Pay on delivery.');
        clearCart();
        localStorage.removeItem('checkoutFormData');
        localStorage.removeItem('checkoutCartItems');
        navigate(isAuthenticated ? '/account?tab=orders' : `/order-confirmation/${response.order._id}`, { state: { order: response.order } });
      } else {
        setError(response.message || "Failed to create order.");
      }
    } catch (err) {
      setError("Failed to create order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePhonePePayment = async () => {
    setPaymentProcessing(true);
    setError(null);
    if (!validateForm()) {
      setError("Please fill in all required fields correctly.");
      setPaymentProcessing(false);
      return;
    }

    const orderData = prepareOrderData();
    const paymentAmount = formData.paymentMethod === 'cod' ? codUpfrontAmount : orderData.totalAmount;

    if (paymentAmount < 1) {
      setError("Order amount must be at least ₹1 for online payment.");
      setPaymentProcessing(false);
      return;
    }

    // Add payment-specific details
    const paymentPayload = {
      ...orderData,
      amount: paymentAmount,
      paymentStatus: formData.paymentMethod === 'cod' ? 'pending_upfront' : 'processing',
      upfrontAmount: formData.paymentMethod === 'cod' ? codUpfrontAmount : 0,
      remainingAmount: formData.paymentMethod === 'cod' ? (getFinalTotal() - codUpfrontAmount) : 0,
    };

    try {
      const data = await paymentService.initiatePhonePePayment(paymentPayload);
      if (data.success && data.redirectUrl) {
        const PhonePeCheckout = await getPhonePeCheckout();
        PhonePeCheckout.transact({
          tokenUrl: data.redirectUrl,
          callback: (response) => {
            if (response === 'CONCLUDED') {
              setTimeout(() => {
                window.location.href = `${window.location.origin}/payment/status?orderId=${data.orderId}`;
              }, 1000);
            } else {
              toast.error('Payment was cancelled or failed.');
              setPaymentProcessing(false);
            }
          }
        });
      } else {
        setError(data.message || "Failed to initiate PhonePe payment.");
        setPaymentProcessing(false);
      }
    } catch (error) {
      setError(error.message || "Failed to process PhonePe payment.");
      setPaymentProcessing(false);
    }
  };

  const handleCouponSubmit = async (e) => {
    e.preventDefault(); // Prevent form submission
    e.stopPropagation(); // Stop event bubbling
    if (!couponCode.trim()) return;

    setCouponLoading(true);
    setCouponError('');

    try {
      // Use the direct API endpoint
      const validateResponse = await fetch(`${config.API_BASE_URL}/api/coupons/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(localStorage.getItem('seller_jwt') ? {
            'Authorization': `Bearer ${localStorage.getItem('seller_jwt')}`
          } : {})
        },
        body: JSON.stringify({
          code: couponCode,
          cartTotal: getTotalPrice()
        })
      });

      const data = await validateResponse.json();

      if (data.success) {
        const { coupon, discountAmount, finalPrice, message } = data.data;

        // Apply the coupon
        const applyResponse = await fetch(`${config.API_BASE_URL}/api/coupons/apply`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(localStorage.getItem('seller_jwt') ? {
              'Authorization': `Bearer ${localStorage.getItem('seller_jwt')}`
            } : {})
          },
          body: JSON.stringify({ code: coupon.code })
        });

        const applyData = await applyResponse.json();

        if (applyData.success) {
          setAppliedCoupon({
            code: coupon.code,
            discountAmount,
            finalPrice,
            discountPercentage: coupon.discountValue
          });
          setCouponCode('');
          toast.success(message);
        } else {
          setCouponError('Failed to apply coupon. Please try again.');
        }
      } else {
        setCouponError(data.message || 'Invalid coupon code');
      }
    } catch (error) {

      const errorMessage = 'Failed to process coupon. Please try again.';
      setCouponError(errorMessage);
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = (e) => {
    e.preventDefault(); // Prevent any form submission
    e.stopPropagation(); // Stop event bubbling
    setAppliedCoupon(null);
    setCouponError('');
    toast.success('Coupon removed successfully');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setError("Please fill in all required fields correctly.");
      return;
    }

    // Handle different payment methods
    if (formData.paymentMethod === 'cod') {
      await handleCodOrder();
    } else if (formData.paymentMethod === 'phonepe') {
      await handlePhonePePayment();
    } else {
      setError("Please select a valid payment method.");
    }
  };

  const handleSuccessfulPaymentOrder = async () => {
    try {
      // Check if order has already been placed for this payment
      const orderKey = `order_placed_${orderId}`;
      const orderAlreadyPlaced = localStorage.getItem(orderKey);

      if (orderAlreadyPlaced === 'true') {

        toast.success('Order already placed successfully!');
        clearCart();

        // Clear persisted data after order placed
        localStorage.removeItem('checkoutFormData');
        localStorage.removeItem('checkoutCartItems');
        navigate('/');
        return;
      }

      setLoading(true);

      // Create order data for successful payment
      const orderData = {
        ...prepareOrderData(),
        paymentStatus: 'completed',
        upfrontAmount: 0,
        remainingAmount: 0,
        phonepeOrderId: orderId,
      };

      const response = await orderService.createOrder(orderData);

      if (response.success) {
        // Mark this order as placed to prevent duplicates
        localStorage.setItem(orderKey, 'true');
        toast.success('Order placed successfully!');
        clearCart();

        // Clear persisted data after order placed
        localStorage.removeItem('checkoutFormData');
        localStorage.removeItem('checkoutCartItems');
        if (isAuthenticated) {
          navigate('/account?tab=orders');
        } else {
          navigate(`/order-confirmation/${response.order._id}`, { state: { order: response.order } });
        }
      } else {
        toast.error(response.message || 'Failed to place order');
      }
    } catch (err) {

      toast.error('Failed to place order: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };



  if (cartLoading || !cartLoaded || !formData.paymentMethod) {
    return <Loader />;
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-grey-500 via-white to-grey-100 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="w-24 h-24 bg-grey-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Truck size={48} className="text-grey-400" />
          </div>
          <h2 className="text-2xl font-bold text-grey-900 mb-4">Your cart is empty</h2>
          <p className="text-grey-700 mb-8">Please add items to your cart before proceeding to checkout.</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/shop')}
            className=" text-white px-8 py-4 rounded-xl font-medium  transition-all duration-200"
          >
            Continue Shopping
          </motion.button>
        </motion.div>
      </div>
    );
  }

  const subtotal = getTotalPrice();
  const discount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const finalTotal = appliedCoupon ? appliedCoupon.finalPrice : subtotal;

  return (
    <div className="min-h-screen">
      {/* Header */}


      <div className="container mx-auto ">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Checkout Form */}
          <div className="w-full">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl shadow-xl border overflow-hidden"
            >
              <div className="p-8">




                <form onSubmit={handleSubmit}>
                  {/* Shipping Information */}
                  <div className="mb-8">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-10 h-10 bg-gradient-to-r from-grey to-grey rounded-full flex items-center justify-center">
                        <MapPin size={20} className="text-[#FCD24C]" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-grey">Shipping Information</h3>
                        <p className="text-grey/70 text-sm">Where should we deliver your order?</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-grey mb-2">
                          Full Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-grey focus:border-transparent transition-all duration-200 ${fieldErrors.fullName ? 'border-red-300 bg-red-50' : 'border-grey/30 bg-grey/5'
                            }`}
                          required
                        />
                        {fieldErrors.fullName && (
                          <p className="text-red-500 text-sm mt-1 flex items-center">
                            <AlertCircle size={14} className="mr-1" />
                            {fieldErrors.fullName}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-grey mb-2">
                          Email <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-grey focus:border-transparent transition-all duration-200 ${fieldErrors.email ? 'border-red-300 bg-red-50' : 'border-grey/30 bg-grey/5'
                            }`}
                          required
                        />
                        {fieldErrors.email && (
                          <p className="text-red-500 text-sm mt-1 flex items-center">
                            <AlertCircle size={14} className="mr-1" />
                            {fieldErrors.email}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-grey mb-2">
                          Phone <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-grey focus:border-transparent transition-all duration-200 ${fieldErrors.phone ? 'border-red-300 bg-red-50' : 'border-grey/30 bg-grey/5'
                            }`}
                          required
                        />
                        {fieldErrors.phone && (
                          <p className="text-red-500 text-sm mt-1 flex items-center">
                            <AlertCircle size={14} className="mr-1" />
                            {fieldErrors.phone}
                          </p>
                        )}
                      </div>



                      {/* City Field (Auto-selected, Read-only) */}
                      <div>
                        <label className="block text-sm font-semibold text-grey-900 mb-2">
                          Delivery City <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-grey-400" size={18} />
                          <input
                            type="text"
                            name="city"
                            value={formData.city}
                            readOnly
                            className="w-full pl-10 pr-4 py-3 border border-grey-200 bg-grey-100 rounded-xl text-grey-700 font-semibold cursor-not-allowed"
                            placeholder="City"
                          />
                        </div>
                        <p className="text-xs text-grey-500 mt-1 flex items-center gap-1">
                          <Lock size={12} />
                          Auto-selected from header. Change city from the header to update delivery location.
                        </p>
                      </div>

                      {/* Street Address Field */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-grey-900 mb-2">
                          Street Address <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Building className="absolute left-3 top-3 text-grey-400" size={18} />
                          <input
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            placeholder="Street, Area, Landmark"
                            className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-grey-500 focus:border-transparent transition-all duration-200 ${fieldErrors.address ? 'border-red-300 bg-red-50' : 'border-grey-200 bg-grey-50/30'
                              }`}
                            required
                          />
                        </div>
                        {fieldErrors.address && (
                          <p className="text-red-500 text-sm mt-1 flex items-center">
                            <AlertCircle size={14} className="mr-1" />
                            {fieldErrors.address}
                          </p>
                        )}
                      </div>

                      {/* PIN Code Field */}
                      <div>
                        <label className="block text-sm font-semibold text-grey mb-2">PIN Code <span className="text-red-500">*</span></label>
                        <div className="flex gap-2">
                          <div className="flex-1 relative">
                            <input
                              type="text"
                              name="zipCode"
                              value={formData.zipCode}
                              onChange={handleInputChange}
                              maxLength="6"
                              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-grey focus:border-transparent transition-all duration-200 ${fieldErrors.zipCode ? 'border-red-300 bg-red-50' :
                                pinCodeServiceFeeLoading ? 'border-blue-300 bg-blue-50' :
                                  pinCodeServiceFeeChecked ? 'border-green-300 bg-green-50' :
                                    'border-grey/30 bg-grey/5'
                                }`}
                              placeholder="Enter 6-digit pin code"
                              required
                            />
                            {pinCodeServiceFeeLoading && (
                              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                <RefreshCw size={16} className="animate-spin text-blue-600" />
                              </div>
                            )}
                            {pinCodeServiceFeeChecked && !pinCodeServiceFeeLoading && (
                              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                <CheckCircle size={16} className="text-green-600" />
                              </div>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => checkPinCodeServiceFee(formData.zipCode)}
                            disabled={pinCodeServiceFeeLoading || !formData.zipCode || formData.zipCode.length !== 6}
                            className="text-black px-4 py-3 bg-blue-600 rounded-xl hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 transition-colors flex items-center gap-2 border"
                          >
                            {pinCodeServiceFeeLoading ? (
                              <RefreshCw size={16} className="animate-spin" />
                            ) : (
                              <MapPin size={16} />
                            )}
                            Check
                          </button>
                        </div>
                        {fieldErrors.zipCode && <p className="text-red-500 text-sm mt-1 flex items-center"><AlertCircle size={14} className="mr-1" />{fieldErrors.zipCode}</p>}
                        {pinCodeServiceFeeError && <p className="text-red-500 text-sm mt-1 flex items-center"><AlertCircle size={14} className="mr-1" />{pinCodeServiceFeeError}</p>}
                        {formData.zipCode && /^\d{6}$/.test(formData.zipCode) && pinCodeServiceFeeLoading && (
                          <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-center space-x-2">
                              <RefreshCw size={16} className="animate-spin text-blue-600" />
                              <span className="text-sm text-blue-800">
                                Verifying pin code and calculating service fee...
                              </span>
                            </div>
                          </div>
                        )}
                        {pinCodeServiceFeeChecked && (
                          <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-green-800">
                                ✓ Service Fee for {formData.zipCode}:
                              </span>
                              <span className="font-semibold text-green-900">
                                ₹{pinCodeServiceFee}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>




                    </div>
                  </div>

                  {/* NEW: Delivery Schedule Section */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 transition-all duration-300">
                    {!showScheduler ? (
                      // Initial Collapsed View
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-white border rounded-full flex items-center justify-center">
                            <CalendarDays size={20} className="text-[#FCD24C]" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-blue-800">Schedule Your Delivery</h3>

                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowScheduler(true)}
                          className="px-4 py-2 text-sm font-semibold text-blue bg-grey rounded-lg hover:bg-grey/90 transition-colors"
                        >
                          <CalendarDays size={20} className="text-[#FCD24C]" />
                        </button>
                      </div>
                    ) : (
                      // Expanded Scheduler View
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-bold text-grey">Select a Date & Time Slot</h3>
                          <button
                            type="button"
                            onClick={() => {
                              setShowScheduler(false);
                              setScheduledDate('');
                              setScheduledTime('');
                            }}
                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-100 rounded-full"
                            aria-label="Clear schedule"
                          >
                            <X size={20} />
                          </button>
                        </div>

                        <div className="space-y-4">
                          {/* Step 1: Date Picker */}
                          <div>
                            <label className="block text-sm font-semibold text-grey mb-2">1. Choose a Date (you can only book for minimum 1 day advance)</label>
                            <input
                              type="date"
                              name="scheduledDate"
                              value={scheduledDate}
                              onChange={(e) => setScheduledDate(e.target.value)}
                              min={minDate.toISOString().split('T')[0]}
                              className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-grey focus:border-transparent transition-all duration-200"
                            />
                          </div>

                          {/* Step 2: Time Input (only show after a date is selected) */}
                          {scheduledDate && (
                            <div>
                              <label className="block text-sm font-semibold text-grey mb-2">2. Select Delivery Time (9:00 AM - 9:00 PM)</label>
                              <input
                                type="time"
                                name="scheduledTime"
                                value={scheduledTime}
                                onChange={(e) => setScheduledTime(e.target.value)}
                                min="09:00"
                                max="21:00"
                                className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-grey focus:border-transparent transition-all duration-200"
                                required
                              />
                              {scheduledTime && !validateTime(scheduledTime) && (
                                <p className="text-red-500 text-xs mt-1">Please select a time between 9:00 AM and 9:00 PM</p>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Confirmation Message */}
                        {scheduledDate && scheduledTime && validateTime(scheduledTime) && (
                          <div className="mt-5 p-3 bg-green-50 border border-green-200 text-green-800 rounded-lg text-sm text-center">
                            🚚 Delivery scheduled for <strong>{new Date(scheduledDate).toLocaleDateString('en-GB', { weekday: 'long', month: 'long', day: 'numeric' })}</strong>
                            at <strong>{new Date(`2000-01-01T${scheduledTime}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</strong>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Payment Method */}
                  <div className="bg-white text-black rounded-xl p-6 mb-8">
                    <h2 className="text-lg font-semibold mb-4">Payment Method</h2>
                    <div className="flex flex-col gap-4">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="phonepe"
                          checked={formData.paymentMethod === 'phonepe'}
                          onChange={handleInputChange}
                          className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <div className="flex-1">
                          <span className="text-gray-800 font-medium">UPI (PhonePe)</span>
                          <p className="text-sm text-gray-600 mt-1">
                            Pay securely using UPI via PhonePe
                          </p>
                        </div>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="cod"
                          checked={formData.paymentMethod === 'cod'}
                          onChange={handleInputChange}
                          className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <div className="flex-1">
                          <span className="text-gray-800 font-medium">Cash on Delivery (COD)</span>
                          <p className="text-sm text-gray-600 mt-1">
                            Pay upon receiving your order.
                          </p>
                        </div>
                      </label>
                    </div>
                  </div>


                </form>
              </div>
            </motion.div>
          </div>

          {/* Order Summary */}
          <div className="w-full lg:w-1/3">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl shadow-xl border border-grey/20 p-6 sticky top-24"
            >
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 bg-gradient-to-r from-grey to-grey rounded-full flex items-center justify-center">
                  <Truck size={16} className="text-white" />
                </div>
                <h3 className="text-xl font-bold text-grey">Order Summary</h3>
              </div>

              <div className="space-y-4 mb-6">
                {!cartLoaded ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-grey"></div>
                    <span className="ml-3 text-gray-600">Loading cart items...</span>
                  </div>
                ) : (
                  cartItems.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center space-x-4 p-3 bg-grey/5 rounded-xl"
                    >
                      <div className="relative">
                        <img
                          src={config.fixImageUrl(getItemImage(item))}
                          alt={item.product?.name || item.name}
                          className="w-16 h-16 rounded-lg object-cover border border-grey/20"
                          onError={e => {
                            e.target.onerror = null;
                            if (item.product?.images && item.product.images.length > 0) {
                              const nextImage = item.product.images.find(img => img !== e.target.src);
                              if (nextImage) {
                                e.target.src = config.fixImageUrl(nextImage);
                                return;
                              }
                            }
                            e.target.src = 'https://placehold.co/150x150/e2e8f0/475569?text=Product';
                          }}
                        />
                        <span className="absolute -top-2 -right-2 bg-gradient-to-r from-grey to-grey text-black text-xs rounded-full h-6 w-6 flex items-center justify-center font-semibold">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-grey-900 line-clamp-2">
                          {item.product?.name || item.name}
                        </h4>
                        <p className="text-sm text-grey-600">
                          ₹{(item.product?.price || item.price).toFixed(2)}
                        </p>
                      </div>
                      <p className="text-sm font-bold text-grey-900">
                        ₹{((item.product?.price || item.price) * item.quantity).toFixed(2)}
                      </p>
                    </motion.div>
                  ))
                )}
              </div>

              {/* Add-ons Section */}
              <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Gift size={16} className="text-amber-600" />
                    Add-ons {selectedAddons.length > 0 && `(${selectedAddons.length})`}
                  </h4>
                  <button
                    onClick={() => setShowAddonsModal(true)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-lg text-xs font-semibold transition-colors border border-amber-200"
                  >
                    <Gift size={14} />
                    {selectedAddons.length > 0 ? 'Edit' : 'Add'}
                  </button>
                </div>

                {selectedAddons.length > 0 ? (
                  <>
                    {selectedAddons.map((addon, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-200"
                      >
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{addon.name}</p>
                          <p className="text-xs text-gray-600">
                            ₹{addon.price.toFixed(2)} × {addon.quantity}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <p className="text-sm font-bold text-amber-600">
                            ₹{(addon.price * addon.quantity).toFixed(2)}
                          </p>
                          <button
                            onClick={() => handleRemoveAddon(addon.addonId)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-sm font-semibold text-gray-700">Add-ons Total:</span>
                      <span className="text-sm font-bold text-amber-600">₹{getAddonsTotal().toFixed(2)}</span>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-gray-500 italic">No add-ons selected</p>
                )}
              </div>

              {/* Coupon Code Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="bg-white text-black px-6 py-5 rounded-xl shadow-md border-slate-600"
              >
                {/* Header */}
                <div className="flex items-center space-x-2 mb-4">
                  <Gift size={20} className="text-black" />
                  <h3 className="text-lg font-bold">Have a coupon?</h3>
                </div>

                {/* If no coupon applied */}
                {!appliedCoupon ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => {
                        setCouponCode(e.target.value);
                        setCouponError('');
                      }}
                      placeholder="Enter coupon code"
                      className="flex-1 px-4 py-2 border border-black/20 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent bg-white text-gray-800"
                      disabled={couponLoading}
                    />
                    <button
                      onClick={handleCouponSubmit}
                      disabled={couponLoading || !couponCode.trim()}
                      className="px-5 py-2 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {couponLoading ? 'Applying...' : 'Apply'}
                    </button>
                  </div>
                ) : (
                  /* If coupon applied */
                  <div className="flex items-center justify-between bg-green-50 p-3 rounded-lg border border-green-200">
                    <div className="flex items-center space-x-2">
                      <CheckCircle size={20} className="text-green-600" />
                      <div>
                        <p className="text-green-800 font-semibold">{appliedCoupon.code}</p>
                        <p className="text-sm text-green-600">
                          {appliedCoupon.discountPercentage}% off (₹{appliedCoupon.discountAmount.toFixed(2)} saved)
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={removeCoupon}
                      type="button"
                      className="text-black/70 hover:text-black font-medium text-sm"
                    >
                      Remove
                    </button>
                  </div>
                )}

                {/* Error Message */}
                {couponError && (
                  <p className="mt-2 text-red-600 text-sm flex items-center">
                    <AlertCircle size={14} className="mr-1" />
                    {couponError}
                  </p>
                )}
              </motion.div>


              <div className="bg-white rounded-xl p-6 mb-8">
                <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
                {!cartLoaded || !formData.paymentMethod ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-grey-500"></div>
                    <span className="ml-2 text-gray-600">Calculating totals...</span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Subtotal ({cartItems.length} items)</span>
                      <span>₹{getTotalPrice().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Shipping</span>
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="flex items-center space-x-2"
                      >
                        <span className="text-green-600 font-bold">FREE</span>
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                          className="text-green-500"
                        >
                          ✨
                        </motion.div>
                      </motion.div>
                    </div>
                    {appliedCoupon && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount ({appliedCoupon.code})</span>
                        <span>-₹{appliedCoupon.discountAmount.toFixed(2)}</span>
                      </div>
                    )}
                    {formData.paymentMethod === 'cod' && (
                      <div className="flex justify-between">
                        <span>COD Extra Charge</span>
                        <span>₹{getCodExtraCharge().toFixed(2)}</span>
                      </div>
                    )}
                    {pinCodeServiceFee > 0 && (
                      <div className="flex justify-between text-blue-600">
                        <span>Service Fee (Pin: {formData.zipCode})</span>
                        <span>₹{pinCodeServiceFee.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="border-t pt-3">
                      <div className="flex justify-between font-semibold text-lg">
                        <span>Total Amount</span>
                        <span>₹{getFinalTotal().toFixed(2)}</span>
                      </div>
                      {formData.paymentMethod === 'cod' && codUpfrontAmount === 0 && (
                        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <div className="text-sm text-green-700 font-medium mb-2">Payment Breakdown:</div>
                          <div className="space-y-1 text-xs">
                            <div className="flex justify-between">
                              <span className="text-green-600">Upfront Payment (Online):</span>
                              <span className="font-medium text-green-700">₹0</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-green-600">On Delivery:</span>
                              <span className="font-medium text-green-700">₹{getFinalTotal().toFixed(2)}</span>
                            </div>
                            <div className="border-t border-green-200 pt-1 mt-1">
                              <div className="flex justify-between font-medium">
                                <span className="text-green-800">Total:</span>
                                <span className="text-green-800">₹{getFinalTotal().toFixed(2)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmit}
                disabled={loading || paymentProcessing || !cartLoaded || !formData.paymentMethod || pinCodeServiceFeeLoading || (formData.zipCode && /^\d{6}$/.test(formData.zipCode) && !pinCodeServiceFeeChecked)}
                className="w-full mt-6 
             bg-gradient-to-r from-[#FCD24C] to-[#FCD24C]
             hover:from-[#FCD24C] hover:to-[#FCD24C]
             text-white px-6 py-4 rounded-xl font-semibold
             transition-all duration-200 
             disabled:opacity-50 disabled:cursor-not-allowed
             flex items-center justify-center space-x-2 shadow-md"
              >
                {loading || paymentProcessing || !cartLoaded || !formData.paymentMethod ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : pinCodeServiceFeeLoading ? (
                  <>
                    <RefreshCw size={20} className="text-white animate-spin" />
                    <span>Checking Pin Code...</span>
                  </>
                ) : (formData.zipCode && /^\d{6}$/.test(formData.zipCode) && !pinCodeServiceFeeChecked) ? (
                  <>
                    <RefreshCw size={20} className="text-white" />
                    <span>Please wait for pin code verification...</span>
                  </>
                ) : (
                  <>
                    <Lock size={20} className="text-white" />
                    <span>
                      {formData.paymentMethod === 'cod' && codUpfrontAmount === 0
                        ? 'Place Order (Pay on Delivery)'
                        : formData.paymentMethod === 'cod'
                          ? `Pay ₹${codUpfrontAmount} Online + Rest on Delivery`
                          : 'Proceed to PhonePe Payment'}
                    </span>
                  </>
                )}
              </motion.button>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl"
                >
                  <p className="text-red-700 text-sm flex items-center">
                    <AlertCircle size={16} className="mr-2" />
                    {error}
                  </p>
                </motion.div>
              )}




            </motion.div>
          </div>
        </div>
      </div>

      {/* Add-ons Edit Modal */}
      <AnimatePresence>
        {showAddonsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={() => setShowAddonsModal(false)}
          >
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="sticky top-0 bg-gradient-to-r from-amber-500 to-orange-500 text-white p-6 z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold">Enhance Your Order</h3>
                    <p className="text-amber-50 text-sm mt-1">Add or edit optional add-ons</p>
                  </div>
                  <button
                    onClick={() => setShowAddonsModal(false)}
                    className="p-2 hover:bg-white/20 rounded-full transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="overflow-y-auto max-h-[calc(90vh-200px)] p-6">
                {addonsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto"></div>
                      <p className="mt-4 text-gray-600">Loading add-ons...</p>
                    </div>
                  </div>
                ) : !availableAddons || availableAddons.length === 0 ? (
                  <div className="text-center py-12">
                    <Gift className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-900 font-semibold mb-2">No add-ons available</p>
                    <p className="text-gray-600 text-sm">Continue with your order</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-500 mb-2">Available add-ons: {availableAddons.length}</p>
                    {availableAddons.map((addon) => {
                      const isSelected = selectedAddons.find(a => a.addonId === addon._id);
                      return (
                        <motion.div
                          key={addon._id}
                          whileHover={{ scale: 1.02 }}
                          className={`border-2 rounded-2xl p-4 cursor-pointer transition-all ${isSelected
                            ? 'border-amber-500 bg-amber-50'
                            : 'border-gray-200 hover:border-amber-300 bg-white'
                            }`}
                          onClick={() => handleAddonToggle(addon)}
                        >
                          <div className="flex gap-4">
                            {/* Image */}
                            {addon.image && (
                              <div className="flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden bg-gray-100">
                                <img
                                  src={config.fixImageUrl(addon.image)}
                                  alt={addon.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                  }}
                                />
                              </div>
                            )}

                            {/* Details */}
                            <div className="flex-1">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h4 className="font-semibold text-gray-900">{addon.name}</h4>
                                  <p className="text-lg font-bold text-amber-600 mt-2">₹{addon.price}</p>
                                </div>

                                {/* Checkbox */}
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ml-2 flex-shrink-0 ${isSelected ? 'bg-amber-500 border-amber-500' : 'border-gray-300'
                                  }`}>
                                  {isSelected && (
                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                  )}
                                </div>
                              </div>

                              {/* Quantity Selector */}
                              {isSelected && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="flex items-center gap-3 mt-3"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <span className="text-sm text-gray-600 font-medium">Quantity:</span>
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleAddonQuantityChange(addon._id, isSelected.quantity - 1);
                                      }}
                                      className="w-8 h-8 rounded-lg bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
                                    >
                                      -
                                    </button>
                                    <span className="w-12 text-center font-semibold">{isSelected.quantity}</span>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleAddonQuantityChange(addon._id, isSelected.quantity + 1);
                                      }}
                                      className="w-8 h-8 rounded-lg bg-amber-500 hover:bg-amber-600 text-white flex items-center justify-center transition-colors"
                                    >
                                      +
                                    </button>
                                  </div>
                                </motion.div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6">
                {selectedAddons.length > 0 && (
                  <div className="mb-4 p-4 bg-amber-50 rounded-xl">
                    <div className="flex justify-between items-center text-sm mb-2">
                      <span className="text-gray-600">Add-ons Total:</span>
                      <span className="font-semibold text-amber-600">₹{getAddonsTotal().toFixed(2)}</span>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => setShowAddonsModal(false)}
                  className="w-full px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all"
                >
                  {selectedAddons.length > 0 ? `Apply (${selectedAddons.length} add-on${selectedAddons.length > 1 ? 's' : ''})` : 'Close'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Checkout;
