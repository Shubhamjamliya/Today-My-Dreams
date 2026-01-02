import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

const OptimizedImage = ({ 
  src, 
  alt, 
  className = '', 
  priority = false,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  quality = 75,
  placeholder = 'blur',
  ...props 
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    if (priority) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [priority]);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setHasError(true);
  };

  // Generate optimized image URL (you can integrate with your image optimization service)
  const getOptimizedSrc = (originalSrc) => {
    if (!originalSrc) return '/placeholder.jpg';
    
    // If using a CDN or image optimization service, add parameters here
    // Example: return `${originalSrc}?w=800&q=${quality}&f=webp`;
    return originalSrc;
  };

  const optimizedSrc = getOptimizedSrc(src);

  return (
    <div ref={imgRef} className={`relative overflow-hidden ${className}`} {...props}>
      {!isInView && !priority && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded" />
      )}
      
      {isInView && (
        <>
          {placeholder === 'blur' && !isLoaded && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse rounded" />
          )}
          
          <motion.img
            src={hasError ? '/placeholder.jpg' : optimizedSrc}
            alt={alt}
            className={`transition-opacity duration-300 ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            } ${className}`}
            onLoad={handleLoad}
            onError={handleError}
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            sizes={sizes}
            initial={{ opacity: 0 }}
            animate={{ opacity: isLoaded ? 1 : 0 }}
            transition={{ duration: 0.3 }}
          />
        </>
      )}
    </div>
  );
};

export default OptimizedImage;
