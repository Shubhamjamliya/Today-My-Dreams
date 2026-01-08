import React, { useState, useEffect } from 'react';
import apiService from '../services/api';
import config from '../config/config';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, MapPin, PlusCircle, ExternalLink, Hash, Copy } from 'lucide-react'; // Import necessary icons
import Loader from '../components/Loader';
import { TableSkeleton } from '../components/Skeleton';

function toIST(dateString) {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
}

const Orders = ({ module }) => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingOrder, setUpdatingOrder] = useState(null);
  const [stateFilter, setStateFilter] = useState([]);
  const [showStateFilter, setShowStateFilter] = useState(false);

  const indianStates = ["Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi", "Jammu and Kashmir", "Ladakh", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", "Lakshadweep", "Puducherry", "Andaman and Nicobar Islands"];

  useEffect(() => {
    fetchOrders();
  }, [module]);

  const fetchOrders = async () => {
    try {
      const response = await apiService.getOrders({ module });
      let ordersData = response.data.orders || [];

      setOrders(ordersData);
      setFilteredOrders(ordersData); // Initialize filteredOrders with all fetched orders
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  // The state filtering logic below is distinct from module-based filtering
  // and is kept as it's a separate user-driven filter.
  const handleStateFilterChange = (selectedStates) => {
    setStateFilter(selectedStates);
    const filtered = selectedStates.length === 0
      ? orders
      : orders.filter(order => selectedStates.includes(order.address?.state));
    setFilteredOrders(filtered);
  };

  const toggleStateFilter = (state) => {
    const newFilter = stateFilter.includes(state)
      ? stateFilter.filter(s => s !== state)
      : [...stateFilter, state];
    handleStateFilterChange(newFilter);
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      setUpdatingOrder(orderId);
      await apiService.updateOrderStatus(orderId, newStatus);
      setSuccess(`Order status updated to ${newStatus} successfully!`);
      await fetchOrders();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update order status');
      setTimeout(() => setError(null), 5000);
    } finally {
      setUpdatingOrder(null);
    }
  };

  const copyProductId = async (productId) => {
    try {
      await navigator.clipboard.writeText(productId);
      setSuccess(`Product ID copied to clipboard!`);
      setTimeout(() => setSuccess(null), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = productId;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setSuccess(`Product ID copied to clipboard!`);
      setTimeout(() => setSuccess(null), 2000);
    }
  };


  const statusColors = {
    processing: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    service_scheduled: 'bg-indigo-100 text-indigo-800',
    service_in_progress: 'bg-purple-100 text-purple-800',
    service_completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    // Fallback support for old orders or shop orders if they share this component
    shipping: 'bg-indigo-100 text-indigo-800',
    shipped: 'bg-indigo-100 text-indigo-800',
    delivered: 'bg-green-100 text-green-800'
  };

  const serviceStatuses = ['processing', 'confirmed', 'service_scheduled', 'service_in_progress', 'service_completed', 'cancelled'];
  const shopStatuses = ['processing', 'confirmed', 'shipped', 'delivered', 'cancelled'];
  const availableStatuses = module === 'shop' ? shopStatuses : serviceStatuses;

  const paymentStatusColors = { pending: 'bg-yellow-100 text-yellow-800', pending_upfront: 'bg-blue-100 text-blue-800', completed: 'bg-green-100 text-green-800', failed: 'bg-red-100 text-red-800' };

  if (loading) return (
    <div className="max-w-7xl mx-auto p-4 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex justify-between items-center mb-6 bg-white p-6 rounded-xl shadow-sm">
        <div className="space-y-2">
          <div className="h-8 w-64 bg-slate-200 rounded-lg"></div>
          <div className="h-4 w-48 bg-slate-100 rounded-lg"></div>
        </div>
        <div className="h-10 w-40 bg-slate-200 rounded-lg"></div>
      </div>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <TableSkeleton rows={10} cols={6} />
      </div>
    </div>
  );
  if (error && !success) return <div className="text-red-600 text-center p-4">Error: {error}</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-6">{module === 'shop' ? 'Shop Orders' : 'Service Orders'}</h1>
      {success && <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">{success}</div>}
      {error && <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>}

      {/* Filter Section (unchanged) */}
      <div className="mb-6 bg-white rounded-lg shadow p-4">
        {/* ... filter UI */}
      </div>

      {/* Orders List */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <div className="w-full" style={{ minWidth: '1000px' }}>
          <table className="w-full min-w-full divide-y divide-gray-200 text-xs sm:text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase">Image</th>
                <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order Name</th>
                <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assigned Vendor</th>
                <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
                <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.map((order) => {
                const firstItem = order.items && order.items[0];
                const orderName = firstItem?.name || 'Order';
                return (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-2 py-4 whitespace-nowrap">
                      <div className="h-12 w-12 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden">
                        <img
                          src={config.fixImageUrl(firstItem?.image)}
                          alt={orderName}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://placehold.co/100x100?text=No+Img';
                          }}
                        />
                      </div>
                    </td>
                    <td className="px-2 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900">{orderName}</div>
                      <div className="text-xs text-indigo-600 font-semibold">{order.customOrderId || order._id}</div>
                      {order.customOrderId && (
                        <div className="text-xs text-gray-400">DB: {order._id}</div>
                      )}
                    </td>
                    <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>{order.customerName}</div>
                      <div className="text-xs text-gray-400">{order.email}</div>
                    </td>
                    <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-500">{toIST(order.createdAt)}</td>
                    {/* NEW: Schedule Data */}
                    <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.assignedVendorId ? (
                        <div className="flex flex-col">
                          <span className="font-semibold text-gray-900">{order.assignedVendorId.name}</span>
                          <span className="text-xs text-gray-400">{order.assignedVendorId.phone}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-900">₹{order.totalAmount}</td>
                    <td className="px-2 py-4 whitespace-nowrap">
                      <select value={order.orderStatus} onChange={(e) => updateOrderStatus(order._id, e.target.value)} disabled={updatingOrder === order._id} className={`text-sm rounded-full px-3 py-1 font-semibold ${statusColors[order.orderStatus]} ${updatingOrder === order._id ? 'opacity-50' : ''}`}>
                        {availableStatuses.map((status) => (<option key={status} value={status}>{status.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</option>))}
                      </select>
                    </td>
                    <td className="px-2 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${paymentStatusColors[order.paymentStatus]}`}>{order.paymentStatus === 'pending_upfront' ? 'Upfront Paid' : order.paymentStatus}</span>
                    </td>
                    <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button onClick={() => setSelectedOrder(order)} className="text-indigo-600 hover:text-indigo-900">View Details</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.95, y: 40 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 40 }} className="relative w-full max-w-lg mx-auto bg-white rounded-2xl shadow-2xl p-6 sm:p-8 border border-gray-200 max-h-[90vh] overflow-y-auto">
              <button onClick={() => setSelectedOrder(null)} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 bg-white bg-opacity-70 rounded-full p-2 shadow">×</button>
              <h2 className="text-2xl font-bold mb-2 text-indigo-700 text-center">{selectedOrder.items?.[0]?.name || 'Order'}</h2>
              <div className="text-center mb-4">
                <div className="text-sm font-semibold text-indigo-600">Order ID: {selectedOrder.customOrderId || selectedOrder._id}</div>
                {selectedOrder.customOrderId && (
                  <div className="text-xs text-gray-400 mt-1">Database ID: {selectedOrder._id}</div>
                )}
              </div>

              <div className="space-y-4 text-sm">
                {/* Customer Info */}
                <div className="border-b pb-4"><h4 className="font-semibold mb-2">Customer Information</h4><p><strong>Name:</strong> {selectedOrder.customerName}</p><p><strong>Email:</strong> {selectedOrder.email}</p><p><strong>Phone:</strong> {selectedOrder.phone}</p></div>

                {/* NEW: Scheduled Delivery Section */}
                {selectedOrder.scheduledDelivery && (
                  <div className="border-b pb-4">
                    <h4 className="font-semibold mb-2 flex items-center"><Clock size={16} className="mr-2 text-indigo-500" />Scheduled Delivery</h4>
                    <p className="pl-1 font-bold text-indigo-700">{format(new Date(selectedOrder.scheduledDelivery), "eeee, MMMM d, yyyy 'at' h:mm a")}</p>
                    <p className="pl-1 text-sm text-gray-600 mt-1">
                      {new Date(selectedOrder.scheduledDelivery).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })} at {new Date(selectedOrder.scheduledDelivery).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                      })}
                    </p>
                  </div>
                )}

                {/* Shipping Address with NEW Map Link */}
                <div className="border-b pb-4">
                  <h4 className="font-semibold mb-2">Shipping Address</h4>
                  <p>{selectedOrder.address.street}</p>
                  <p>{selectedOrder.address.city}, {selectedOrder.address.state}, {selectedOrder.address.pincode}</p>
                  {selectedOrder.address.location && selectedOrder.address.location.coordinates && (
                    <a href={`https://www.google.com/maps?q=${selectedOrder.address.location.coordinates[1]},${selectedOrder.address.location.coordinates[0]}`} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800 font-semibold mt-2 inline-flex items-center">
                      <MapPin size={14} className="mr-1" />View on Map
                    </a>
                  )}
                </div>

                {/* Order Items */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center">
                    🛍️ Order Items ({selectedOrder.items.length})
                  </h4>
                  <div className="space-y-2">
                    {selectedOrder.items.map((item, index) => (
                      <div key={index} className="border rounded-lg p-3 bg-blue-50 border-blue-200">
                        <div className="flex justify-between items-start gap-3">
                          <div className="h-16 w-16 flex-shrink-0 rounded-lg bg-white overflow-hidden border border-gray-200">
                            <img
                              src={config.fixImageUrl(item.image)}
                              alt={item.name}
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://placehold.co/100x100?text=No+Img';
                              }}
                            />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{item.name}</p>
                            <p className="text-xs text-gray-600 mt-1">
                              ₹{item.price.toFixed(2)} × {item.quantity}
                            </p>
                            {/* Product ID and Link Section */}
                            {item.productId && (
                              <div className="mt-2 flex items-center space-x-2">
                                <div className="flex items-center space-x-1">
                                  <Hash size={12} className="text-blue-600" />
                                  <span className="text-xs text-blue-600 font-mono">{item.productId}</span>
                                  <button
                                    onClick={() => copyProductId(item.productId)}
                                    className="text-blue-600 hover:text-blue-800 transition-colors"
                                    title="Copy Product ID"
                                  >
                                    <Copy size={12} />
                                  </button>
                                </div>
                                <a
                                  href={`https://todaymydream.com/product/${item.productId}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 transition-colors"
                                  title="View Product Details"
                                >
                                  <ExternalLink size={12} />
                                </a>
                              </div>
                            )}
                          </div>
                          <span className="font-semibold text-blue-700">
                            ₹{(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}
                    <div className="flex justify-between items-center pt-2 border-t border-blue-200">
                      <span className="font-semibold text-gray-700">Items Total:</span>
                      <span className="font-bold text-blue-600">
                        ₹{selectedOrder.items.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* NEW: Add-Ons Section */}
                {selectedOrder.addOns && selectedOrder.addOns.length > 0 && (
                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-3 flex items-center">
                      <PlusCircle size={18} className="mr-2 text-amber-600" />
                      Add-Ons ({selectedOrder.addOns.length})
                    </h4>
                    <div className="space-y-2">
                      {selectedOrder.addOns.map((addOn, index) => (
                        <div key={index} className="border rounded-lg p-3 bg-amber-50 border-amber-200">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{addOn.name}</p>
                              <p className="text-xs text-gray-600 mt-1">
                                ₹{addOn.price.toFixed(2)} × {addOn.quantity || 1}
                              </p>
                            </div>
                            <span className="font-semibold text-amber-700">
                              ₹{(addOn.price * (addOn.quantity || 1)).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      ))}
                      <div className="flex justify-between items-center pt-2 border-t border-amber-200">
                        <span className="font-semibold text-gray-700">Add-ons Total:</span>
                        <span className="font-bold text-amber-600">
                          ₹{selectedOrder.addOns.reduce((total, addOn) => total + (addOn.price * (addOn.quantity || 1)), 0).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Payment Info */}
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-2">Payment Information</h4>
                  <p><strong>Method:</strong> {selectedOrder.paymentMethod?.toUpperCase()}</p>
                  <p><strong>Status:</strong> {selectedOrder.paymentStatus}</p>
                  {selectedOrder.paymentMethod === 'cod' && selectedOrder.upfrontAmount > 0 && (
                    <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs"><p className="text-blue-800 font-medium">COD Breakdown:</p><p className="text-blue-700">✅ Upfront Paid: ₹{selectedOrder.upfrontAmount}</p><p className="text-blue-700">💰 On Delivery: ₹{selectedOrder.remainingAmount}</p></div>
                  )}
                </div>

                <div className="flex justify-end pt-4 border-t mt-4">
                  <p className="text-lg font-bold">Total Amount: ₹{selectedOrder.totalAmount}</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Orders;