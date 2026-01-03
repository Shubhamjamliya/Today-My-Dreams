import { Link } from 'react-router-dom';
import { useState, useMemo } from 'react';
import config from '../../config/config.js';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, TrendingUp, Heart, Award } from 'lucide-react';

const ProductCard = ({ product }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  if (!product) return null;

  const productId = product._id || product.id;
  if (!productId) return null;

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
    setIsImageLoaded(false); // Reset load state for fade effect on change
  };

  return (
    <Link to={`/product/${productId}`} className="block h-full">
      <div
        className="bg-white rounded-2xl overflow-hidden group border border-slate-100 transition-all duration-300 
                   hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 relative h-full flex flex-col"
      >
        {/* Image Container */}
        <div className="relative w-full aspect-square overflow-hidden bg-slate-50">
          {/* Placeholder / Skeleton */}
          {!isImageLoaded && (
            <div className="absolute inset-0 bg-slate-100 animate-pulse z-0" />
          )}

          <motion.img
            initial={{ opacity: 0 }}
            animate={{ opacity: isImageLoaded ? 1 : 0 }}
            transition={{ duration: 0.5 }}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 relative z-10"
            src={mainImage}
            alt={product.name}
            loading="lazy"
            onLoad={() => setIsImageLoaded(true)}
            onError={(e) => { e.target.src = 'https://placehold.co/500x500/f1f5f9/475569?text=Image'; }}
          />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2 z-20">
            {product.isBestSeller && (
              <span className="flex items-center gap-1 bg-gradient-to-r from-amber-400 to-yellow-500 text-white px-2.5 py-1 rounded-full shadow-sm text-[10px] font-bold uppercase tracking-wide">
                <Award className="w-3 h-3" /> Best Seller
              </span>
            )}
            {product.isTrending && (
              <span className="flex items-center gap-1 bg-rose-500 text-white px-2.5 py-1 rounded-full shadow-sm text-[10px] font-bold uppercase tracking-wide">
                <TrendingUp className="w-3 h-3" /> Trending
              </span>
            )}
          </div>

          {/* Rating Badge */}
          {hasReviews && (
            <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-sm px-2 py-1 rounded-lg shadow-sm z-20 border border-slate-100 flex items-center gap-1">
              <span className="text-sm font-bold text-slate-900">{rating.toFixed(1)}</span>
              <Star className="w-3 h-3 text-yellow-500 fill-current" />
            </div>
          )}

          {/* Image Dots */}
          {imageSources.length > 1 && (
            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-20">
              {imageSources.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => handleDotClick(e, index)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${currentImageIndex === index
                    ? 'w-6 bg-white shadow-sm'
                    : 'w-1.5 bg-white/60 hover:bg-white'
                    }`}
                  aria-label={`View image ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 flex-1 flex flex-col text-left">
          <h3 className="font-bold text-slate-800 text-sm md:text-base leading-tight mb-auto line-clamp-2" title={product.name}>
            {product.name || 'Unnamed Product'}
          </h3>

          <div className="mt-4 flex items-end gap-2">
            <p className="text-lg font-black text-slate-900">
              ₹{currentPrice.toFixed(0)}
            </p>
            {discountPercentage > 0 && regularPrice > 0 && (
              <div className="flex flex-col items-start leading-none mb-0.5">
                <p className="text-xs text-slate-400 line-through decoration-slate-400/50">
                  ₹{regularPrice.toFixed(0)}
                </p>
                <p className="text-[10px] font-bold text-green-600">
                  {discountPercentage}% OFF
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;