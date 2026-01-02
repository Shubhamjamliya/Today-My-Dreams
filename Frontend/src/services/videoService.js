import config from '../config/config';

const videoService = {
  // Get all videos with optional filters
  async getAllVideos(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.category) queryParams.append('category', params.category);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.page) queryParams.append('page', params.page);

      const response = await fetch(`${config.API_URLS.VIDEOS}?${queryParams}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch videos');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching videos:', error);
      throw error;
    }
  },

  // Get single video by ID
  async getVideo(videoId) {
    try {
      const response = await fetch(`${config.API_URLS.VIDEOS}/${videoId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch video');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching video:', error);
      throw error;
    }
  },

  // Get videos by category
  async getVideosByCategory(category, params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.page) queryParams.append('page', params.page);

      const response = await fetch(`${config.API_URLS.VIDEOS}/category/${category}?${queryParams}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch videos by category');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching videos by category:', error);
      throw error;
    }
  },

  // Get review videos
  async getReviewVideos(limit = 4) {
    return this.getVideosByCategory('review', { limit });
  },

  // Get work videos
  async getWorkVideos(limit = 4) {
    return this.getVideosByCategory('work', { limit });
  },

  // Get testimonial videos
  async getTestimonialVideos(limit = 4) {
    return this.getVideosByCategory('testimonial', { limit });
  },

  // Get demo videos
  async getDemoVideos(limit = 4) {
    return this.getVideosByCategory('demo', { limit });
  }
};

export default videoService;
