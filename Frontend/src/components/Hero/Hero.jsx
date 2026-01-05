import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import config from '../../config/config';
import { useNavigate } from 'react-router-dom';
import { useCity } from '../../context/CityContext';
import { HeroSkeleton } from '../Loader/Skeleton';

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

        const filtered = data.filter(item => item.isMobile === isMobile);
        setCarouselData(filtered.length > 0 ? filtered : data);
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

  if (loading) return <HeroSkeleton />;
  if (carouselData.length === 0) return null;

  const currentItem = carouselData[currentIndex];

  return (
    <div className="relative w-full h-[50vh] md:h-[80vh] bg-slate-900 overflow-hidden group">
      <AnimatePresence initial={false} custom={direction} mode="popLayout">
        <motion.div
          key={currentIndex}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          className="absolute inset-0 w-full h-full cursor-pointer"
          onClick={() => currentItem.link && navigate(currentItem.link)}
        >
          {isVideo(currentItem.image) ? (
            <video
              src={currentItem.image}
              autoPlay muted loop playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <img
              src={currentItem.image}
              alt={currentItem.title || "Banner"}
              className="w-full h-full object-cover brightness-[0.85]"
            />
          )}

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent opacity-80"></div>

          {/* Content Overlay */}
          {(currentItem.title || currentItem.description) && (
            <div className="absolute inset-0 flex items-center px-8 md:px-24">
              <div className="max-w-4xl pt-16 md:pt-0">
                <motion.h2
                  custom={0}
                  variants={textVariants}
                  initial="hidden"
                  animate="visible"
                  className="text-4xl md:text-7xl lg:text-8xl font-bold text-white mb-6 font-serif leading-tight drop-shadow-2xl"
                >
                  {currentItem.title}
                </motion.h2>
                <motion.p
                  custom={1}
                  variants={textVariants}
                  initial="hidden"
                  animate="visible"
                  className="text-white/90 text-lg md:text-2xl font-light tracking-wide mb-8 max-w-2xl drop-shadow-lg"
                >
                  {currentItem.description}
                </motion.p>

                {currentItem.link && (
                  <motion.button
                    custom={2}
                    variants={textVariants}
                    initial="hidden"
                    animate="visible"
                    className="px-10 py-4 bg-amber-500 text-slate-900 font-bold text-lg rounded-full hover:bg-white hover:text-slate-900 transition-all shadow-xl hover:shadow-amber-500/50 hover:scale-105 transform duration-300"
                  >
                    Explore Now
                  </motion.button>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows */}
      {carouselData.length > 1 && (
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
        <div className="absolute bottom-10 left-12 flex gap-3 z-20">
          {carouselData.map((_, idx) => (
            <button
              key={idx}
              onClick={(e) => { e.stopPropagation(); setCurrentIndex(idx); }}
              className={`h-1.5 transition-all duration-300 rounded-full ${idx === currentIndex ? 'w-16 bg-amber-500' : 'w-8 bg-white/40 hover:bg-white'}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Hero;