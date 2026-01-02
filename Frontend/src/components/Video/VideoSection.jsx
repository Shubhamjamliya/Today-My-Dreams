import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, ChevronLeft, ChevronRight } from 'lucide-react';
import VideoCard from './VideoCard';
import config from '../../config/config';
import Loader from '../Loader';
import { VideoSkeleton } from '../Loader/Skeleton';

const VideoSection = ({ 
  title = "Our Videos", 
  subtitle = "See our work and customer reviews",
  category = null,
  limit = 6,
  showViewAll = true,
  className = ""
}) => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedVideo, setSelectedVideo] = useState(null);

  useEffect(() => {
    fetchVideos();
  }, [category, limit]);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (category) params.append('category', category);
      params.append('limit', limit.toString());
      
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

  const handleVideoSelect = (video) => {
    setSelectedVideo(video);
  };

  const handleCloseModal = () => {
    setSelectedVideo(null);
  };

  const nextVideo = () => {
    setCurrentIndex((prev) => (prev + 1) % videos.length);
  };

  const prevVideo = () => {
    setCurrentIndex((prev) => (prev - 1 + videos.length) % videos.length);
  };

  if (loading) {
    return (
      <section className={`py-1 ${className}`}>
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(limit)].map((_, i) => (
              <VideoSkeleton key={i} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (videos.length === 0) {
    return null; // Don't render section if no videos
  }

  return (
    <section className={` ${className}`}>
      <div className="container mx-auto px-4">
        {/* Modern Premium Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-4"
        >
          

          <h2 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent mb-4 leading-tight">
            {title}
          </h2>
         
        </motion.div>

        {/* Videos Grid - Instagram Style */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="relative"
        >
          {/* Desktop Grid - 3 columns */}
          <div className="hidden lg:grid lg:grid-cols-4 xl:grid-cols-5 gap-4 xl:gap-6">
            {videos.map((video, index) => (
              <motion.div
                key={video._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <VideoCard
                  video={video}
                  className="cursor-pointer"
                  onClick={() => handleVideoSelect(video)}
                />
              </motion.div>
            ))}
          </div>

          {/* Tablet Grid - 2 columns */}
          <div className="hidden md:grid lg:hidden md:grid-cols-2 gap-4">
            {videos.map((video, index) => (
              <motion.div
                key={video._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <VideoCard
                  video={video}
                  className="cursor-pointer"
                  onClick={() => handleVideoSelect(video)}
                />
              </motion.div>
            ))}
          </div>

          {/* Mobile Video Grid with Horizontal Scroll */}
          <div className="md:hidden">
            <div className="relative px-2">
              {/* Horizontal Scroll Container */}
              <div className="overflow-x-auto no-scrollbar -mx-2 px-2">
                <div className="flex space-x-4 pb-4">
                  {videos.map((video, index) => (
                    <div 
                      key={video._id} 
                      className="flex-none w-[calc(50%-8px)] first:ml-2 last:mr-2"
                    >
                      <VideoCard
                        video={video}
                        className="cursor-pointer"
                        onClick={() => handleVideoSelect(video)}
                      />
                    </div>
                  ))}
                </div>
              </div>

             
            </div>
          </div>
        </motion.div>

        {/* View All Button */}
        {showViewAll && videos.length >= limit && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="text-center mt-8"
          >
            <button className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:shadow-lg transform hover:scale-105 transition-all">
              <Play size={20} />
              View All Videos
            </button>
          </motion.div>
        )}
      </div>

      {/* Video Modal */}
      {selectedVideo && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50"
          onClick={handleCloseModal}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
            className="relative max-w-4xl w-full max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <VideoCard
              video={selectedVideo}
              showModal={true}
              onClose={handleCloseModal}
              className="w-full"
            />
          </motion.div>
        </motion.div>
      )}
    </section>
  );
};

export default VideoSection;
