import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Phone, Mail, Star, IndianRupee, ExternalLink, X, Building2, Wifi, Car, Utensils, Music, Camera, Shield, CheckCircle, Calendar, Clock3, Home, FileText, ChefHat, Bed, Settings, ChevronLeft, ChevronRight } from 'lucide-react';

// reference motion to avoid some linters/analysis tools that may false-positive 'unused' for JSX usage
void motion;
import config from '../../config/config';
import { useNavigate } from 'react-router-dom';

const isVideo = (url) =>
  url && (url.toLowerCase().endsWith('.mp4') || url.toLowerCase().endsWith('.webm'));

const wrap = (min, max, value) => {
  const rangeSize = max - min;
  return ((((value - min) % rangeSize) + rangeSize) % rangeSize) + min;
};

const variants = {
  enter: (direction) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0,
    scale: 0.8,
  }),
  center: { zIndex: 1, x: 0, opacity: 1, scale: 1 },
  exit: (direction) => ({
    zIndex: 0,
    x: direction < 0 ? '100%' : '-100%',
    opacity: 0,
    scale: 0.8,
  }),
};

const swipeConfidenceThreshold = 10000;

const Offerpage = () => {
  const [carouselData, setCarouselData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [[page, direction], setPage] = useState([0, 0]);
  const imageIndex = wrap(0, carouselData.length, page);

  useEffect(() => {
    const fetchCarouselData = async () => {
      try {
        const response = await fetch(`${config.API_BASE_URL}/api/hero-carousel/active`);
        if (!response.ok) throw new Error('Failed to fetch carousel data');
        const data = await response.json();
      
        // Adjust filter key depending on backend field name
        const filteredData = data.filter((item) => item.isMobile === true);

        setCarouselData(filteredData);
      } catch (err) {
        // Error fetching carousel data
        setError('Failed to load promotions');
      } finally {
        setLoading(false);
      }
    };

    fetchCarouselData();
  }, []);

  useEffect(() => {
    if (carouselData.length > 1) {
      const timer = setInterval(() => {
        setPage(([currentPage]) => [currentPage + 1, 1]);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [carouselData]);

  const paginate = (newDirection) => {
    setPage([page + newDirection, newDirection]);
  };

  const handleMediaError = (e) => {
    // Media loading error
    e.target.style.display = 'none';
    const parent = e.target.parentNode;
    if (parent && !parent.querySelector('.media-error-fallback')) {
      const fallback = document.createElement('div');
      fallback.className =
        'media-error-fallback absolute inset-0 flex items-center justify-center text-red-500 text-lg bg-slate-100';
      fallback.textContent = 'Media currently unavailable';
      parent.appendChild(fallback);
    }
  };

  if (loading || error || carouselData.length === 0) {
    return (
      <div className="w-full mt-5 mh-5 h-[200px] md:h-[300px] rounded-2xl shadow-2xl flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        {loading ? (
          <div className="w-10 h-10 border-4 border-amber-100 border-t-amber-500 rounded-2xl animate-spin" />
        ) : (
          <p className="text-slate-600 text-center p-8">{error || 'No promotions available.'}</p>
        )}
      </div>
    );
  }

  const currentItem = carouselData[imageIndex];

  return (
    <div className="w-full mt-4 mb-5">
      {/* ✅ Header text */}
       <h2 className="text-2xl md:text-2xl font-serif font-bold text-slate-900 leading-tight flex items-center justify-center text-center mb-5">
                 Our 
                  <span className="mx-3 text-amber-600">
                    Professional
                  </span>
                  works               </h2>

      {/* ✅ Card wrapper with hover border */}
      <div
        className="relative w-[99%] md:w-[85%] mx-auto h-[200px] md:h-[450px] overflow-hidden items-center m-auto cursor-pointer 
                   border-2 border-transparent rounded-2xl group hover:border-[#FCD24C] shadow-2xl"
        style={{ perspective: '1000px', transformStyle: 'preserve-3d' }}
        onClick={() => navigate(currentItem?.link || '/shop')}
      >
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={page}
            className="absolute inset-0 w-full h-full"
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: 'spring', stiffness: 300, damping: 30 },
              opacity: { duration: 0.3 },
              scale: { duration: 0.4 },
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={1}
            onDragEnd={(e, { offset, velocity }) => {
              const swipe = Math.abs(offset.x) * velocity.x;
              if (swipe < -swipeConfidenceThreshold) {
                paginate(1);
              } else if (swipe > swipeConfidenceThreshold) {
                paginate(-1);
              }
            }}
          >
            {isVideo(currentItem.image) ? (
              <video
                className="w-full h-full object-cover rounded-2xl" // Changed from object-fill
                autoPlay
                loop
                muted
                playsInline
                onError={handleMediaError}
                src={currentItem.image}
              />
            ) : (
              <img
                src={currentItem.image}
                alt={currentItem.title || 'Promotion'}
                className="w-full h-full rounded-2xl object-fill" // Changed from object-fill
                onError={handleMediaError}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Left / Right arrow controls */}
        {carouselData.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous slide"
              onClick={(e) => {
                e.stopPropagation();
                paginate(-1);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  e.stopPropagation();
                  paginate(-1);
                }
              }}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-[3] w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/80 hover:bg-white shadow-md flex items-center justify-center"
            >
             <ChevronLeft/>
            </button>

            <button
              type="button"
              aria-label="Next slide"
              onClick={(e) => {
                e.stopPropagation();
                paginate(1);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  e.stopPropagation();
                  paginate(1);
                }
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-[3] w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/80 hover:bg-white shadow-md flex items-center justify-center"
            >
             <ChevronRight/>
            </button>

            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-[2]">
              {carouselData.map((_, index) => (
                <div
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    const newDirection = index > imageIndex ? 1 : -1;
                    setPage([index, newDirection]);
                  }}
                  className={`h-2 rounded-2xl transition-all duration-300 cursor-pointer ${
                    imageIndex === index ? 'w-6 bg-white shadow-md' : 'w-2 bg-white/60'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Offerpage;