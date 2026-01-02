import axios from 'axios';
import config from '../config/config.js'; // This is your frontend config file

const orderService = {
  /**
   * Create a new order.
   * @param {object} orderData - The complete order object from your Checkout component.
   * @returns {Promise<object>} The server response.
   */
  createOrder: async (orderData) => {
    try {
      const cleanedOrderData = {
        ...orderData,
        items: (orderData.items || orderData.products || orderData.cartItems || []).map(item => {
          const { category, subCategory, ...restOfItem } = item;

          return {
            ...restOfItem,
            // Only include productId, name, price, quantity, and image for order items
            // Remove category and subCategory as they're not needed for order items
            productId: item.productId || item._id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image || item.images?.[0]
          };
        }),
      };

      const response = await axios.post(config.API_URLS.ORDERS, cleanedOrderData);
      return response.data;
      
    } catch (error) {
      console.error('Error creating order:', error.response?.data || error.message);
      throw error.response?.data || new Error('Failed to create order');
    }
  },

  getOrderById: async (orderId) => {
    if (!orderId) throw new Error('Order ID is required to fetch an order.');
    try {
      const response = await axios.get(`${config.API_URLS.ORDERS}/${orderId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching order by ID:', error.response?.data || error.message);
      throw error.response?.data || new Error('Failed to fetch order');
    }
  },

  getOrdersByEmail: async (email) => {
    if (!email) throw new Error('Email is required to fetch orders.');
    try {
      const response = await axios.get(`${config.API_URLS.ORDERS}?email=${encodeURIComponent(email)}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching orders:', error.response?.data || error.message);
      throw error.response?.data || new Error('Failed to fetch orders');
    }
  },
};

export default orderService;
