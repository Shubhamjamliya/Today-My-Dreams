import { useEffect, useMemo, useState } from 'react';
import { orderAPI } from '../../services/api';
import Loader from '../Loader/Loader';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, MapPin, PlusCircle, Download, FileText } from 'lucide-react';
import { generateInvoicePDF, downloadPDF } from '../../utils/pdfGenerator';
import { toast } from 'react-hot-toast';

const OrderDetailsModal = ({ orderId, onClose }) => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await orderAPI.getOrderById(orderId);
        setOrder(response.data.order);
      } catch (err) {
        setError('Failed to load order details. Please try again later.');
        // Error fetching order details
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  // Calculate subtotal and delivery fee
  const { itemsSubtotal, deliveryFee } = useMemo(() => {
    if (!order) return { itemsSubtotal: 0, deliveryFee: 0 };

    // Calculate the sum of all items and add-ons
    const itemsTotal = order.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const addOnsTotal = order.addOns?.reduce((acc, addOn) => acc + (addOn.price * (addOn.quantity || 1)), 0) || 0;
    
    const subtotal = itemsTotal + addOnsTotal;

    // The delivery fee is the difference, but it can't be negative
    const fee = order.totalAmount - subtotal;
    
    return {
      itemsSubtotal: subtotal,
      deliveryFee: fee > 0 ? fee : 0,
    };
  }, [order]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Kolkata'
    });
  };
  
  const formatScheduledDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Kolkata'
    });
  };

  const getStatusColor = (status) => {
    const statusColors = {
      processing: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      manufacturing: 'bg-purple-100 text-purple-800',
      shipped: 'bg-indigo-100 text-indigo-800',
      delivered: 'bg-green-100 text-green-800'
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPaymentStatusColor = (status) => {
    const statusColors = {
      pending: 'bg-yellow-100 text-yellow-800',
      pending_upfront: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800'
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  };

  const handleDownloadInvoice = async () => {
    if (!order?._id) return;
    
    setDownloading(true);
    try {
      const pdf = await generateInvoicePDF(order);
      downloadPDF(pdf, `invoice-${order._id}.pdf`);
      toast.success('Invoice downloaded successfully!');
    } catch (error) {
      // Error downloading invoice
      toast.error('Failed to download invoice. Please try again.');
    } finally {
      setDownloading(false);
    }
  };
  
  const handleDownloadBill = async () => {
    if (!order?._id) return;
    
    setDownloading(true);
    try {
      const pdf = await generateInvoicePDF(order);
      downloadPDF(pdf, `bill-${order._id}.pdf`);
      toast.success('Bill downloaded successfully!');
    } catch (error) {
      // Error downloading bill
      toast.error('Failed to download bill. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4"
      >
        <motion.div
          initial={{ scale: 0.95, y: 40 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 40 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl bg-white/70 backdrop-blur-lg border border-white/30"
        >
          <div className="sticky top-0 bg-white/80 backdrop-blur border-b border-gray-200 px-6 py-4 flex justify-between items-center rounded-t-3xl z-10">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Order Details</h2>
            <button
              onClick={onClose}
              className="group p-2 rounded-full hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-pink"
              aria-label="Close order details"
            >
              <svg className="w-6 h-6 text-gray-500 group-hover:text-brand-pink transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="p-6 sm:p-8">
            {loading ? (
              <div className="flex justify-center items-center h-64"><Loader /></div>
            ) : error ? (
              <div className="text-center text-red-600 py-8">{error}</div>
            ) : order ? (
              <div className="space-y-8">
                {/* Order Status and Date */}
                <div className="flex flex-wrap justify-between items-start gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Order ID</p>
                    <p className="font-mono text-sm text-pink-700 font-bold">{order.customOrderId || order._id}</p>
                    {order.customOrderId && (
                      <p className="font-mono text-xs text-gray-400 mt-1"> ID: {order._id}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Order Placed On</p>
                    <p className="font-medium text-gray-800">{formatDate(order.createdAt)}</p>
                  </div>
                </div>

                {/* Status Badges */}
                <div className="flex flex-wrap gap-4">
                  <span className={`px-4 py-1 rounded-full text-sm font-semibold shadow-sm border ${getStatusColor(order.orderStatus)}`}> 
                    <span className="inline-block w-2 h-2 rounded-full mr-2 align-middle bg-current opacity-60"></span>
                    {order.orderStatus?.charAt(0).toUpperCase() + order.orderStatus?.slice(1)}
                  </span>
                  <span className={`px-4 py-1 rounded-full text-sm font-semibold shadow-sm border ${getPaymentStatusColor(order.paymentStatus)}`}>
                    <span className="inline-block w-2 h-2 rounded-full mr-2 align-middle bg-current opacity-60"></span>
                    Payment: {order.paymentStatus === 'pending_upfront' ? 'Upfront Paid' : order.paymentStatus?.charAt(0).toUpperCase() + order.paymentStatus?.slice(1)}
                  </span>
                </div>

                {/* Scheduled Delivery */}
                {order.scheduledDelivery && (
                  <div className="border-t border-gray-200 pt-6">
                      <h3 className="font-semibold text-gray-900 mb-2 text-lg flex items-center gap-2">
                          <Clock className="text-brand-pink" size={20} />
                          Scheduled Delivery
                      </h3>
                      <p className="font-bold text-gray-800 text-base pl-8">
                          {formatScheduledDate(order.scheduledDelivery)}
                      </p>
                  </div>
                )}

                {/* Customer Details */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="font-semibold text-gray-900 mb-3 text-lg">Customer Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div><p className="text-xs text-gray-500">Name</p><p className="font-medium text-gray-800">{order.customerName}</p></div>
                    <div><p className="text-xs text-gray-500">Email</p><p className="font-medium text-gray-800">{order.email}</p></div>
                    <div><p className="text-xs text-gray-500">Phone</p><p className="font-medium text-gray-800">{order.phone}</p></div>
                    <div><p className="text-xs text-gray-500">Payment Method</p><p className="font-medium text-gray-800">{order.paymentMethod?.toUpperCase()}</p></div>
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="font-semibold text-gray-900 mb-2 text-lg">Shipping Address</h3>
                  <p className="text-gray-700 text-base leading-relaxed">
                    {order.address.street}<br />
                    {order.address.pincode}<br />
                    {order.address.country}
                  </p>
                  {order.address.location && order.address.location.coordinates && (
                      <a
                          href={`https://www.google.com/maps?q=${order.address.location.coordinates[1]},${order.address.location.coordinates[0]}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-brand-pink hover:text-pink-800 transition-colors"
                      >
                          <MapPin size={16} />
                          View on Map
                      </a>
                  )}
                </div>

                {/* Order Items */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="font-semibold text-gray-900 mb-4 text-lg">Order Items</h3>
                  <div className="space-y-4">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0 gap-4">
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          {item.image && (<img src={item.image} alt={item.name} className="w-14 h-14 object-cover rounded-xl border border-gray-200 shadow-sm" />)}
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 truncate">{item.name}</p>
                            <p className="text-xs text-gray-500">Quantity: {item.quantity}</p>
                          </div>
                        </div>
                        <p className="font-semibold text-lg text-pink-700 whitespace-nowrap">₹{item.price.toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Add-Ons */}
                {order.addOns && order.addOns.length > 0 && (
                  <div className="border-t border-gray-200 pt-6">
                      <h3 className="font-semibold text-gray-900 mb-4 text-lg flex items-center gap-2">
                          <PlusCircle className="text-brand-pink" size={20} />
                          Add-Ons
                      </h3>
                      <div className="space-y-3">
                          {order.addOns.map((addOn, index) => (
                              <div key={index} className="flex justify-between items-center py-2 pl-4">
                                  <div>
                                      <p className="text-gray-900 font-medium">{addOn.name}</p>
                                      <p className="text-xs text-gray-500">₹{addOn.price.toFixed(2)}{addOn.quantity && addOn.quantity > 1 ? ` × ${addOn.quantity}` : ''}</p>
                                  </div>
                                  <p className="font-semibold text-pink-700">₹{(addOn.price * (addOn.quantity || 1)).toFixed(2)}</p>
                              </div>
                          ))}
                      </div>
                  </div>
                )}

                {/* Order Total with breakdown */}
                <div className="border-t border-gray-200 pt-6 space-y-3">
                  {/* Subtotal */}
                  <div className="flex justify-between items-center text-md">
                    <p className="text-gray-600">Subtotal</p>
                    <p className="font-medium text-gray-800">₹{itemsSubtotal.toFixed(2)}</p>
                  </div>

                  {/* Delivery Fee - only shows if it's greater than 0 */}
                  {deliveryFee > 0 && (
                     <div className="flex justify-between items-center text-md">
                      <p className="text-gray-600">Delivery Fee</p>
                      <p className="font-medium text-gray-800">₹{deliveryFee.toFixed(2)}</p>
                    </div>
                  )}
                 
                  {/* Grand Total */}
                  <div className="flex justify-between items-center pt-3 border-t border-dashed">
                    <p className="font-semibold text-gray-900 text-lg">Total Amount</p>
                    <p className="text-2xl font-bold text-pink-700">₹{order.totalAmount.toFixed(2)}</p>
                  </div>
                </div>

                {/* Download Buttons */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="font-semibold text-gray-900 mb-4 text-lg flex items-center gap-2">
                    <FileText className="text-brand-pink" size={20} />
                    Download Documents
                  </h3>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleDownloadInvoice}
                      disabled={downloading}
                      className="flex items-center justify-center gap-2 px-6 py-3 bg-brand-pink hover:bg-brand-pink disabled:bg-pink-300 text-white rounded-lg font-semibold transition-colors shadow-md hover:shadow-lg disabled:cursor-not-allowed"
                    >
                      <Download size={18} />
                      {downloading ? 'Downloading...' : 'Download Invoice'}
                    </motion.button>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Download your order invoice and bill as PDF documents
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">No order details found.</div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default OrderDetailsModal;