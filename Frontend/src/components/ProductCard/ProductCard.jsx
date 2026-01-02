import { Link } from 'react-router-dom';
import { useState } from 'react';
import config from '../../config/config.js';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, TrendingUp, Heart, Award } from 'lucide-react';
import { slugify } from '../../utils/slugify';

const ProductCard = ({ product }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!product) return null;

  // Get the correct product ID (handle both _id and id)
  const productId = product._id || product.id;
  
  if (!productId) {
    // Product ID not found
    return null;
  }

  // Use product's built-in review stats if available (from backend aggregation)
  // This avoids making an API call for each product card
  const rating = product.averageRating || 0;
  const numOfReviews = product.reviewCount || 0;
  const hasReviews = numOfReviews > 0;

  // Safely calculate discount percentage
  const regularPrice = typeof product.regularPrice === 'number' ? product.regularPrice : 0;
  const currentPrice = typeof product.price === 'number' ? product.price : 0;
  const discountPercentage = regularPrice > currentPrice && regularPrice > 0
    ? Math.round(((regularPrice - currentPrice) / regularPrice) * 100)
    : 0;

  // Safely handle image sources
  const imageSources = (() => {
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      return product.images.map(img => {
        if (typeof img === 'string') return img;
        if (img && typeof img === 'object' && img.url) return img.url;
        return null;
      }).filter(Boolean);
    }
    if (product.image && typeof product.image === 'string') {
      return [product.image];
    }
    return [];
  })();

  const mainImage = imageSources.length > 0 
    ? config.fixImageUrl(imageSources[currentImageIndex] || imageSources[0])
    : 'https://placehold.co/500x500/f1f5f9/475569?text=No+Image';

  const handleDotClick = (e, index) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex(index);
  };

  const handleCardClick = (e) => {
    // Allow the link to work normally
  };

  return (
    <Link to={`/product/${productId}`} className="block">
      <motion.div
        layout
        transition={{ type: 'spring', stiffness: 200, damping: 25 }}
        // --- Added shine effect and yellow border ---
        className="bg-white rounded-lg overflow-hidden group border border-yellow-400/50 transition-all duration-300 
                   hover:shadow-lg hover:shadow-yellow-300/30 hover:-translate-y-0.5 relative cursor-pointer
                   hover:border-yellow-500/70 hover:scale-[1.01] shiny-effect
                   active:scale-[0.98] active:shadow-md"
        onClick={handleCardClick}
      >
        <div className="relative w-full aspect-square overflow-hidden">
          <AnimatePresence>
            <motion.img
              key={currentImageIndex}
              initial={{ opacity: 0.5 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              src={mainImage}
              alt={product.name}
              loading="lazy"
              onError={(e) => { e.target.src = 'https://placehold.co/500x500/f1f5f9/475569?text=Image'; }}
            />
          </AnimatePresence>

          {/* Attractive Badges at Top Left */}
          <div className="absolute top-2 left-2 flex flex-col gap-1.5 z-20">
            {product.isBestSeller && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="flex items-center gap-1 bg-gradient-to-r from-amber-400 to-yellow-500 text-white px-2.5 py-1 rounded-full shadow-lg text-[10px] font-bold uppercase tracking-wide"
              >
                <Award className="w-3 h-3" />
                <span>Best Seller</span>
              </motion.div>
            )}
            {product.isTrending && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="flex items-center gap-1 bg-red-700 text-white px-2.5 py-1 rounded-full shadow-lg text-[10px] font-bold uppercase tracking-wide animate-pulse"
              >
                <TrendingUp className="w-3 h-3" />
                <span>Trending</span>
              </motion.div>
            )}
            {product.isMostLoved && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="flex items-center gap-1 bg-gradient-to-r from-pink-500 to-rose-500 text-white px-2.5 py-1 rounded-full shadow-lg text-[10px] font-bold uppercase tracking-wide"
              >
                <Heart className="w-3 h-3 fill-current" />
                <span>Most Loved</span>
              </motion.div>
            )}
          </div>

          {/* --- ADDED: Rating display at the bottom-right of the image --- */}
          {hasReviews && (
            <div className="absolute bottom-1.5 right-1.5 bg-white/90 backdrop-blur-sm px-1.5 py-1 rounded-md z-10">
              <div className="flex items-center gap-0.5">
                <span className="text-[10px] font-bold text-slate-800">{rating.toFixed(1)}</span>
                <Star className="w-2 h-2 text-yellow-500 fill-current" />
                <span className="text-[10px] text-slate-600">({numOfReviews})</span>
              </div>
            </div>
          )}

          {/* This part for image slider dots remains the same */}
          {imageSources.length > 1 && (
            <div className="absolute bottom-1.5 left-0 right-0 flex justify-center gap-1 z-10">
              {imageSources.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => handleDotClick(e, index)}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    currentImageIndex === index 
                      ? 'w-4 bg-white shadow-sm' 
                      : 'w-1 bg-white/60'
                  }`}
                  aria-label={`View image ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* --- UPDATED: Content area layout completely changed to match the screenshot --- */}
        <div className="p-2.5">
          {/* Name is now on its own line, with larger font */}
          <h3 className="font-bold text-slate-800 truncate mb-1 text-sm" title={product.name || 'Unnamed Product'}>
            {product.name || 'Unnamed Product'}
          </h3>
          
          

          {/* Price and discount are grouped together on a new line */}
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-extrabold text-slate-900">
              ₹{currentPrice.toFixed(0)}
            </p>
            {discountPercentage > 0 && regularPrice > 0 && (
              <>
                <p className="text-[10px] text-slate-400 line-through">
                  ₹{regularPrice.toFixed(0)}
                </p>
                <p className="text-[10px] font-bold text-green-700 bg-green-100 px-1 py-0.5 rounded">
                  {discountPercentage}% OFF
                </p>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

export default ProductCard;