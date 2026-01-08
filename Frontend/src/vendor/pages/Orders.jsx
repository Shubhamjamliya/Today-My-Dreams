import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, MapPin, PlusCircle, ExternalLink, Hash, Copy, User, Calendar, ChevronDown, ShoppingBag } from 'lucide-react';
import config from '../../config/config';
// import { TableSkeleton } from '../../admin/components/Skeleton'; // Assuming shared components or copy if needed. Using simplified loading if not available.

function toIST(dateString) {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
}

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingOrder, setUpdatingOrder] = useState(null);
  const [openDropdownId, setOpenDropdownId] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('vendor_token');
      const response = await fetch(`${config.API_BASE_URL}/api/vendor/orders`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include'
      });
      const data = await response.json();
      setOrders(data.orders || []);
      setFilteredOrders(data.orders || []);
    } catch (err) {
      setError('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      setUpdatingOrder(orderId);
      const token = localStorage.getItem('vendor_token');
      const response = await fetch(`${config.API_BASE_URL}/api/vendor/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus }),
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Failed to update status');

      setSuccess(`Order status updated to ${newStatus} successfully!`);
      await fetchOrders();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to update order status');
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
      // Fallback
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

  // Vendor orders should likely follow service statuses as they provide services
  const serviceStatuses = ['processing', 'confirmed', 'service_scheduled', 'service_in_progress', 'service_completed', 'cancelled'];

  const paymentStatusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    pending_upfront: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800'
  };

  if (loading) return (
    <div className="max-w-7xl mx-auto p-4 animate-pulse">
      <div className="flex justify-between items-center mb-6 bg-white p-6 rounded-xl shadow-sm">
        <div className="h-8 w-64 bg-slate-200 rounded-lg"></div>
      </div>
      <div className="space-y-4">
        {[1, 2, 3].map(i => <div key={i} className="h-20 bg-slate-100 rounded-xl"></div>)}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-6">Vendor Orders</h1>
      {success && <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">{success}</div>}
      {error && <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>}

      {/* Mobile Orders View (Cards) */}
      <div className="md:hidden space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-xl text-gray-500 shadow-sm border border-slate-100">
            <ShoppingBag size={48} className="mx-auto text-gray-300 mb-2" />
            <p>No orders found</p>
          </div>
        ) : filteredOrders.map((order) => {
          const firstItem = order.items && order.items[0];
          const orderName = firstItem?.name || 'Order';
          const currentStatus = order.status || order.orderStatus || 'pending';

          return (
            <div key={order._id} className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 flex flex-col gap-4 w-full relative">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Calendar size={14} className="text-slate-400" />
                  {new Date(order.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
                <span className="text-xs font-mono font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded">
                  #{order.customOrderId?.slice(-6) || order._id.slice(-6)}
                </span>
              </div>

              <div className="min-w-0">
                <h3 className="font-bold text-slate-900 text-lg leading-tight mb-1 line-clamp-2 break-words text-ellipsis">{orderName}</h3>
                <div className="flex items-center gap-2 text-sm text-slate-600 truncate">
                  <User size={14} className="shrink-0" /> <span className="truncate">{order.customerName}</span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs text-slate-400">{order.items?.length || 1} Items</span>
                  {order.scheduledDelivery && (
                    <div className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                      <Clock size={12} />
                      {format(new Date(order.scheduledDelivery), "MMM d")}
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t border-slate-50 pt-3 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wide">Total</p>
                  <p className="font-bold text-slate-900 text-xl">₹{order.totalAmount}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${statusColors[currentStatus] || 'bg-gray-100'}`}>
                  {currentStatus.replace('_', ' ')}
                </span>
              </div>

              <div className="flex flex-col gap-3 mt-2">
                <button
                  onClick={() => setSelectedOrder(order)}
                  className="w-full bg-white text-slate-700 font-semibold py-3 rounded-lg text-sm border border-slate-200 hover:bg-slate-50 transition-colors"
                >
                  View Details
                </button>
                <div className="relative w-full z-10">
                  <button
                    onClick={() => setOpenDropdownId(openDropdownId === order._id ? null : order._id)}
                    disabled={updatingOrder === order._id}
                    className="w-full bg-[#FCD24C] text-slate-900 font-bold py-3 rounded-lg text-sm flex items-center justify-center gap-2 hover:bg-[#eec12b] transition-colors disabled:opacity-50"
                  >
                    {currentStatus.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                    <ChevronDown size={16} className={`transition-transform duration-200 ${openDropdownId === order._id ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {openDropdownId === order._id && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-xl shadow-2xl border border-slate-100 overflow-hidden z-50 max-h-60 overflow-y-auto"
                      >
                        {serviceStatuses.map(s => (
                          <button
                            key={s}
                            onClick={() => {
                              updateOrderStatus(order._id, s);
                              setOpenDropdownId(null);
                            }}
                            className={`w-full text-left px-4 py-3 text-sm font-bold transition-colors border-b border-slate-50 last:border-none ${currentStatus === s ? 'bg-[#FCD24C]/20 text-slate-900' : 'text-slate-600 hover:bg-slate-50'
                              }`}
                          >
                            {s.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop Orders List (Table) */}
      <div className="bg-white rounded-lg shadow overflow-x-auto hidden md:block">
        <div className="w-full" style={{ minWidth: '1000px' }}>
          <table className="w-full min-w-full divide-y divide-gray-200 text-xs sm:text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase">Image</th>
                <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order Name</th>
                <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase">Schedule</th>
                <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
                <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.length === 0 ? (
                <tr><td colSpan="9" className="p-4 text-center text-gray-500">No orders found</td></tr>
              ) : filteredOrders.map((order) => {
                const firstItem = order.items && order.items[0];
                const orderName = firstItem?.name || 'Order';
                const currentStatus = order.status || order.orderStatus || 'pending'; // Fallback

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
                    </td>
                    <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>{order.customerName}</div>
                      <div className="text-xs text-gray-400">{order.phone}</div>
                    </td>
                    <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-500">{toIST(order.createdAt)}</td>
                    <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.scheduledDelivery ? (
                        <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          <Clock size={14} className="mr-1" />
                          {format(new Date(order.scheduledDelivery), "MMM d, h:mm a")}
                        </div>
                      ) : <span>N/A</span>}
                    </td>
                    <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-900">₹{order.totalAmount}</td>
                    <td className="px-2 py-4 whitespace-nowrap">
                      {/* Vendor might not have permission to change all statuses, but assuming they can */}
                      <select
                        value={currentStatus}
                        onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                        disabled={updatingOrder === order._id}
                        className={`text-sm rounded-full px-3 py-1 font-semibold ${statusColors[currentStatus] || 'bg-gray-100'} ${updatingOrder === order._id ? 'opacity-50' : ''}`}
                      >
                        {serviceStatuses.map((status) => (<option key={status} value={status}>{status.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</option>))}
                      </select>
                    </td>
                    <td className="px-2 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${paymentStatusColors[order.paymentStatus] || 'bg-gray-100'}`}>{order.paymentStatus}</span>
                    </td>
                    <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button onClick={() => setSelectedOrder(order)} className="text-indigo-600 hover:text-indigo-900 font-medium">View Details</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal - Copied from Admin */}
      <AnimatePresence>
        {selectedOrder && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.95, y: 40 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 40 }} className="relative w-full max-w-lg mx-auto bg-white rounded-2xl shadow-2xl p-6 sm:p-8 border border-gray-200 max-h-[90vh] overflow-y-auto">
              <button onClick={() => setSelectedOrder(null)} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 bg-white bg-opacity-70 rounded-full p-2 shadow">×</button>
              <h2 className="text-2xl font-bold mb-2 text-indigo-700 text-center">{selectedOrder.items?.[0]?.name || 'Order'}</h2>
              <div className="text-center mb-4">
                <div className="text-sm font-semibold text-indigo-600">Order ID: {selectedOrder.customOrderId || selectedOrder._id}</div>
              </div>

              <div className="space-y-4 text-sm">
                <div className="border-b pb-4"><h4 className="font-semibold mb-2">Customer Information</h4><p><strong>Name:</strong> {selectedOrder.customerName}</p><p><strong>Email:</strong> {selectedOrder.email}</p><p><strong>Phone:</strong> {selectedOrder.phone}</p></div>

                {selectedOrder.scheduledDelivery && (
                  <div className="border-b pb-4">
                    <h4 className="font-semibold mb-2 flex items-center"><Clock size={16} className="mr-2 text-indigo-500" />Scheduled Delivery</h4>
                    <p className="pl-1 font-bold text-indigo-700">{format(new Date(selectedOrder.scheduledDelivery), "eeee, MMMM d, yyyy 'at' h:mm a")}</p>
                  </div>
                )}

                <div className="border-b pb-4">
                  <h4 className="font-semibold mb-2">Shipping Address</h4>
                  <p>{selectedOrder.address?.street}</p>
                  <p>{selectedOrder.address?.city}, {selectedOrder.address?.state}, {selectedOrder.address?.pincode}</p>
                  {selectedOrder.address?.location?.coordinates && (
                    <a href={`https://www.google.com/maps?q=${selectedOrder.address.location.coordinates[1]},${selectedOrder.address.location.coordinates[0]}`} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800 font-semibold mt-2 inline-flex items-center">
                      <MapPin size={14} className="mr-1" />View on Map
                    </a>
                  )}
                </div>

                <div>
                  <h4 className="font-semibold mb-3 flex items-center">
                    🛍️ Order Items ({selectedOrder.items?.length || 0})
                  </h4>
                  <div className="space-y-2">
                    {selectedOrder.items?.map((item, index) => (
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
                            <p className="text-xs text-gray-600 mt-1">₹{item.price?.toFixed(2)} × {item.quantity}</p>
                            {item.productId && (
                              <div className="mt-2 flex items-center space-x-2">
                                <span className="text-xs text-blue-600 font-mono">ID: {item.productId}</span>
                                <button onClick={() => copyProductId(item.productId)} className="text-blue-600"><Copy size={12} /></button>
                              </div>
                            )}
                          </div>
                          <span className="font-semibold text-blue-700">₹{((item.price || 0) * (item.quantity || 1)).toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Add-Ons Section */}
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
                    </div>
                  </div>
                )}

                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-2">Payment Information</h4>
                  <p><strong>Method:</strong> {selectedOrder.paymentMethod?.toUpperCase()}</p>
                  <p><strong>Status:</strong> {selectedOrder.paymentStatus}</p>
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

