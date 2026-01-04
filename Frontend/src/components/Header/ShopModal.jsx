import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiX, FiArrowRight } from 'react-icons/fi';
import { FaGem, FaShoePrints, FaShoppingBag, FaTshirt, FaWatchmanMonitoring } from 'react-icons/fa';
import axios from 'axios';
import config from '../../config/config.js';
import Loader from '../Loader';

const ShopModal = ({ isOpen, onClose, selectedCity }) => {
  const [shopCategories, setShopCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchShopCategories();
    }
  }, [isOpen, selectedCity]);

  const fetchShopCategories = async () => {
    setLoading(true);
    try {
      const urlParams = new URLSearchParams();
      if (selectedCity) {
        urlParams.append('city', selectedCity);
      }
      // Use dedicated shop categories endpoint
      const response = await axios.get(`${config.API_URLS.SHOP_CATEGORIES}?${urlParams.toString()}`);
      const categories = response.data.categories || response.data || [];

      // If backend doesn't support filter yet, we might get everything. 
      // In a real scenario, the API would handle this.
      setShopCategories(categories);
    } catch (err) {
      setError('Failed to load shop categories');
      // Fallback for demo/initial setup if API fails
      setShopCategories([
        { _id: '1', name: 'Jewellery', image: '', icon: <FaGem size={24} /> },
        { _id: '2', name: 'Shoes', image: '', icon: <FaShoePrints size={24} /> },
        { _id: '3', name: 'Apparel', image: '', icon: <FaTshirt size={24} /> },
        { _id: '4', name: 'Watches', image: '', icon: <FaWatchmanMonitoring size={24} /> },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (catName) => {
    const name = catName.toLowerCase();
    if (name.includes('jewel')) return <FaGem size={28} />;
    if (name.includes('shoe')) return <FaShoePrints size={28} />;
    if (name.includes('cloth') || name.includes('apparel') || name.includes('wear')) return <FaTshirt size={28} />;
    if (name.includes('watch')) return <FaWatchmanMonitoring size={28} />;
    return <FaShoppingBag size={28} />;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-slate-900/80 z-[100] flex items-center justify-center p-4 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-white rounded-3xl w-full max-w-5xl shadow-2xl overflow-hidden relative border border-white/20"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-8 border-b border-slate-100 flex justify-between items-start bg-gradient-to-r from-amber-500 to-yellow-500 text-white">
              <div>
                <h2 className="font-extrabold text-3xl tracking-tight">TodayMyDream Shop</h2>
                <p className="text-amber-50/90 mt-2 font-medium">Discover premium jewellery, footwear, and more.</p>
              </div>
              <button
                onClick={onClose}
                className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-all group shadow-inner"
              >
                <FiX size={24} className="group-hover:rotate-90 transition-transform duration-300" />
              </button>
            </div>

            {/* Content */}
            <div className="p-8 max-h-[75vh] overflow-y-auto bg-slate-50/50">
              {loading && (
                <div className="py-20 flex flex-col items-center justify-center gap-4">
                  <Loader color="#FCD24C" />
                  <p className="text-slate-400 font-medium">Curating the best for you...</p>
                </div>
              )}

              {error && !shopCategories.length && (
                <div className="py-10 text-center text-slate-500">
                  <p>{error}</p>
                  <button onClick={fetchShopCategories} className="mt-4 text-amber-600 font-bold hover:underline">Try Again</button>
                </div>
              )}

              {!loading && shopCategories.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {shopCategories.map(cat => (
                    <Link
                      key={cat._id}
                      to={`/services?module=shop&category=${encodeURIComponent(cat.name)}`}
                      onClick={onClose}
                      className="group flex flex-col items-center justify-center p-8 rounded-3xl bg-white border border-slate-100 hover:border-amber-400 transition-all duration-300 hover:shadow-2xl hover:shadow-amber-200/40 relative overflow-hidden"
                    >
                      {/* Accent Background */}
                      <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50 rounded-bl-[100px] -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500 opacity-50"></div>

                      <div className="relative z-10 mb-6 w-20 h-20 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 group-hover:bg-amber-500 group-hover:text-white transition-all duration-300 shadow-sm border border-amber-100 group-hover:border-amber-400">
                        {cat.image ? (
                          <img
                            src={config.fixImageUrl(cat.image)}
                            alt={cat.name}
                            className="w-full h-full object-cover rounded-2xl"
                          />
                        ) : (
                          cat.icon || getIcon(cat.name)
                        )}
                      </div>

                      <div className="relative z-10 text-center">
                        <span className="block font-bold text-lg text-slate-800 group-hover:text-amber-700 transition-colors uppercase tracking-wider">{cat.name}</span>
                        <div className="mt-3 flex items-center justify-center gap-1 text-sm font-bold text-amber-500 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                          Browse Products <FiArrowRight />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {!loading && shopCategories.length === 0 && (
                <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-100">
                  <FaShoppingBag size={48} className="mx-auto text-slate-200 mb-4" />
                  <p className="text-slate-400 font-medium">Our shop collection is launching soon!</p>
                </div>
              )}
            </div>

            {/* Footer / CTA */}
            <div className="p-6 bg-slate-900 flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-slate-400 text-sm font-medium italic">Handpicked collections for your most awaited dreams.</p>
              <Link
                to="/services?module=shop"
                onClick={onClose}
                className="flex items-center gap-2 px-8 py-3 bg-white hover:bg-amber-500 hover:text-white text-slate-900 rounded-full font-black text-sm uppercase tracking-widest transition-all duration-300 shadow-lg"
              >
                View All Products <FiArrowRight />
              </Link>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ShopModal;
