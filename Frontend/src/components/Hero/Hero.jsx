import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, Phone, Mail, Star, IndianRupee, ExternalLink, X, Building2, Wifi, Car, Utensils, Music, Camera, Shield, CheckCircle, Calendar, Clock3, Home, FileText, ChefHat, Bed, Settings, ChevronLeft, ChevronRight
} from '../../utils/heroIconImports';

// reference motion to avoid some linters/analysis tools that may false-positive 'unused' for JSX usage
void motion;
import config from '../../config/config';
import { useNavigate } from 'react-router-dom';
import { useCity } from '../../context/CityContext';
import { HeroSkeleton } from '../Loader/Skeleton';

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
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const navigate = useNavigate();
  const { selectedCity } = useCity();

  // Separate states for odd and even carousels (desktop)
  const [[oddPage, oddDirection], setOddPage] = useState([0, 0]);
  const [[evenPage, evenDirection], setEvenPage] = useState([0, 0]);

  // Single state for mobile carousel (all items)
  const [[mobilePage, mobileDirection], setMobilePage] = useState([0, 0]);

  // Split data into odd and even indexed items for desktop
  const oddIndexedData = useMemo(() => {
    return carouselData.filter((_, index) => index % 2 === 0);
  }, [carouselData]);

  const evenIndexedData = useMemo(() => {
    return carouselData.filter((_, index) => index % 2 === 1);
  }, [carouselData]);

  const oddImageIndex = wrap(0, oddIndexedData.length, oddPage);
  const evenImageIndex = wrap(0, evenIndexedData.length, evenPage);
  const mobileImageIndex = wrap(0, carouselData.length, mobilePage);

  // Handle window resize to detect mobile/desktop
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchCarouselData = async () => {
      try {
        const urlParams = new URLSearchParams();
        if (selectedCity) {
          urlParams.append('city', selectedCity);
        }

        const response = await fetch(`${config.API_BASE_URL}/api/hero-carousel/active?${urlParams.toString()}`);
        if (!response.ok) throw new Error('Failed to fetch carousel data');
        const data = await response.json();

        // Adjust filter key depending on backend field name
        const filteredData = data.filter((item) => item.isMobile === false);

        setCarouselData(filteredData);
      } catch (err) {
        // Error fetching carousel data
        setError('Failed to load promotions');
      } finally {
        setLoading(false);
      }
    };

    fetchCarouselData();
  }, [selectedCity]);

  // Auto-pagination for mobile carousel (all items)
  useEffect(() => {
    if (isMobile && carouselData.length > 1) {
      const timer = setInterval(() => {
        setMobilePage(([currentPage]) => [currentPage + 1, 1]);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [isMobile, carouselData]);

  // Auto-pagination for odd carousel (desktop only)
  useEffect(() => {
    if (!isMobile && oddIndexedData.length > 1) {
      const timer = setInterval(() => {
        setOddPage(([currentPage]) => [currentPage + 1, 1]);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [isMobile, oddIndexedData, oddPage]);

  // Auto-pagination for even carousel (desktop only)
  useEffect(() => {
    if (!isMobile && evenIndexedData.length > 1) {
      const timer = setInterval(() => {
        setEvenPage(([currentPage]) => [currentPage + 1, 1]);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [isMobile, evenIndexedData, evenPage]);

  const paginateMobile = (newDirection) => {
    setMobilePage([mobilePage + newDirection, newDirection]);
  };

  const paginateOdd = (newDirection) => {
    setOddPage([oddPage + newDirection, newDirection]);
  };

  const paginateEven = (newDirection) => {
    setEvenPage([evenPage + newDirection, newDirection]);
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
      <div className="w-full h-[200px] md:h-[250px] rounded-2xl shadow-2xl overflow-hidden">
        {loading ? (
          <HeroSkeleton isMobile={isMobile} />
        ) : (
          <div className="flex items-center justify-center h-full bg-gray-100">
            <p className="text-slate-600 text-center p-8">{error || 'No promotions available.'}</p>
          </div>
        )}
      </div>
    );
  }

  const currentOddItem = oddIndexedData[oddImageIndex];
  const currentEvenItem = evenIndexedData[evenImageIndex];
  const currentMobileItem = carouselData[mobileImageIndex];

  // Carousel Component (reusable)
  const CarouselCard = ({ item, page, direction, paginate, imageIndex, dataLength, isOdd, isMobileCarousel }) => (
    <div
      className="relative w-full h-[200px] md:h-[250px] overflow-hidden cursor-pointer 
                 border-2 border-transparent rounded-2xl group hover:border-[#FCD24C] shadow-2xl"
      style={{ perspective: '1000px', transformStyle: 'preserve-3d' }}
      onClick={() => navigate(item?.link || '/services')}
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
          {isVideo(item.image) ? (
            <video
              className="w-full h-full object-cover rounded-2xl"
              autoPlay
              loop
              muted
              playsInline
              fetchpriority="high"
              onError={handleMediaError}
              src={item.image}
            />
          ) : (
            <img
              src={item.image}
              alt={item.title || 'Promotion'}
              className="w-full h-full rounded-2xl object-fill"
              fetchpriority="high"
              onError={handleMediaError}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Left / Right arrow controls */}
      {dataLength > 1 && (
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
            <ChevronLeft />
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
            <ChevronRight />
          </button>
        </>
      )}

      {/* Pagination dots */}
      {dataLength > 1 && (
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-[2]">
          {Array.from({ length: dataLength }).map((_, index) => (
            <div
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                const newDirection = index > imageIndex ? 1 : -1;
                if (isMobileCarousel) {
                  setMobilePage([index, newDirection]);
                } else if (isOdd) {
                  setOddPage([index, newDirection]);
                } else {
                  setEvenPage([index, newDirection]);
                }
              }}
              className={`h-2 rounded-2xl transition-all duration-300 cursor-pointer ${imageIndex === index ? 'w-6 bg-white shadow-md' : 'w-2 bg-white/60'
                }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="w-full mt-4">
      <div className="w-[99%] md:w-[85%] mx-auto">
        {/* Mobile: Show single carousel with all items */}
        {isMobile ? (
          <CarouselCard
            item={currentMobileItem}
            page={mobilePage}
            direction={mobileDirection}
            paginate={paginateMobile}
            imageIndex={mobileImageIndex}
            dataLength={carouselData.length}
            isOdd={false}
            isMobileCarousel={true}
          />
        ) : (
          /* Desktop: Show two carousels side by side */
          <div className="grid grid-cols-2 gap-4">
            {/* First Carousel - Odd indexed items (0, 2, 4...) */}
            {oddIndexedData.length > 0 && (
              <CarouselCard
                item={currentOddItem}
                page={oddPage}
                direction={oddDirection}
                paginate={paginateOdd}
                imageIndex={oddImageIndex}
                dataLength={oddIndexedData.length}
                isOdd={true}
                isMobileCarousel={false}
              />
            )}

            {/* Second Carousel - Even indexed items (1, 3, 5...) */}
            {evenIndexedData.length > 0 && (
              <CarouselCard
                item={currentEvenItem}
                page={evenPage}
                direction={evenDirection}
                paginate={paginateEven}
                imageIndex={evenImageIndex}
                dataLength={evenIndexedData.length}
                isOdd={false}
                isMobileCarousel={false}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Offerpage;