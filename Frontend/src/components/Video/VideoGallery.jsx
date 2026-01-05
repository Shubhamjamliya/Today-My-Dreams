import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, ChevronLeft, ChevronRight, X, Star, Award, MessageCircle, Lightbulb } from 'lucide-react';
import VideoCard from './VideoCard';
import config from '../../config/config';
import { VideoSkeleton } from '../Loader/Skeleton';

const VideoGallery = ({
  title = "Our Gallery",
  subtitle = "Moments captured in time",
  className = ""
}) => {
  const [activeTab, setActiveTab] = useState('all');
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollContainerRef = useRef(null);

  const categories = [
    { id: 'all', label: 'All', icon: <Play className="w-3 h-3" /> },
    { id: 'review', label: 'Reviews', icon: <Star className="w-3 h-3" /> },
    { id: 'work', label: 'Highlights', icon: <Award className="w-3 h-3" /> },
    { id: 'testimonial', label: 'Stories', icon: <MessageCircle className="w-3 h-3" /> },
    { id: 'demo', label: 'Guides', icon: <Lightbulb className="w-3 h-3" /> }
  ];

  useEffect(() => {
    fetchVideos();
  }, [activeTab]);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (activeTab !== 'all') params.append('category', activeTab);
      params.append('limit', '20');

      const response = await fetch(`${config.API_URLS.VIDEOS}?${params}`);
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

  if (loading) {
    return (
      <section className={`py-12 bg-slate-900 ${className}`}>
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <VideoSkeleton key={i} />)}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={`py-16 bg-slate-900 relative overflow-hidden ${className}`}>
      {/* Cinematic Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px]"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10">

        {/* Header & Tabs Row */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="text-left"
          >
            <span className="text-amber-500 font-bold tracking-widest uppercase text-xs mb-2 block">Watch & Explore</span>
            <h2 className="text-3xl md:text-5xl font-bold text-white font-serif">{title}</h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="flex flex-wrap gap-2 justify-center md:justify-end"
          >
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveTab(category.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${activeTab === category.id
                  ? 'bg-amber-500 text-slate-900 shadow-lg shadow-amber-500/20'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white border border-slate-700'
                  }`}
              >
                {category.icon}
                {category.label}
              </button>
            ))}
          </motion.div>
        </div>

        {/* Carousel Container */}
        <div className="relative group/carousel">
          {/* Nav Buttons - Always Visible & Styled */}
          <button
            onClick={() => scroll('left')}
            className="absolute -left-4 md:-left-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 md:w-14 md:h-14 bg-white text-slate-900 rounded-full shadow-[0_0_20px_rgba(0,0,0,0.5)] flex items-center justify-center hover:scale-110 hover:bg-amber-500 transition-all duration-300 border-4 border-slate-900"
            aria-label="Scroll left"
          >
            <ChevronLeft size={28} />
          </button>

          <button
            onClick={() => scroll('right')}
            className="absolute -right-4 md:-right-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 md:w-14 md:h-14 bg-white text-slate-900 rounded-full shadow-[0_0_20px_rgba(0,0,0,0.5)] flex items-center justify-center hover:scale-110 hover:bg-amber-500 transition-all duration-300 border-4 border-slate-900"
            aria-label="Scroll right"
          >
            <ChevronRight size={28} />
          </button>

          {/* Scrollable List */}
          <div
            ref={scrollContainerRef}
            className="flex overflow-x-auto gap-5 pb-8 snap-x snap-mandatory scrollbar-hide px-2 scroll-smooth min-h-[400px]"
          >
            <AnimatePresence mode="wait">
              {videos.map((video, index) => (
                <motion.div
                  key={video._id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="group relative min-w-[260px] md:min-w-[320px] snap-center"
                >
                  {/* Card Wrapper for Styling */}
                  <div className="bg-slate-800 rounded-2xl p-2 h-full border border-slate-700 hover:border-amber-500/50 transition-colors shadow-lg">
                    <VideoCard
                      video={video}
                      className="cursor-pointer transform transition-all duration-300 hover:brightness-110 h-full rounded-xl overflow-hidden bg-slate-900"
                      onClick={() => handleVideoSelect(video, index)}
                    />
                    {/* Optional Overlay info if VideoCard doesn't have it, but VideoCard usually does. 
                                    If VideoCard titles are dark, they might be invisible on dark bg. 
                                    Assuming VideoCard handles its own internal layout. If it's transparent, the bg-slate-800 helps.
                                */}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {videos.length === 0 && !loading && (
              <div className="w-full text-center py-20">
                <div className="text-6xl mb-4 opacity-20">🎬</div>
                <p className="text-slate-500 text-xl font-medium">No videos found in this category.</p>
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
              <div className="w-full aspect-video bg-black rounded-lg shadow-2xl overflow-hidden ring-1 ring-white/10">
                <video src={selectedVideo.video} controls autoPlay className="w-full h-full object-contain" />
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
