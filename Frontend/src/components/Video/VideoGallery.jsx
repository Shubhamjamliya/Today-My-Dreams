import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, ChevronLeft, ChevronRight, X, Star, Award, MessageCircle, Lightbulb } from 'lucide-react';
import VideoCard from './VideoCard';
import config from '../../config/config';
import Loader from '../Loader';
import { VideoSkeleton } from '../Loader/Skeleton';

const VideoGallery = ({ 
  title = "Our Videos", 
  subtitle = "Explore our work and customer reviews",
  className = ""
}) => {
  const [activeTab, setActiveTab] = useState('all');
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const categories = [
    { id: 'all', label: 'All Videos', icon: <Play className="w-4 h-4" />, color: 'from-yellow-500 to-orange-500' },
    { id: 'review', label: 'Customer Reviews', icon: <Star className="w-4 h-4" />, color: 'from-yellow-500 to-orange-500' },
    { id: 'work', label: 'Our Work', icon: <Award className="w-4 h-4" />, color: 'from-yellow-500 to-orange-500' },
    { id: 'testimonial', label: 'Testimonials', icon: <MessageCircle className="w-4 h-4" />, color: 'from-yellow-500 to-orange-500' },
    { id: 'demo', label: 'Demo/How-to', icon: <Lightbulb className="w-4 h-4" />, color: 'from-yellow-500 to-orange-500' }
  ];

  useEffect(() => {
    fetchVideos();
  }, [activeTab]);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (activeTab !== 'all') {
        params.append('category', activeTab);
      }
      params.append('limit', '20'); // Get more videos for the gallery
      
      const response = await fetch(`${config.API_URLS.VIDEOS}?${params}`);
      
      if (response.ok) {
        const data = await response.json();
        setVideos(data.videos || []);
      } else {
        console.error('Failed to fetch videos');
      }
    } catch (error) {
      console.error('Error fetching videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVideoSelect = (video, index) => {
    setSelectedVideo(video);
    setCurrentIndex(index);
  };

  const handleCloseModal = () => {
    setSelectedVideo(null);
  };

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
      <section className={`pt-2 sm:pt-4 lg:pt-6 ${className}`}>
        <div className="container mx-auto px-3 sm:px-4 lg:px-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <VideoSkeleton key={i} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={`pt-2 sm:pt-4 lg:pt-6 ${className}`}>
      <div className="container mx-auto px-3 sm:px-4 lg:px-6">
        {/* Premium Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-6 sm:mb-8 lg:mb-10"
        >
          <div className="relative">
            {/* Background decoration */}
            <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-20 h-20 sm:w-24 sm:h-24 lg:w-32 lg:h-32 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 rounded-full blur-3xl"></div>
            
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="relative text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-yellow-600 via-orange-600 to-yellow-600 bg-clip-text text-transparent mb-3 sm:mb-4 px-2"
            >
              {title}
            </motion.h2>
            
           
          </div>
        </motion.div>

        {/* Premium Category Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mb-6 sm:mb-8 lg:mb-10"
        >
          {/* Mobile: Horizontal scroll, Desktop: Flex wrap */}
          <div className="flex overflow-x-auto scrollbar-hide gap-2 sm:gap-3 sm:flex-wrap sm:justify-center pb-2 sm:pb-0">
            {categories.map((category) => (
              <motion.button
                key={category.id}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab(category.id)}
                className={`group relative px-3 py-2 sm:px-4 sm:py-3 lg:px-6 lg:py-3 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-semibold transition-all duration-300 overflow-hidden flex-shrink-0 ${
                  activeTab === category.id
                    ? `bg-gradient-to-r ${category.color} text-white shadow-xl shadow-yellow-500/25`
                    : 'bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-white hover:shadow-lg border border-gray-200'
                }`}
              >
                {/* Active tab glow effect */}
                {activeTab === category.id && (
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"></div>
                )}
                
                <div className="relative flex items-center gap-1 sm:gap-2 lg:gap-3">
                  <div className={`transition-transform duration-300 ${activeTab === category.id ? 'scale-110' : 'group-hover:scale-110'}`}>
                    {category.icon}
                  </div>
                  <span className="whitespace-nowrap text-xs sm:text-sm">{category.label}</span>
                </div>
                
                {/* Hover effect */}
                <div className={`absolute inset-0 bg-gradient-to-r ${category.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-xl sm:rounded-2xl`}></div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Premium Videos Grid */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8"
        >
          <AnimatePresence mode="wait">
            {videos.map((video, index) => (
              <motion.div
                key={video._id}
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -30, scale: 0.9 }}
                transition={{ 
                  delay: index * 0.1,
                  duration: 0.5,
                  type: "spring",
                  stiffness: 100
                }}
                className="group"
              >
                <VideoCard
                  video={video}
                  className="cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20"
                  onClick={() => handleVideoSelect(video, index)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Premium No Videos Message */}
        {videos.length === 0 && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center py-16"
          >
            <div className="relative">
              {/* Background decoration */}
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-24 h-24 bg-gradient-to-r from-yellow-400/10 to-orange-400/10 rounded-full blur-2xl"></div>
              
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="relative text-gray-400 mb-6"
              >
                <Play size={64} className="mx-auto" />
              </motion.div>
              
              <motion.h3 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-2xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent mb-3"
              >
                No videos found
              </motion.h3>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="text-gray-600 text-lg"
              >
                {activeTab === 'all' 
                  ? 'No videos available at the moment.' 
                  : `No ${categories.find(c => c.id === activeTab)?.label.toLowerCase()} available.`}
              </motion.p>
            </div>
          </motion.div>
        )}

      
      </div>

      {/* Premium Video Modal */}
      {selectedVideo && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 z-50"
          onClick={handleCloseModal}
        >
          <motion.div
            initial={{ scale: 0.6, opacity: 0, y: 50 }}
            animate={{ scale: 0.7, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="relative max-w-6xl w-full max-h-[95vh] sm:max-h-[90vh] mx-2 sm:mx-0"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Premium Close Button */}
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleCloseModal}
              className="absolute -top-2 -right-2 sm:-top-4 sm:-right-4 w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full flex items-center justify-center hover:shadow-xl hover:shadow-red-500/30 transition-all duration-300 z-10"
            >
              <X size={16} className="sm:w-6 sm:h-6" />
            </motion.button>

            {/* Premium Navigation Buttons */}
            {videos.length > 1 && (
              <>
                <motion.button
                  whileHover={{ scale: 1.1, x: -5 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={prevVideo}
                  className="absolute left-2 sm:left-6 top-1/2 transform -translate-y-1/2 w-10 h-10 sm:w-14 sm:h-14 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/80 hover:shadow-xl transition-all duration-300 z-10"
                >
                  <ChevronLeft size={20} className="sm:w-7 sm:h-7" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1, x: 5 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={nextVideo}
                  className="absolute right-2 sm:right-6 top-1/2 transform -translate-y-1/2 w-10 h-10 sm:w-14 sm:h-14 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/80 hover:shadow-xl transition-all duration-300 z-10"
                >
                  <ChevronRight size={20} className="sm:w-7 sm:h-7" />
                </motion.button>
              </>
            )}

            {/* Premium Video Player Container */}
            <div className="bg-white/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl shadow-black/20 border border-white/20">
              <div className="aspect-video relative">
                <video
                  src={selectedVideo.video}
                  className="w-full h-full object-cover"
                  controls
                  autoPlay
                />
                {/* Video overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
              </div>
              
              <div className="p-4 sm:p-6 lg:p-8 bg-gradient-to-r from-white to-gray-50">
                <motion.h3 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-3 sm:mb-4"
                >
                  {selectedVideo.title}
                </motion.h3>
                
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6"
                >
                  <span className={`px-3 py-1 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-semibold shadow-lg ${
                    selectedVideo.category === 'review' ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white' :
                    selectedVideo.category === 'work' ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white' :
                    selectedVideo.category === 'testimonial' ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white' :
                    'bg-gradient-to-r from-yellow-400 to-orange-500 text-white'
                  }`}>
                    {categories.find(c => c.id === selectedVideo.category)?.label}
                  </span>
                  
                  <div className="flex items-center gap-2 text-gray-600">
                    <Play size={14} className="sm:w-4 sm:h-4" />
                    <span className="font-medium text-sm sm:text-base">{currentIndex + 1} of {videos.length}</span>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </section>
  );
};

export default VideoGallery;
