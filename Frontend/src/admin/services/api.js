import axios from 'axios';
import config from '../config/config';

// Create axios instance with base URL from config
const api = axios.create({
  baseURL: config.API_BASE_URL,
  headers: {
    'Accept': 'application/json',
  },
});

// Add request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      console.error('API Error:', error.response.status, error.response.data);

      // Handle token expiration
      if (error.response.status === 401) {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_logged_in');

        // Redirect to login if not already there
        if (window.location.pathname !== '/admin/login') {
          window.location.href = '/admin/login';
        }
      }

      if (error.response.data?.error) {
        console.error('Server Error:', error.response.data.error);
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('Network Error: No response received from server. Is the backend running at', config.API_BASE_URL + '?');
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Request Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// Helper function for file uploads
const uploadWithFiles = (url, formData) => {
  const token = localStorage.getItem('admin_token');

  // IMPORTANT: Do NOT set 'Content-Type' header manually for multipart/form-data here.
  // Let the browser/axios set it with the correct boundary. Manually setting it breaks the request.
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  return axios.post(`${config.API_BASE_URL}${url}`, formData, {
    headers,
    timeout: 300000, // 5 minutes timeout for large file uploads
  }).catch(error => {
    console.error('=== Upload Error ===');
    console.error('Error response status:', error.response?.status);
    console.error('Error response data:', error.response?.data);
    console.error('Error message:', error.message);
    console.error('Request config:', error.config);
    console.error('Request URL:', error.config?.url);
    console.error('Request method:', error.config?.method);

    // Provide more specific error messages
    if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
      const networkError = new Error('Cannot connect to backend server. Please ensure the backend server is running ');
      networkError.isNetworkError = true;
      throw networkError;
    }

    throw error;
  });
};

// Helper function for file updates
const updateWithFiles = (url, formData) => {
  const token = localStorage.getItem('admin_token');
  // Do not set Content-Type manually; let axios/browser handle the multipart boundary
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return axios.put(`${config.API_BASE_URL}${url}`, formData, {
    headers,
    timeout: 300000, // 5 minutes timeout for large file uploads
  });
};

// Hero Carousel endpoints
const heroCarouselEndpoints = {
  getCarouselItems: () => api.get('/api/hero-carousel'),
  getCarouselItem: (id) => api.get(`/api/hero-carousel/${id}`),
  getActiveCarouselItems: () => api.get('/api/hero-carousel/active'),
  createCarouselItem: (formData) => uploadWithFiles('/api/hero-carousel', formData),
  updateCarouselItem: (id, formData) => updateWithFiles(`/api/hero-carousel/${id}`, formData),
  deleteCarouselItem: (id) => api.delete(`/api/hero-carousel/${id}`),
  toggleCarouselActive: (id) => api.patch(`/api/hero-carousel/${id}/toggle-active`),
  updateCarouselOrder: (items) => api.post('/api/hero-carousel/update-order', items)
};

// Coupon endpoints
const couponEndpoints = {
  getCoupons: () => api.get('/api/coupons'),
  createCoupon: (data) => api.post('/api/coupons', data),
  updateCoupon: (id, data) => api.put(`/api/coupons/${id}`, data),
  deleteCoupon: (id) => api.delete(`/api/coupons/${id}`),
};

// Blog endpoints
const blogEndpoints = {
  getAdminBlogs: (params = '') => api.get(`/api/blog/admin/all${params ? '?' + params : ''}`),
  getAdminBlog: (id) => api.get(`/api/blog/admin/${id}`),
  createBlog: (formData) => uploadWithFiles('/api/blog', formData),
  updateBlog: (id, formData) => updateWithFiles(`/api/blog/${id}`, formData),
  deleteBlog: (id) => api.delete(`/api/blog/${id}`),
  getBlogCategories: () => api.get('/api/blog/categories'),
};

const apiService = {
  // Auth endpoints
  login: async (credentials) => {
    console.log('Attempting admin login with:', credentials.email);
    const response = await api.post('/api/admin/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('admin_token', response.data.token);
      localStorage.setItem('admin_logged_in', 'true');
      console.log('Admin login successful, token stored');
    }
    return response;
  },

  // Update admin credentials
  updateAdminCredentials: async (credentials) => {
    console.log('Attempting to update admin credentials');
    const response = await api.put('/api/admin/auth/update-credentials', credentials);
    return response;
  },

  // Token verification
  verifyToken: async () => {
    try {
      const response = await api.get('/api/admin/auth/verify');
      return response.data;
    } catch (error) {
      console.error('Token verification failed:', error);
      throw error;
    }
  },

  // Logout
  logout: () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_logged_in');
    console.log('Admin logged out, tokens cleared');
  },

  // Products endpoints
  getProducts: async (params = {}) => {
    const module = typeof params === 'string' ? params : params.module;
    const url = module === 'shop' ? '/api/shop/products' : '/api/products';
    // Wait, let's be careful. The original /api/shop was used for all products?
    // Looking at shop.js, it handles everything.
    const response = await api.get(url);
    return response;
  },
  getFeaturedProducts: async () => {
    const response = await api.get('/api/featured-products');
    console.log('API getFeaturedProducts response:', response.data);
    return response;
  },
  getBestSellerProducts: async () => {
    const response = await api.get('/api/shop/section/bestsellers');
    console.log('API getBestSellerProducts response:', response.data);
    return response;
  },
  getMostLovedProducts: async () => {
    const response = await api.get('/api/shop/section/mostloved');
    console.log('API getMostLovedProducts response:', response.data);
    return response;
  },
  getProductsBySection: async (section) => {
    const response = await api.get(`/api/shop/section/${section}`);
    console.log(`API getProductsBySection(${section}) response:`, response.data);
    return response;
  },
  getProduct: async (id, params = {}) => {
    const module = typeof params === 'string' ? params : params.module;
    const url = module === 'shop' ? `/api/shop/products/${id}` : `/api/products/${id}`;
    return api.get(url);
  },
  createProduct: async (formData) => {
    const module = formData.get('module');
    const url = module === 'shop' ? '/api/shop/products/upload' : '/api/products'; // Corrected create as well just in case, though original used uploadWithFiles on /api/products which is POST / (createProductWithFiles)
    // Wait, original createProduct used /api/shop/upload vs /api/shop/products/upload.
    // Original: const url = module === 'shop' ? '/api/shop/products/upload' : '/api/shop/upload';
    // Actually original for non-shop was '/api/shop/upload'?? NO.
    // Let's look closer at the original code.
    // Original: const url = module === 'shop' ? '/api/shop/products/upload' : '/api/shop/upload';
    // Backend/products.js route is router.post("/", ... createProductWithFiles). Mounted at /api/products.
    // So for non-shop it should be /api/products. 
    // But original code had /api/shop/upload. This looks like a copy-paste error in api.js or major confusion.
    // Backend/routes/products.js does NOT have /upload. It handles upload on /.

    // Let's fix createProduct too.
    const createUrl = module === 'shop' ? '/api/shop/products/upload' : '/api/products';
    return uploadWithFiles(createUrl, formData);
  },
  updateProduct: async (id, formData) => {
    const module = formData.get('module');
    const url = module === 'shop' ? `/api/shop/products/${id}` : `/api/products/${id}`;
    return updateWithFiles(url, formData);
  },
  updateProductSections: async (id, sections, params = {}) => {
    const module = typeof params === 'string' ? params : params.module;
    const url = module === 'shop' ? `/api/shop/products/${id}/sections` : `/api/products/${id}/sections`; // Assuming sections for regular products exist? Backend/products.js has patch /:id/sections.
    return api.patch(url, sections);
  },
  deleteProduct: async (id, params = {}) => {
    const module = typeof params === 'string' ? params : params.module;
    const url = module === 'shop' ? `/api/shop/products/${id}` : `/api/products/${id}`;
    return api.delete(url);
  },

  // Categories endpoints
  getCategories: (params = {}) => {
    const module = typeof params === 'string' ? params : params.module;
    return module === 'shop' ? api.get('/api/shop/categories') : api.get('/api/categories/admin/all');
  },
  getCategory: (id, params = {}) => {
    const module = typeof params === 'string' ? params : params.module;
    const url = module === 'shop' ? `/api/shop/categories/${id}` : `/api/categories/${id}`;
    return api.get(url);
  },
  createCategory: (formData) => {
    const module = formData instanceof FormData ? formData.get('module') : formData.module;
    const url = module === 'shop' ? '/api/shop/categories' : '/api/categories';
    return formData instanceof FormData
      ? uploadWithFiles(url, formData)
      : api.post(url, formData);
  },
  updateCategory: (id, formData) => {
    const module = formData instanceof FormData ? formData.get('module') : formData.module;
    const url = module === 'shop' ? `/api/shop/categories/${id}` : `/api/categories/${id}`;
    return formData instanceof FormData
      ? updateWithFiles(url, formData)
      : api.put(url, formData);
  },
  deleteCategory: (id, params = {}) => {
    const module = typeof params === 'string' ? params : params.module;
    const url = module === 'shop' ? `/api/shop/categories/${id}` : `/api/categories/${id}`;
    return api.delete(url);
  },
  updateCategoryOrder: (updates) => api.post('/api/categories/update-order', { updates }),

  // Orders endpoints
  getOrders: (params = {}) => {
    const module = typeof params === 'string' ? params : params.module;
    return module === 'shop' ? api.get('/api/shop/orders') : api.get('/api/orders/json');
  },
  getOrderById: (id) => api.get(`/api/orders/${id}`),
  updateOrder: (id, orderData) => api.put(`/api/orders/${id}`, orderData),
  updateOrderStatus: (id, orderStatus) => api.put(`/api/orders/${id}/status`, { orderStatus }),
  // Sub-Category Functions

  getSubCategories: (categoryId, params = {}) => {
    const module = typeof params === 'string' ? params : params.module;
    const url = module === 'shop' ? `/api/shop/categories/${categoryId}/subcategories` : `/api/categories/${categoryId}/subcategories`;
    return api.get(url);
  },
  createSubCategory: (categoryId, subCategoryData, params = {}) => {
    const module = typeof params === 'string' ? params : params.module;
    const url = module === 'shop' ? `/api/shop/categories/${categoryId}/subcategories` : `/api/categories/${categoryId}/subcategories`;
    return subCategoryData instanceof FormData
      ? uploadWithFiles(url, subCategoryData)
      : api.post(url, subCategoryData);
  },
  updateSubCategory: (subCategoryId, subCategoryData, params = {}) => {
    const module = typeof params === 'string' ? params : params.module;
    const url = module === 'shop' ? `/api/shop/subcategories/${subCategoryId}` : `/api/subcategories/${subCategoryId}`;
    return subCategoryData instanceof FormData
      ? updateWithFiles(url, subCategoryData)
      : api.put(url, subCategoryData);
  },
  deleteSubCategory: (subCategoryId, params = {}) => {
    const module = typeof params === 'string' ? params : params.module;
    const url = module === 'shop' ? `/api/shop/subcategories/${subCategoryId}` : `/api/subcategories/${subCategoryId}`;
    return api.delete(url);
  },


  // Sellers endpoints
  getSellers: () => api.get('/api/seller/all'),
  getSeller: (id) => api.get(`/api/seller/${id}`),
  createSeller: (formData) => uploadWithFiles('/api/seller/register', formData),
  updateSeller: (id, formData) => updateWithFiles(`/api/seller/${id}`, formData),
  deleteSeller: (id) => api.delete(`/api/seller/${id}`),
  deleteSellerImage: (sellerId, imageId) => api.delete(`/api/seller/${sellerId}/image/${imageId}`),
  deleteSellerProfileImage: (sellerId) => api.delete(`/api/seller/${sellerId}/profile-image`),
  updateSellerApproval: (id, approved) => api.patch(`/api/seller/${id}/approve`, { approved }),
  updateSellerBlock: (id, blocked) => api.patch(`/api/seller/${id}/block`, { blocked }),

  // Hero Carousel endpoints
  ...heroCarouselEndpoints,

  // Coupon endpoints
  ...couponEndpoints,

  // Settings endpoints
  getSettings: () => api.get('/api/settings'),
  getSetting: (key) => api.get(`/api/settings/${key}`),
  updateSetting: (key, data) => api.put(`/api/settings/${key}`, data),
  createSetting: (data) => api.post('/api/settings', data),
  deleteSetting: (key) => api.delete(`/api/settings/${key}`),

  // Pin Code Service Fee endpoints
  getPinCodeServiceFees: () => api.get('/api/pin-code-service-fees/admin'),
  createPinCodeServiceFee: (data) => api.post('/api/pin-code-service-fees/admin', data),
  updatePinCodeServiceFee: (id, data) => api.put(`/api/pin-code-service-fees/admin/${id}`, data),
  deletePinCodeServiceFee: (id) => api.delete(`/api/pin-code-service-fees/admin/${id}`),

  // Review endpoints
  getProductReviews: async (productId) => {
    return api.get(`/api/reviews/product/${productId}`);
  },
  createReview: async (reviewData) => {
    return api.post('/api/reviews', reviewData);
  },
  updateReview: async (reviewId, reviewData) => {
    return api.put(`/api/reviews/${reviewId}`, reviewData);
  },
  deleteReview: async (reviewId) => {
    return api.delete(`/api/reviews/${reviewId}`);
  },

  // Blog endpoints
  ...blogEndpoints,
};

export default apiService; 