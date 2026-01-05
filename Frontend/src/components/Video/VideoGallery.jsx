import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, ChevronLeft, ChevronRight, X, Star, Award, MessageCircle, Lightbulb } from 'lucide-react';
import VideoCard from './VideoCard';
import config from '../../config/config';
import { VideoSkeleton } from '../Loader/Skeleton';
import OptimizedImage from '../OptimizedImage';

// Helper to safely get thumbnail
const getThumbnail = (video) => {
  return video.thumbnail || video.image || "https://placehold.co/600x400/1e293b/475569?text=No+Thumbnail";
};

const VideoGallery = ({
  title = "Our Gallery",
  subtitle = "Moments captured in time",
  className = ""
}) => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      // Fetch all videos, no category filter
      params.append('limit', '20');

      const response = await fetch(`${config.API_URLS.VIDEOS}?${params} `);
      if (response.ok) {
        const data = await response.json();
        setVideos(data.videos || []);
      }
    } catch (error) {
      console.error('Error fetching videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const scrollAmount = direction === 'left' ? -340 : 340;
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleVideoSelect = (video, index) => {
    setSelectedVideo(video);
    setCurrentIndex(index);
  };

  const handleCloseModal = () => setSelectedVideo(null);

  const nextVideo = () => {
    const nextIndex = (currentIndex + 1) % videos.length;
    setSelectedVideo(videos[nextIndex]);
    setCurrentIndex(nextIndex);
  };

  const prevVideo = () => {
    const prevIndex = (currentIndex - 1 + videos.length) % videos.length;
    setSelectedVideo(videos[prevIndex]);
    setCurrentIndex(prevIndex);
  };



  return (
    <section className={`py-8 bg-slate-900 relative overflow-hidden ${className} `}>
      {/* Cinematic Background Elements ... */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px]"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10">

        {/* Header - Simple & Clean */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="text-left"
          >
            <span className="text-amber-500 font-bold tracking-widest uppercase text-xs mb-1 block">Watch & Explore</span>
            <h2 className="text-2xl md:text-3xl font-bold text-white font-serif">{title}</h2>
          </motion.div>
          {/* Tabs removed as per request */}
        </div>

        {/* Carousel Container */}
        <div className="relative group/carousel">
          {/* Nav Buttons - Always Visible & Styled */}
          <button
            onClick={() => scroll('left')}
            className="hidden md:flex absolute -left-4 md:-left-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 md:w-14 md:h-14 bg-white text-slate-900 rounded-full shadow-[0_0_20px_rgba(0,0,0,0.5)] flex items-center justify-center hover:scale-110 hover:bg-amber-500 transition-all duration-300 border-4 border-slate-900"
            aria-label="Scroll left"
          >
            <ChevronLeft size={28} />
          </button>

          <button
            onClick={() => scroll('right')}
            className="hidden md:flex absolute -right-4 md:-right-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 md:w-14 md:h-14 bg-white text-slate-900 rounded-full shadow-[0_0_20px_rgba(0,0,0,0.5)] flex items-center justify-center hover:scale-110 hover:bg-amber-500 transition-all duration-300 border-4 border-slate-900"
            aria-label="Scroll right"
          >
            <ChevronRight size={28} />
          </button>

          {/* Scrollable List */}
          <div
            ref={scrollContainerRef}
            className="flex overflow-x-auto gap-3 pb-4 snap-x snap-mandatory scrollbar-hide px-2 scroll-smooth min-h-[300px]"
          >
            <AnimatePresence mode="wait">
              {loading ? (
                <div className="flex gap-3 w-full">
                  {[...Array(4)].map((_, i) => (
                    <div key={`skeleton-${i}`} className="min-w-[260px] md:min-w-[320px]">
                      <VideoSkeleton />
                    </div>
                  ))}
                </div>
              ) : (
                videos.map((video, index) => (
                  <motion.div
                    key={video._id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="group relative min-w-[240px] md:min-w-[300px] snap-center"
                  >
                    {/* Compact Card with Header Accent */}
                    <div className="bg-slate-800 rounded-xl h-full border border-slate-700 border-t-4 border-t-amber-500 shadow-lg overflow-hidden flex flex-col">
                      <div className="flex-grow relative h-48 w-full overflow-hidden">
                        <VideoCard
                          video={video}
                          className="cursor-pointer transform transition-all duration-300 hover:brightness-110 w-full h-full object-cover"
                          onClick={() => handleVideoSelect(video, index)}
                        />
                      </div>
                      <div className="p-3 bg-slate-800">
                        <h4 className="text-white font-medium text-sm line-clamp-1">{video.title}</h4>
                        <p className="text-slate-400 text-xs mt-1 line-clamp-1">{video.description}</p>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>

            {videos.length === 0 && !loading && (
              <div className="w-full text-center py-10">
                <div className="text-4xl mb-2 opacity-20">🎬</div>
                <p className="text-slate-500 text-sm font-medium">No videos found.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Full Screen Cinema Modal */}
      <AnimatePresence>
        {selectedVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 backdrop-blur-xl flex items-center justify-center z-50 p-4 lg:p-10"
            onClick={handleCloseModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-6xl flex flex-col items-center justify-center relative"
              onClick={e => e.stopPropagation()}
            >
              {/* Close Btn */}
              <button
                onClick={handleCloseModal}
                className="absolute -top-12 right-0 md:right-0 z-50 text-white/50 hover:text-white transition-colors flex items-center gap-2"
              >
                <span className="uppercase text-sm tracking-widest font-bold">Close</span>
                <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center">
                  <X size={20} />
                </div>
              </button>

              {/* Modal Nav */}
              {videos.length > 1 && (
                <>
                  <button onClick={prevVideo} className="absolute -left-4 md:-left-16 top-1/2 -translate-y-1/2 w-12 h-12 text-white hover:text-amber-500 transition-colors"><ChevronLeft size={48} /></button>
                  <button onClick={nextVideo} className="absolute -right-4 md:-right-16 top-1/2 -translate-y-1/2 w-12 h-12 text-white hover:text-amber-500 transition-colors"><ChevronRight size={48} /></button>
                </>
              )}

              {/* Video Player */}
              <div className="w-full aspect-video bg-black rounded-lg shadow-2xl overflow-hidden ring-1 ring-white/10 relative">
                <div className="absolute inset-0">
                  <OptimizedImage
                    src={getThumbnail(selectedVideo)}
                    alt={selectedVideo.title}
                    className="w-full h-full transform group-hover:scale-110 transition-transform duration-700"
                    objectFit="cover"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300" />
                </div>
                <video src={selectedVideo.video} controls autoPlay className="w-full h-full object-contain relative z-10" />
              </div>

              {/* Info */}
              <div className="w-full mt-6 flex justify-between items-start text-left">
                <div>
                  <h3 className="text-2xl md:text-3xl font-bold text-white mb-2 font-serif">{selectedVideo.title}</h3>
                  <p className="text-slate-400 max-w-2xl">{selectedVideo.description}</p>
                </div>
                <span className="px-4 py-2 bg-amber-500 text-slate-900 rounded-full text-sm font-bold uppercase tracking-wide">
                  {categories.find(c => c.id === selectedVideo.category)?.label}
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default VideoGallery;
