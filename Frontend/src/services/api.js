import axios from 'axios';
import config from '../config/config.js';

// Create axios instance with base URL from config
const api = axios.create({
  baseURL: config.API_BASE_URL + '/api',
  headers: config.CORS.HEADERS,
  withCredentials: config.CORS.WITH_CREDENTIALS,
});
export const categoryAPI = {
  /**
   * Fetches all categories (with optional city filter).
   */
  getCategories: (city = null) => {
    const params = city ? `?city=${encodeURIComponent(city)}` : '';
    return api.get(`/categories${params}`);
  },

  /**
   * Fetches a single category by its ID.
   */
  getCategory: (categoryId) => api.get(`/categories/${categoryId}`),

  /**
   * Fetches all categories with their sub-categories nested inside (with optional city filter).
   */
  getCategoriesWithSubCategories: (city = null) => {
    const params = city ? `?city=${encodeURIComponent(city)}` : '';
    return api.get(`/categories/nested${params}`);
  },
  
  // Add create, update, delete for categories if needed
};
export const subCategoryAPI = {
  /**
   * Fetches all sub-categories for a specific parent category.
   * Calls: GET /api/categories/:categoryId/subcategories
   */
  getSubCategories: (categoryId) => api.get(`/categories/${categoryId}/subcategories`),

  /**
   * Creates a new sub-category under a specific parent category.
   * Calls: POST /api/categories/:categoryId/subcategories
   */
  createSubCategory: (categoryId, subCategoryData) => api.post(`/categories/${categoryId}/subcategories`, subCategoryData),

  /**
   * Updates a specific sub-category by its ID.
   * Calls: PUT /api/subcategories/:subCategoryId
   */
  updateSubCategory: (subCategoryId, subCategoryData) => api.put(`/subcategories/${subCategoryId}`, subCategoryData),

  /**
   * Deletes a specific sub-category by its ID.
   * Calls: DELETE /api/subcategories/:subCategoryId
   */
  deleteSubCategory: (subCategoryId) => api.delete(`/subcategories/${subCategoryId}`),
};

// Add a request interceptor to add the auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API endpoints
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  signup: (userData) => api.post('/auth/signup', userData),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post(`/auth/reset-password/${token}`, { password }),
  updateProfile: (data) => api.put('/auth/update-profile', data),
};

// Hero Carousel API endpoints
export const heroCarouselAPI = {
  getActiveItems: (city = null) => {
    const params = city ? `?city=${encodeURIComponent(city)}` : '';
    return api.get(`/hero-carousel/active${params}`);
  },
};

// Blog API endpoints
export const blogAPI = {
  getBlogs: (params = '') => api.get(`/blog${params ? '?' + params : ''}`),
  getBlogBySlug: (slug) => api.get(`/blog/${slug}`),
  getCategories: () => api.get('/blog/categories'),
};

// Order API endpoints
export const orderAPI = {
  getOrdersByEmail: (email) => api.get(`/orders?email=${email}`),
  getOrderById: (orderId) => api.get(`/orders/${orderId}`),
  createOrder: (orderData) => api.post('/orders', orderData),
};

// Coupon endpoints
const validateCoupon = (data) => {
  return axios.post(`${config.API_BASE_URL}/api/coupons/validate`, data);
};

const applyCoupon = (data) => {
  return axios.post(`${config.API_BASE_URL}/api/coupons/apply`, data);
};

// Settings API endpoints
export const settingsAPI = {
  getCodUpfrontAmount: () => api.get('/settings/cod-upfront-amount'),
};

// Pin Code Service Fee API endpoints
export const pinCodeServiceFeeAPI = {
  checkPinCodeServiceFee: (pinCode) => api.get(`/pin-code-service-fees/check/${pinCode}`),
};

// City API endpoints
export const cityAPI = {
  getCities: () => api.get('/cities'),
  getCityByName: (cityName) => api.get(`/cities?name=${encodeURIComponent(cityName)}`),
};

// Default export for general API usage
export default api; 