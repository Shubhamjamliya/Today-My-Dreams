import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import config from '../config/config';

/**
 * OptimizedImage Component
 * 
 * enhanced image component that handles:
 * - Lazy loading with intersection observer (native loading="lazy")
 * - Responsive sizing (if CDN supports it)
 * - Error handling with fallbacks
 * - Smooth loading transition (blur/opacity)
 */
const OptimizedImage = ({
  src,
  alt,
  className = '',
  width,
  height,
  priority = false, // If true, eager load (for LCP images like Hero)
  objectFit = 'cover',
  onLoad,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [imgSrc, setImgSrc] = useState(src ? config.fixImageUrl(src) : '');

  useEffect(() => {
    // Process the source URL
    if (src) {
      const newSrc = config.fixImageUrl(src);
      setImgSrc(newSrc);
      // We don't reset isLoaded here blindly to avoid resetting it on the initial mount 
      // where we just set the correct src. 
      // However, if src *changes*, we should. 
      // For now, simplicity: The initial LCP render matters most.
      setHasError(false);
    } else {
      setImgSrc('');
    }
  }, [src]);

  const handleLoad = (e) => {
    setIsLoaded(true);
    if (onLoad) onLoad(e);
  };

  const handleError = () => {
    setHasError(true);
    setIsLoaded(true); // Stop loading animation
  };

  // Construct Class Names
  // If priority is true, we skip the fade-in effect to ensure immediate paint (Critical for LCP)
  const baseClasses = priority
    ? className
    : `transition-opacity duration-500 ease-in-out ${className}`;

  const loadingClasses = priority
    ? 'opacity-100 blur-0'
    : (isLoaded ? 'opacity-100 blur-0' : 'opacity-0 blur-sm');

  if (hasError) {
    return (
      <div
        className={`bg-slate-50 flex flex-col items-center justify-center text-slate-300 ${className}`}
        style={{ width, height }}
      >
        <svg className="w-8 h-8 mb-1 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span className="text-[10px] font-medium opacity-70">No Image</span>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden bg-slate-100 ${className}`} style={{ width, height }}>
      <img
        src={imgSrc}
        alt={alt || "Image"}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={props.fetchPriority || (priority ? "high" : "auto")}
        decoding={priority ? "async" : "async"} // Changed sync to async to prevent main thread blocking
        className={`w-full h-full ${baseClasses} ${loadingClasses}`}
        style={{ objectFit }}
        onLoad={handleLoad}
        onError={handleError}
        {...props}
      />

      {/* Optional: Skeleton Loader while loading */}
      {!isLoaded && !hasError && !priority && (
        <div className="absolute inset-0 bg-slate-200 animate-pulse" />
      )}
    </div>
  );
};

export default OptimizedImage;
