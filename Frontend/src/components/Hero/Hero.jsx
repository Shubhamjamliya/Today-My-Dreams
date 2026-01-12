import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import config from '../../config/config';
import { useNavigate } from 'react-router-dom';
import { useCity } from '../../context/CityContext';
import { HeroSkeleton } from '../Loader/Skeleton';
import OptimizedImage from '../OptimizedImage';

const Hero = () => {
  const [carouselData, setCarouselData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const navigate = useNavigate();
  const { selectedCity } = useCity();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchCarouselData = async () => {
      try {
        const urlParams = new URLSearchParams();
        if (selectedCity) urlParams.append('city', selectedCity);

        const response = await fetch(`${config.API_BASE_URL}/api/hero-carousel/active?${urlParams.toString()}`);
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();

        // 1. Try to filter for mobile if on mobile device
        const mobileSpecific = data.filter(item => item.isMobile === true);
        const desktopSpecific = data.filter(item => item.isMobile === false);

        let finalData = data;
        if (isMobile) {
          // On mobile: Show mobile images first, then desktop images to ensure we have a carousel
          finalData = [...mobileSpecific, ...desktopSpecific];
          // If we still have nothing (unlikely if data exists), fallback to original data
          if (finalData.length === 0) finalData = data;
        } else {
          // Desktop logic: prefer desktop images, fallback to all
          if (desktopSpecific.length > 0) finalData = desktopSpecific;
        }

        setCarouselData(finalData);
        setCurrentIndex(0);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCarouselData();
  }, [selectedCity, isMobile]);

  useEffect(() => {
    if (carouselData.length > 1) {
      const timer = setInterval(() => {
        navigateSlide('next');
      }, 6000);
      return () => clearInterval(timer);
    }
  }, [carouselData.length, currentIndex]);

  const navigateSlide = (dir) => {
    setDirection(dir === 'next' ? 1 : -1);
    setCurrentIndex(prev => {
      if (dir === 'next') return (prev + 1) % carouselData.length;
      return (prev - 1 + carouselData.length) % carouselData.length;
    });
  };

  const isVideo = (url) => url?.match(/\.(mp4|webm)$/i);

  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0,
      scale: 1.1,
      zIndex: 1
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.5 },
        scale: { duration: 0.8, ease: "easeOut" }
      }
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0,
      scale: 1.1,
      transition: {
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.5 }
      }
    })
  };

  const textVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (custom) => ({
      opacity: 1,
      y: 0,
      transition: { delay: 0.4 + (custom * 0.1), duration: 0.6, ease: "easeOut" }
    })
  };

  // Swipe logic
  const swipeConfidenceThreshold = 300;
  const swipePower = (offset, velocity) => {
    return Math.abs(offset) * velocity;
  };

  if (loading) return <HeroSkeleton />;
  if (carouselData.length === 0) return null;

  const currentItem = carouselData[currentIndex];

  return (
    <div className="relative w-full h-[200px] md:h-[85vh] bg-slate-900 overflow-hidden group">
      {/* SEO: Primary Heading for Brand Ranking */}
      <h1 className="sr-only">Today My Dream - Event Decoration Services | Birthdays, Weddings, Haldi & More</h1>

      <AnimatePresence initial={false} custom={direction} mode="popLayout">
        <motion.div
          key={currentIndex}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={1}
          dragMomentum={false}
          onDragEnd={(e, { offset, velocity }) => {
            const swipe = swipePower(offset.x, velocity.x);
            if (swipe < -swipeConfidenceThreshold || offset.x < -50) {
              navigateSlide('next');
            } else if (swipe > swipeConfidenceThreshold || offset.x > 50) {
              navigateSlide('prev');
            }
          }}
          className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing touch-pan-y"
          onClick={() => currentItem.link && navigate(currentItem.link)}
        >
          {isVideo(currentItem.image) ? (
            <video
              src={currentItem.image}
              autoPlay muted loop playsInline
              className={`w-full h-full ${isMobile ? 'object-contain' : 'object-cover'}`}
            />
          ) : (
            <OptimizedImage
              src={currentItem.image}
              alt={currentItem.title || "Banner"}
              className={`w-full h-full ${isMobile ? 'object-contain' : 'object-cover'}`}
              objectFit={isMobile ? 'contain' : 'cover'}
              priority={true}
              fetchPriority="high" // Critical for LCP
              loading="eager" // Ensure eager loading
            />
          )}

          {/* Gradient Overlay - Desktop Only or Minimal on Mobile */}
          <div className={`absolute inset-0 opacity-90 ${isMobile
            ? 'bg-gradient-to-t from-black/80 via-transparent to-transparent'
            : 'bg-gradient-to-r from-black/80 via-transparent to-transparent'
            }`}></div>

          {/* Content Overlay */}
          {/* Content Overlay - HIDDEN AS PER REQUEST */}
          {/* {(currentItem.title || currentItem.description) && (
            <div className={`absolute inset-0 flex px-6 md:px-24 ${isMobile ? 'items-end pb-8' : 'items-center'
              }`}>
              <div className={`max-w-4xl w-full ${isMobile ? 'text-center' : 'text-left'}`}>
                <motion.h2
                  custom={0}
                  variants={textVariants}
                  initial="hidden"
                  animate="visible"
                  className={`font-bold text-white mb-2 font-serif leading-tight drop-shadow-2xl ${isMobile ? 'text-xl line-clamp-1' : 'text-7xl lg:text-8xl'
                    }`}
                >
                  {currentItem.title}
                </motion.h2>
                <motion.p
                  custom={1}
                  variants={textVariants}
                  initial="hidden"
                  animate="visible"
                  className={`text-white/90 font-light tracking-wide mb-4 drop-shadow-lg ${isMobile ? 'text-xs line-clamp-2 px-2' : 'text-2xl max-w-2xl'
                    }`}
                >
                  {currentItem.description}
                </motion.p>
              </div>
            </div>
          )} */}
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows - Desktop Only */}
      {!isMobile && carouselData.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); navigateSlide('prev'); }}
            className="absolute left-6 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/10 hover:bg-amber-500 text-white hover:text-slate-900 border border-white/20 rounded-full flex items-center justify-center backdrop-blur-md transition-all z-20 opacity-0 group-hover:opacity-100 duration-300"
          >
            <ChevronLeft size={28} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); navigateSlide('next'); }}
            className="absolute right-6 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/10 hover:bg-amber-500 text-white hover:text-slate-900 border border-white/20 rounded-full flex items-center justify-center backdrop-blur-md transition-all z-20 opacity-0 group-hover:opacity-100 duration-300"
          >
            <ChevronRight size={28} />
          </button>
        </>
      )}

      {/* Indicators */}
      {carouselData.length > 1 && (
        <div className={`absolute z-20 flex gap-2 ${isMobile
          ? 'bottom-8 left-1/2 -translate-x-1/2'
          : 'bottom-10 left-12'
          }`}>
          {carouselData.map((_, idx) => (
            <button
              key={idx}
              onClick={(e) => { e.stopPropagation(); setCurrentIndex(idx); }}
              className={`h-1.5 transition-all duration-300 rounded-full ${idx === currentIndex
                ? 'w-12 bg-amber-500'
                : 'w-2 bg-white/40 hover:bg-white'
                }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Hero;