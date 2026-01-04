import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import {
  TrashIcon,
  MinusIcon,
  PlusIcon,
  ArrowLeftIcon,
  ShoppingBagIcon,
  TruckIcon,
  ShieldCheckIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import config from '../config/config';
import SEO from '../components/SEO/SEO';

const ShopCart = () => {
  const { cartItems, removeFromCart, updateQuantity, getCartTotal, getCartCount } = useCart();
  const navigate = useNavigate();

  const subtotal = getCartTotal();
  const shipping = subtotal > 1000 ? 0 : 99;
  const total = subtotal + shipping;

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 bg-gray-50/30">
        <SEO title="Your Cart | TodayMyDream" />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-lg w-full bg-white p-12 rounded-[2.5rem] shadow-2xl shadow-gray-100/50 border border-gray-100"
        >
          <div className="w-32 h-32 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8 relative">
            <div className="absolute inset-0 bg-blue-50/50 rounded-full animate-pulse" />
            <ShoppingBagIcon className="w-16 h-16 text-gray-300 relative z-10" />
          </div>
          <h2 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">Your cart is empty</h2>
          <p className="text-gray-500 mb-10 text-lg leading-relaxed">
            Looks like you haven't added anything to your cart yet.
            <br className="hidden sm:block" />
            Explore our premium collection and start planning!
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center justify-center gap-3 bg-black text-white px-10 py-5 rounded-2xl font-bold text-lg transition-all hover:scale-105 hover:bg-gray-900 hover:shadow-lg active:scale-95"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            Start Shopping
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] py-12 md:py-20">
      <SEO title="Your Shopping Cart | TodayMyDream" />
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter mb-4">
              Shopping Cart
            </h1>
            <p className="text-gray-500 font-medium text-lg">
              You have <span className="text-black font-bold">{getCartCount()} items</span> in your cart
            </p>
          </div>
          <Link
            to="/shop"
            className="flex items-center gap-2 text-gray-500 font-bold hover:text-black transition-colors bg-white px-6 py-3 rounded-xl border border-gray-200 hover:border-black hover:shadow-sm"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            Continue Shopping
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Items List */}
          <div className="lg:col-span-8 space-y-6">
            <AnimatePresence mode="popLayout">
              {cartItems.map((item, index) => (
                <motion.div
                  key={item._id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="bg-white p-5 md:p-6 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-6 group hover:shadow-md transition-shadow"
                >
                  <div className="w-full sm:w-40 h-40 rounded-2xl overflow-hidden bg-gray-50 flex-shrink-0 relative">
                    <img
                      src={config.fixImageUrl(item.images?.[0] || item.image)}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                    />
                  </div>

                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h3 className="font-bold text-gray-900 text-xl line-clamp-2 mb-2 leading-tight">
                          {item.name}
                        </h3>
                        <p className="text-sm text-gray-500 font-medium bg-gray-50 px-3 py-1 rounded-lg inline-block">
                          {item.category?.name || 'Shop Product'}
                        </p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item._id)}
                        className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 group/delete flex-shrink-0"
                        title="Remove item"
                      >
                        <TrashIcon className="w-5 h-5 group-hover/delete:scale-110 transition-transform" />
                      </button>
                    </div>

                    <div className="flex flex-wrap items-end justify-between gap-4 mt-6">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center bg-gray-50 rounded-xl border border-gray-100 p-1.5 shadow-sm">
                          <button
                            onClick={() => updateQuantity(item._id, item.quantity - 1)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white hover:shadow-sm text-gray-600 transition-all disabled:opacity-30"
                            disabled={item.quantity <= 1}
                          >
                            <MinusIcon className="w-4 h-4" />
                          </button>
                          <span className="w-10 text-center font-bold text-lg text-gray-900 tabular-nums">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item._id, item.quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white hover:shadow-sm text-gray-600 transition-all active:scale-95"
                          >
                            <PlusIcon className="w-4 h-4" />
                          </button>
                        </div>
                        <span className="text-gray-400 text-sm font-medium">
                          x ₹{item.price.toFixed(0)}
                        </span>
                      </div>

                      <div className="text-right">
                        <p className="text-2xl font-black text-gray-900 tracking-tight">
                          ₹{(item.price * item.quantity).toFixed(0)}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Summary Sidebar */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100"
            >
              <h2 className="text-2xl font-black text-gray-900 mb-8 flex items-center justify-between">
                Order Summary
                <ShoppingBagIcon className="w-6 h-6 text-gray-400" />
              </h2>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center text-gray-600">
                  <span className="font-medium">Subtotal</span>
                  <span className="text-gray-900 font-bold text-lg">₹{subtotal.toFixed(0)}</span>
                </div>
                <div className="flex justify-between items-center text-gray-600">
                  <span className="font-medium">Shipping</span>
                  <span className={`font-bold text-lg ${shipping === 0 ? 'text-green-600' : 'text-gray-900'}`}>
                    {shipping === 0 ? 'FREE' : `₹${shipping}`}
                  </span>
                </div>
                {shipping > 0 && (
                  <div className="bg-blue-50 text-blue-700 text-xs font-bold px-4 py-3 rounded-xl flex items-center gap-2">
                    <TruckIcon className="w-4 h-4" />
                    Add items worth ₹{(1000 - subtotal).toFixed(0)} more for free shipping
                  </div>
                )}
              </div>

              <div className="pt-6 border-t border-dashed border-gray-200 mb-8">
                <div className="flex justify-between items-end">
                  <span className="text-gray-500 font-bold mb-1">Total Amount</span>
                  <span className="text-4xl font-black text-gray-900 tracking-tighter">
                    ₹{total.toFixed(0)}
                  </span>
                </div>
                <p className="text-xs text-right text-gray-400 font-medium mt-2">
                  Including all taxes
                </p>
              </div>

              <button
                onClick={() => navigate('/shop/checkout')}
                className="w-full bg-black text-white py-5 rounded-2xl font-black text-lg uppercase tracking-widest shadow-xl shadow-gray-900/10 hover:bg-gray-800 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
              >
                Checkout
                <ArrowLeftIcon className="w-5 h-5 rotate-180 group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>

            {/* Trust Badges */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-1 gap-3"
            >
              <div className="flex items-center gap-4 p-5 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600 flex-shrink-0">
                  <TruckIcon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">Fast Delivery</h4>
                  <p className="text-xs text-gray-500">Within 3-5 business days</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-5 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 flex-shrink-0">
                  <ShieldCheckIcon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">Secure Payment</h4>
                  <p className="text-xs text-gray-500">100% secure transaction</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-5 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
                  <ArrowPathIcon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">Easy Returns</h4>
                  <p className="text-xs text-gray-500">7 Days return policy</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopCart;
