import { Link } from 'react-router-dom';
import { useState, useMemo } from 'react';
import config from '../../config/config.js';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, TrendingUp, Heart, Award, ShoppingCart, Eye, Sparkles, Zap, Package } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { toast } from 'react-hot-toast';
import OptimizedImage from '../OptimizedImage';

const ShopProductCard = ({ product }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const { addToCart } = useCart();
  const [adding, setAdding] = useState(false);

  if (!product) return null;

  const productId = product._id || product.id;
  if (!productId) return null;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setAdding(true);
    addToCart(product, 1);
    setTimeout(() => {
      setAdding(false);
      toast.success('Added to cart!');
    }, 500);
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
    toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist!');
  };

  const { regularPrice, currentPrice, discountPercentage, rating } = useMemo(() => {
    const reg = typeof product.regularPrice === 'number' ? product.regularPrice : 0;
    const curr = typeof product.price === 'number' ? product.price : 0;
    const disc = reg > curr && reg > 0 ? Math.round(((reg - curr) / reg) * 100) : 0;
    const rate = product.averageRating || 0;
    return { regularPrice: reg, currentPrice: curr, discountPercentage: disc, rating: rate };
  }, [product.regularPrice, product.price, product.averageRating]);

  const numOfReviews = product.reviewCount || 0;
  const hasReviews = numOfReviews > 0;

  const imageSources = useMemo(() => {
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
  }, [product.images, product.image]);

  const mainImage = useMemo(() =>
    imageSources.length > 0
      ? config.fixImageUrl(imageSources[currentImageIndex] || imageSources[0])
      : 'https://placehold.co/500x500/f1f5f9/475569?text=No+Image',
    [imageSources, currentImageIndex]);

  const handleDotClick = (e, index) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex(index);
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<Star key={i} className="w-3 h-3 text-amber-400 fill-amber-400" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <div key={i} className="relative w-3 h-3">
            <Star className="absolute w-3 h-3 text-slate-200 fill-slate-200" />
            <div className="absolute overflow-hidden w-1/2">
              <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
            </div>
          </div>
        );
      } else {
        stars.push(<Star key={i} className="w-3 h-3 text-slate-200 fill-slate-200" />);
      }
    }
    return stars;
  };

  return (
    <Link
      to={`/product/${productId}?module=shop`}
      className="block h-full group/card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -8 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="relative bg-white rounded-3xl overflow-hidden h-full flex flex-col
                   border border-slate-100/80 
                   shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]
                   hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)]
                   hover:border-slate-200/80
                   transition-all duration-500 ease-out"
      >
        {/* Image Container */}
        <div className="relative w-full aspect-[4/5] overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100">
          {/* Main Image */}
          <OptimizedImage
            key={mainImage} // Force re-render on image change
            src={mainImage}
            alt={product.name}
            className="w-full h-full transform group-hover:scale-105 transition-transform duration-700 relative z-10"
            objectFit="cover"
          />

          {/* Gradient Overlay on Hover */}
          <div className={`absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent z-15 transition-opacity duration-500 ${isHovered ? 'opacity-100' : 'opacity-0'}`} />

          {/* Top Badges Row */}
          <div className="absolute top-3 left-3 right-3 flex justify-between items-start z-20">
            {/* Left Badges */}
            <div className="flex flex-col gap-1.5">
              {discountPercentage > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="inline-flex items-center gap-1 bg-gradient-to-r from-rose-500 to-pink-500 text-white 
                             px-2.5 py-1 rounded-full shadow-lg shadow-rose-500/30
                             text-[10px] font-bold uppercase tracking-wider"
                >
                  <Zap className="w-2.5 h-2.5 fill-current" />
                  {discountPercentage}% OFF
                </motion.span>
              )}
              {product.isBestSeller && (
                <span className="inline-flex items-center gap-1 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 
                             text-slate-900 px-2.5 py-1 rounded-full shadow-lg shadow-amber-400/30
                             text-[10px] font-bold uppercase tracking-wider">
                  <Award className="w-2.5 h-2.5" />
                  Bestseller
                </span>
              )}
              {product.isTrending && (
                <span className="inline-flex items-center gap-1 bg-gradient-to-r from-violet-500 to-purple-500 
                             text-white px-2.5 py-1 rounded-full shadow-lg shadow-violet-500/30
                             text-[10px] font-bold uppercase tracking-wider">
                  <TrendingUp className="w-2.5 h-2.5" />
                  Trending
                </span>
              )}
            </div>

            {/* Wishlist Button */}
            <motion.button
              onClick={handleWishlist}
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              className={`p-2.5 rounded-full backdrop-blur-md transition-all duration-300 shadow-lg
                         ${isWishlisted
                  ? 'bg-rose-500 text-white shadow-rose-500/30'
                  : 'bg-white/90 text-slate-400 hover:text-rose-500 hover:bg-white shadow-black/5'
                }`}
              aria-label="Add to wishlist"
            >
              <Heart className={`w-4 h-4 transition-all duration-300 ${isWishlisted ? 'fill-current scale-110' : ''}`} />
            </motion.button>
          </div>

          {/* Quick View on Hover */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3 }}
                className="absolute bottom-16 left-1/2 -translate-x-1/2 z-20"
              >
                <div className="flex items-center gap-2 bg-white/95 backdrop-blur-md px-4 py-2 rounded-full 
                             shadow-xl shadow-black/10 border border-white/50">
                  <Eye className="w-4 h-4 text-slate-600" />
                  <span className="text-xs font-bold text-slate-700">Quick View</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Image Carousel Dots */}
          {imageSources.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
              {imageSources.map((_, index) => (
                <motion.button
                  key={index}
                  onClick={(e) => handleDotClick(e, index)}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  className={`h-2 rounded-full transition-all duration-300 backdrop-blur-sm
                             ${currentImageIndex === index
                      ? 'w-6 bg-white shadow-lg shadow-black/20'
                      : 'w-2 bg-white/50 hover:bg-white/80'
                    }`}
                  aria-label={`View image ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="p-4 flex-1 flex flex-col bg-gradient-to-b from-white to-slate-50/50">
          {/* Category Tag */}
          {product.category?.name && (
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
              {product.category.name}
            </span>
          )}

          {/* Product Name */}
          <h3 className="font-bold text-slate-800 text-sm md:text-[15px] leading-snug mb-2 line-clamp-2 
                         group-hover/card:text-slate-900 transition-colors capitalize"
            title={product.name}>
            {product.name || 'Unnamed Product'}
          </h3>

          {/* Rating Section */}
          {hasReviews && (
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center gap-0.5">
                {renderStars(rating)}
              </div>
              <span className="text-xs font-semibold text-slate-500">
                {rating.toFixed(1)}
              </span>
              <span className="text-[10px] text-slate-400">
                ({numOfReviews})
              </span>
            </div>
          )}

          {/* Spacer */}
          <div className="flex-1" />

          {/* Price & Action Section */}
          <div className="flex items-end justify-between gap-3 pt-3 border-t border-slate-100/80">
            <div className="flex flex-col">
              {discountPercentage > 0 && regularPrice > 0 && (
                <span className="text-xs text-slate-400 line-through font-medium">
                  ₹{regularPrice.toLocaleString('en-IN')}
                </span>
              )}
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
                  ₹{currentPrice.toLocaleString('en-IN')}
                </span>
                {discountPercentage > 0 && (
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                    SAVE ₹{(regularPrice - currentPrice).toLocaleString('en-IN')}
                  </span>
                )}
              </div>
            </div>

            {/* Add to Cart Button */}
            <motion.button
              onClick={handleAddToCart}
              disabled={adding}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative p-3 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl 
                         shadow-lg shadow-slate-900/20 hover:shadow-xl hover:shadow-slate-900/30
                         transition-all duration-300 overflow-hidden group/btn"
              aria-label="Add to cart"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent 
                             -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
              {adding ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <ShoppingCart className="w-5 h-5 relative z-10" />
              )}
            </motion.button>
          </div>

          {/* Free Delivery */}
          <div className="flex items-center gap-1.5 mt-3 pt-2">
            <Package className="w-3 h-3 text-emerald-500" />
            <span className="text-[10px] font-medium text-slate-500">
              Free delivery available
            </span>
          </div>
        </div>

        {/* Hover Border Glow */}
        <div className={`absolute inset-0 rounded-3xl pointer-events-none transition-opacity duration-500
                        border-2 border-[#FCD24C]/0 group-hover/card:border-[#FCD24C]/30
                        ${isHovered ? 'opacity-100' : 'opacity-0'}`} />
      </motion.div>
    </Link>
  );
};

export default ShopProductCard;
