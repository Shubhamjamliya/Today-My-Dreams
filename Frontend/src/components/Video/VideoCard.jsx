import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, X, Star, Award, MessageCircle, Lightbulb } from 'lucide-react';

const VideoCard = ({ video, className = '', showModal = false, onClose, onClick }) => {
  const videoRef = useRef(null);

  // This effect now exclusively handles play/pause logic when the modal state changes.
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;

    if (showModal) {
      // When the modal opens, try to play the video if it's not already playing.
      // The `muted` prop will be false, allowing sound.
      // On many mobile browsers, this will still require user interaction if not muted.
      // The `controls` prop allows the user to play manually.
      if (vid.paused) {
        const playPromise = vid.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.warn("Autoplay with sound was blocked:", error);
          });
        }
      }
    } else {
      // When the modal closes, pause the video and reset its time.
      vid.pause();
      vid.currentTime = 0;
    }
  }, [showModal]); // Only re-run when showModal changes

  if (!video) return null;

  // --- Premium Category Configuration ---
  // Switched to a more elegant emerald/green gradient
  const premiumGradient = 'from-emerald-500 to-green-600';
  const premiumBg = 'bg-gradient-to-r from-emerald-500 to-green-600';

  const categoryConfig = {
    review: { 
      label: 'Customer Review', 
      icon: <Star className="w-3 h-3" />, 
      gradient: premiumGradient,
      bgColor: premiumBg
    },
    work: { 
      label: 'Our Work', 
      icon: <Award className="w-3 h-3" />, 
      gradient: premiumGradient,
      bgColor: premiumBg
    },
    testimonial: { 
      label: 'Testimonial', 
      icon: <MessageCircle className="w-3 h-3" />, 
      gradient: premiumGradient,
      bgColor: premiumBg
    },
    demo: { 
      label: 'Demo/How-to', 
      icon: <Lightbulb className="w-3 h-3" />, 
      gradient: premiumGradient,
      bgColor: premiumBg
    }
  };

  const currentCategory = categoryConfig[video.category] || categoryConfig.demo;

  // Disable hover animations when in modal mode
  const whileHoverProps = showModal 
    ? {} 
    : { y: -8, scale: 1.02 };

  // Use a 16:9 aspect ratio for the modal, but 1:1 for the card
  const videoAspectRatio = showModal ? 'aspect-video' : 'aspect-square';

  return (
    <motion.div
      layout // Add layout prop for smooth transition if size changes
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={whileHoverProps}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      // Disable click-to-open when already in modal mode
      onClick={showModal ? undefined : onClick}
      // The className from props is applied here, allowing modal sizing from parent
      className={`relative group ${className}`}
    >
      {/* Card/Modal Container */}
      <div className="relative bg-white rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl cursor-pointer border border-gray-100 transition-all duration-300 w-full">
        
        {/* Video Container: Aspect ratio is now responsive */}
        <div className={`relative ${videoAspectRatio} bg-gray-900 overflow-hidden`}>
          {/* Video Element */}
          {video.video ? (
            <video
              ref={videoRef}
              src={video.video}
              className="w-full h-full object-cover transition-transform duration-500"
              poster={video.thumbnail || ''}
              playsInline // Essential for iOS
              autoPlay={!showModal} // Autoplay the muted preview
              controls={showModal} // Only show controls in modal
              preload="metadata"
              muted={!showModal} // Muted as card, unmuted as modal
              loop={!showModal} // Loop the muted preview
            />
          ) : (
            // Fallback for missing video
            <div className="flex items-center justify-center h-full text-gray-500">
              <Play size={40} />
            </div>
          )}

          {/* --- Overlays (Only for Card view) --- */}
          {!showModal && (
            <>
              {/* Play Icon Overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  whileHover={{ scale: 1.1 }}
                  className="w-14 h-14 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300"
                >
                  <Play size={20} className="text-gray-900 ml-1" fill="currentColor" />
                </motion.div>
              </div>

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-100 group-hover:opacity-100 transition-opacity duration-300"></div>
            </>
          )}

          {/* Category Badge (Overlay) */}
          <motion.span 
            layout // Allow badge to animate
            className={`absolute top-3 left-3 z-10 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-white shadow-lg ${currentCategory.bgColor}`}
          >
            {currentCategory.icon}
            <span>{currentCategory.label}</span>
          </motion.span>
        </div>

        {/* Card Content (Title) */}
        <div className="p-4">
          <h3 
            // Title is larger in the modal
            className={`text-gray-900 font-semibold ${showModal ? 'text-lg' : 'text-base'} line-clamp-2 leading-tight`}
          >
            {video.title || 'Our Latest Work'}
          </h3>
          {/* You could add more info here for the modal view, e.g., video.description */}
          {showModal && video.description && (
            <p className="text-sm text-gray-600 mt-2 line-clamp-3">
              {video.description}
            </p>
          )}
        </div>

        {/* Hover Glow Effect */}
        <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${currentCategory.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none`}></div>
      </div>

      {/* Modal Close Button (Premium Dark Style) */}
      {showModal && onClose && (
        <motion.button
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
          onClick={onClose}
          className="absolute -top-3 -right-3 w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-black transition-all duration-300 z-50"
          aria-label="Close video"
        >
          <X size={16} />
        </motion.button>
      )}
    </motion.div>
  );
};

export default VideoCard;