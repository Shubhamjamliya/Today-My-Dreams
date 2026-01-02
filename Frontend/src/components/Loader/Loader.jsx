import React from 'react';
import { motion } from 'framer-motion';

const Loader = ({ size = 'medium', text = 'Loading...', fullScreen = false }) => {
  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-12 h-12',
    large: 'w-16 h-16',
    xlarge: 'w-20 h-20'
  };

  const textSizes = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg',
    xlarge: 'text-xl'
  };

  const LoaderContent = () => (
    <div className="flex flex-col items-center justify-center mt-12 space-y-3">
      {/* Circular rotating ring */}
      <motion.div
        className={`${sizeClasses[size]} border-4 border-amber-400 border-t-transparent rounded-full`}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />

      {/* Loading text */}
      {text && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`text-gray-700 font-medium ${textSizes[size]} text-center`}
        >
          {text}
        </motion.div>
      )}

      {/* Bouncing dots under text */}
      <motion.div className="flex space-x-1 mt-1">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 bg-amber-400 rounded-full"
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </motion.div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center">
        <LoaderContent />
      </div>
    );
  }

  return <LoaderContent />;
};

export default Loader;
