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
      <div className="min-h-[85vh] flex flex-col items-center justify-center p-6 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <SEO title="Your Cart | TodayMyDream" />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-lg w-full bg-white/60 backdrop-blur-xl p-12 rounded-[2.5rem] shadow-2xl border border-white/50"
        >
          <div className="w-40 h-40 bg-gradient-to-tr from-amber-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-8 relative shadow-inner">
            <div className="absolute inset-0 bg-white/30 rounded-full animate-pulse blur-md" />
            <ShoppingBagIcon className="w-20 h-20 text-amber-500 relative z-10" />
          </div>
          <h2 className="text-4xl font-black text-slate-800 mb-4 tracking-tight drop-shadow-sm">Your cart is empty</h2>
          <p className="text-slate-500 mb-10 text-lg leading-relaxed font-medium">
            Looks like you haven't added anything yet. <br className="hidden sm:block" />
            Start adding some joy to your life!
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center justify-center gap-3 bg-gradient-to-r from-slate-900 to-slate-800 text-white px-10 py-5 rounded-full font-bold text-lg transition-all hover:scale-105 hover:shadow-xl hover:shadow-slate-900/20 active:scale-95 ring-4 ring-white/50"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            Start Shopping
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F9FA] to-[#E9ECEF] pb-32 md:pb-20 relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-br from-amber-100/40 via-purple-100/30 to-pink-100/40 blur-3xl rounded-b-[4rem] pointer-events-none" />

      <SEO title="Your Shopping Cart | TodayMyDream" />

      {/* Mobile Header */}
      <div className="md:hidden sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-white/20 px-4 py-3 flex items-center justify-between shadow-sm">
        <h1 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
          Cart <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full text-xs font-bold">{getCartCount()}</span>
        </h1>
        <Link to="/shop" className="text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-full flex items-center gap-1 transition-colors">
          <ArrowLeftIcon className="w-3 h-3" /> Convert Shopping
        </Link>
      </div>

      <div className="container mx-auto px-4 max-w-7xl pt-4 md:pt-12 relative z-10">
        {/* Desktop Header */}
        <div className="hidden md:flex flex-col items-start mb-10 gap-6">
          <Link
            to="/shop"
            className="flex items-center gap-2 text-slate-600 font-bold hover:text-amber-600 transition-colors hover:bg-white/50 px-4 py-2 rounded-xl border border-transparent hover:border-amber-200 group -ml-4"
          >
            <ArrowLeftIcon className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            Continue Shopping
          </Link>

          <div className="w-full">
            <span className="text-amber-500 font-bold tracking-widest uppercase text-xs mb-2 block">Your Collection</span>
            <div className="flex justify-between items-end">
              <div>
                <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-2">
                  Shopping Cart
                </h1>
                <p className="text-slate-500 font-medium text-lg">
                  You have <span className="text-slate-900 font-bold bg-white px-2 rounded-md shadow-sm">{getCartCount()} items</span> ready for checkout
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Items List */}
          <div className="lg:col-span-8 space-y-4 md:space-y-6">
            <AnimatePresence mode="popLayout">
              {cartItems.map((item, index) => (
                <motion.div
                  key={item._id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4, delay: index * 0.05, type: 'spring' }}
                  className="bg-white/80 backdrop-blur-md p-4 md:p-6 rounded-3xl border border-white shadow-xl shadow-slate-200/40 hover:shadow-2xl hover:shadow-slate-200/60 hover:-translate-y-1 transition-all duration-300 flex gap-4 md:gap-6 group relative overflow-hidden"
                >
                  <div className="w-24 h-24 md:w-36 md:h-36 rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0 relative shadow-inner group-hover:shadow-md transition-shadow">
                    <img
                      src={config.fixImageUrl(item.images?.[0] || item.image)}
                      alt={item.name}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>

                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div className="flex justify-between items-start gap-2 md:gap-4">
                      <div className="space-y-1.5">
                        <span className="inline-block px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-600 text-[10px] md:text-xs font-bold uppercase tracking-wider">
                          {item.category?.name || 'Item'}
                        </span>
                        <h3 className="font-bold text-slate-800 text-base md:text-xl line-clamp-2 leading-snug">
                          {item.name}
                        </h3>
                        <p className="font-black text-amber-600 md:hidden mt-1 text-lg">
                          ₹{(item.price).toLocaleString()}
                        </p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item._id)}
                        className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all flex-shrink-0 hover:rotate-6"
                        title="Remove Item"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="flex items-end justify-between mt-3 md:mt-4">
                      <div className="flex items-center gap-3 md:gap-4">
                        <div className="flex items-center bg-slate-100 rounded-xl p-1 gap-1 shadow-inner">
                          <button
                            onClick={() => updateQuantity(item._id, item.quantity - 1)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-white shadow-sm hover:shadow text-slate-600 hover:text-slate-900 disabled:opacity-50 disabled:shadow-none transition-all active:scale-90"
                            disabled={item.quantity <= 1}
                          >
                            <MinusIcon className="w-4 h-4" />
                          </button>
                          <span className="w-10 text-center font-bold text-lg text-slate-800 tabular-nums">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item._id, item.quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-white shadow-sm hover:shadow text-slate-600 hover:text-slate-900 transition-all active:scale-90"
                          >
                            <PlusIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="text-right hidden md:block">
                        <p className="text-2xl font-black text-slate-800 tracking-tight">
                          ₹{(item.price * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Desktop Summary Sidebar */}
          <div className="hidden lg:block lg:col-span-4 space-y-6 lg:sticky lg:top-28">
            <SummaryCard subtotal={subtotal} shipping={shipping} total={total} navigate={navigate} />
            <TrustBadges />
          </div>
        </div>
      </div>

      {/* Mobile Sticky Checkout Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-slate-200 p-4 pb-safe lg:hidden z-50 shadow-[0_-5px_25px_rgba(0,0,0,0.08)]">
        <div className="flex flex-col gap-3">
          {shipping > 0 && (
            <div className="text-[10px] text-center text-indigo-600 font-bold bg-indigo-50 py-1.5 rounded-lg border border-indigo-100">
              Add items worth ₹{(1000 - subtotal).toFixed(0)} more for free shipping
            </div>
          )}
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-0.5">Total</p>
              <p className="text-3xl font-black text-slate-900 leading-none">₹{total.toLocaleString()}</p>
            </div>
            <button
              onClick={() => navigate('/shop/checkout')}
              className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-orange-500/30 active:scale-95 transition-all flex items-center justify-center gap-2 hover:from-amber-600 hover:to-orange-600"
            >
              Checkout <ArrowLeftIcon className="w-5 h-5 rotate-180" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const SummaryCard = ({ subtotal, shipping, total, navigate }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white/90 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-2xl shadow-indigo-100/50 border border-white"
  >
    <h2 className="text-2xl font-black text-slate-800 mb-8 flex items-center justify-between">
      Order Summary
      <div className="bg-amber-100 p-2 rounded-full text-amber-600">
        <ShoppingBagIcon className="w-5 h-5" />
      </div>
    </h2>

    <div className="space-y-4 mb-8">
      <div className="flex justify-between items-center text-slate-600">
        <span className="font-medium">Subtotal</span>
        <span className="text-slate-900 font-bold text-lg">₹{subtotal.toLocaleString()}</span>
      </div>
      <div className="flex justify-between items-center text-slate-600">
        <span className="font-medium">Shipping</span>
        <span className={`font-bold text-lg ${shipping === 0 ? 'text-green-600' : 'text-slate-900'}`}>
          {shipping === 0 ? 'FREE' : `₹${shipping}`}
        </span>
      </div>
      {shipping > 0 && (
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-blue-100 text-blue-700 text-xs font-bold px-4 py-3 rounded-xl flex items-center gap-3">
          <TruckIcon className="w-5 h-5 flex-shrink-0" />
          <span>Add items worth <span className="font-black">₹{(1000 - subtotal).toFixed(0)}</span> more for free shipping</span>
        </div>
      )}
    </div>

    <div className="pt-6 border-t border-dashed border-slate-300 mb-8">
      <div className="flex justify-between items-end">
        <span className="text-slate-500 font-bold mb-1">Total Amount</span>
        <span className="text-4xl font-black text-slate-900 tracking-tighter drop-shadow-sm">
          ₹{total.toLocaleString()}
        </span>
      </div>
      <p className="text-xs text-right text-slate-400 font-bold mt-2 uppercase tracking-wide">
        Including all taxes
      </p>
    </div>

    <button
      onClick={() => navigate('/shop/checkout')}
      className="w-full bg-gradient-to-r from-slate-900 to-slate-800 text-white py-5 rounded-2xl font-black text-lg uppercase tracking-widest shadow-xl shadow-slate-900/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group ring-4 ring-slate-100"
    >
      Proceed to Checkout
      <ArrowLeftIcon className="w-5 h-5 rotate-180 group-hover:translate-x-1 transition-transform" />
    </button>
  </motion.div>
);

const TrustBadges = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.1 }}
    className="grid grid-cols-1 gap-3"
  >
    <div className="flex items-center gap-4 p-5 bg-white/80 border border-green-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 flex-shrink-0">
        <TruckIcon className="w-5 h-5" />
      </div>
      <div>
        <h4 className="font-bold text-slate-900 text-sm">Super Fast Delivery</h4>
        <p className="text-xs text-slate-500 font-medium">Within 3-5 business days</p>
      </div>
    </div>

    <div className="flex items-center gap-4 p-5 bg-white/80 border border-purple-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
      <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 flex-shrink-0">
        <ShieldCheckIcon className="w-5 h-5" />
      </div>
      <div>
        <h4 className="font-bold text-slate-900 text-sm">Secure Payment</h4>
        <p className="text-xs text-slate-500 font-medium">100% secure SSL transaction</p>
      </div>
    </div>

    <div className="flex items-center gap-4 p-5 bg-white/80 border border-blue-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
        <ArrowPathIcon className="w-5 h-5" />
      </div>
      <div>
        <h4 className="font-bold text-slate-900 text-sm">Easy Returns</h4>
        <p className="text-xs text-slate-500 font-medium">7 Days hassle-free policy</p>
      </div>
    </div>
  </motion.div>
);

export default ShopCart;

