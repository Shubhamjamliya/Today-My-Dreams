import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Premium Brand Loader
const Loader = ({ size = 'medium', text = 'Loading...', fullScreen = false, inline = false, showLogo = true }) => {
  // Size configurations
  const dimensions = {
    tiny: { box: 20, logo: 10, stroke: 2 },
    small: { box: 40, logo: 20, stroke: 3 },
    medium: { box: 60, logo: 30, stroke: 3 },
    large: { box: 80, logo: 40, stroke: 4 },
    xlarge: { box: 100, logo: 50, stroke: 4 }
  };

  const sizeClasses = {
    tiny: 'w-4 h-4',
    small: 'w-8 h-8',
    medium: 'w-12 h-12',
    large: 'w-16 h-16',
    xlarge: 'w-20 h-20'
  };

  const currentDim = dimensions[size] || dimensions.medium;
  const boxSize = currentDim.box;

  // Custom transition ease
  const easeInOutCubic = [0.65, 0, 0.35, 1];

  // Prevent flicker on fast loads
  const [shouldShow, setShouldShow] = useState(!fullScreen);

  useEffect(() => {
    if (fullScreen) {
      setShouldShow(true);
      return;
    }
    const timer = setTimeout(() => setShouldShow(true), 200);
    return () => clearTimeout(timer);
  }, [fullScreen]);

  if (!shouldShow) return null;

  const LoaderContent = () => (
    <div className={`flex ${inline ? 'flex-row items-center gap-3' : 'flex-col items-center justify-center gap-6'} relative`}>

      {/* Central Animation Container */}
      <div className="relative flex items-center justify-center" style={{ width: boxSize, height: boxSize }}>

        {/* 1. Outer Ring - Spinning Gold Gradient */}
        <motion.div
          className="absolute inset-0 rounded-full border-t-transparent border-l-transparent"
          style={{
            borderWidth: currentDim.stroke,
            borderStyle: 'solid',
            borderColor: '#FCD24C', // Primary Brand Color
            borderTopColor: 'transparent',
            borderLeftColor: 'transparent',
            boxShadow: '0 0 15px rgba(252, 210, 76, 0.2)'
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />

        {/* 2. Inner Ring - Spinning Counter-Clockwise (Subtle) */}
        {!inline && (
          <motion.div
            className="absolute inset-0 rounded-full border-t-transparent border-r-transparent"
            style={{
              margin: currentDim.stroke * 2,
              borderWidth: currentDim.stroke,
              borderStyle: 'solid',
              borderColor: 'rgba(252, 210, 76, 0.3)',
              borderTopColor: 'transparent',
              borderRightColor: 'transparent'
            }}
            animate={{ rotate: -360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
        )}

        {/* 3. Central Brand Element (Pulsing Logo or Dot) - Refactored */}
        <div className="relative">
          <motion.div
            animate={{
              scale: [1, 1.05, 1],
              rotate: [0, 0, 0], // Reduced rotation for cleaner look
              filter: ["drop-shadow(0 0 8px rgba(252, 210, 76, 0.3))", "drop-shadow(0 0 12px rgba(252, 210, 76, 0.5))", "drop-shadow(0 0 8px rgba(252, 210, 76, 0.3))"]
            }}
            transition={{
              duration: 2, // Slower breath
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className={`${sizeClasses[size]} relative z-10 bg-white rounded-full flex items-center justify-center shadow-xl border border-slate-100/50`}
          >
            {showLogo ? (
              <img
                src="/TodayMyDream.png"
                alt="Loading"
                className="w-full h-full object-contain p-2" // Added padding
              />
            ) : (
              <div className="w-2 h-2 bg-[#FCD24C] rounded-full" />
            )}
          </motion.div>
        </div>

        {/* 4. Orbiting Particle (Optional Visual Interest) */}
        {!inline && (
          <motion.div
            className="absolute w-full h-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          >
            <div className="w-2 h-2 bg-[#FCD24C] rounded-full absolute -top-1 left-1/2 -ml-1 shadow-[0_0_10px_rgba(252,210,76,0.8)]" />
          </motion.div>
        )}
      </div>

      {/* Text Animation */}
      {text && (
        <div className={`flex flex-col items-center ${inline ? 'items-start' : 'text-center'}`}>
          <motion.h3
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className={`font-bold tracking-wide text-slate-800 ${size === 'tiny' || size === 'small' ? 'text-xs' : 'text-sm'
              }`}
          >
            {text}
          </motion.h3>

          {/* Animated Dots for "Waiting" feeling */}
          {!inline && (
            <div className="flex gap-1 mt-1 justify-center h-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-1 h-1 bg-[#FCD24C] rounded-full"
                  animate={{
                    scale: [0, 1, 0],
                    opacity: [0, 1, 0]
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.2,
                    repeatDelay: 0.5
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-white/90 backdrop-blur-md z-[9999] flex flex-col items-center justify-center"
      >
        <LoaderContent />
      </motion.div>
    );
  }

  return <LoaderContent />;
};

export default Loader;
