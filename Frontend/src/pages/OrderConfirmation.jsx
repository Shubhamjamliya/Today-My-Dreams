import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle, ShoppingBag, Truck, Clock, MapPin, PlusCircle } from 'lucide-react';
import config from '../config/config';
import Loader from '../components/Loader';
import { format } from 'date-fns'; // Using date-fns for better formatting

const OrderConfirmation = () => {
  const { id } = useParams();
  const location = useLocation();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (location.state?.order) {
      setOrder(location.state.order);
      setLoading(false);
      return;
    }

    const fetchOrder = async () => {
      try {
        const response = await axios.get(`${config.API_URLS.ORDERS}/${id}`);
        // FIX: The order object is nested inside the response data
        if (response.data && response.data.order) {
          setOrder(response.data.order);
        } else {
          throw new Error("Order data not found in API response.");
        }
      } catch (err) {
        setError('Failed to fetch order details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id, location.state]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><Loader size="large" text="Loading your confirmation..." /></div>;
  }

  if (error) {
    return <div className="text-center py-20 text-red-500"><p>{error}</p><Link to="/" className="text-blue-600 hover:underline mt-4 inline-block">Go to Homepage</Link></div>;
  }

  if (!order) {
    return <div className="text-center py-20"><p>No order found.</p><Link to="/" className="text-blue-600 hover:underline mt-4 inline-block">Go to Homepage</Link></div>;
  }

  // FIX: Use `order.items` instead of `order.products`
  const itemsTotal = order.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const addonsTotal = order.addOns?.reduce((acc, addOn) => acc + (addOn.price * (addOn.quantity || 1)), 0) || 0;
  const subtotal = itemsTotal + addonsTotal;

  return (
    <div className="bg-gray-50 min-h-screen py-12 md:py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-6 md:p-10 border border-gray-100">

          <div className="text-center mb-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800">Thank you, {order.customerName}!</h1>
            <p className="text-gray-600 mt-2">Your order has been placed successfully.</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-8 text-center">
            {/* FIX: Use custom order ID */}
            <p className="text-gray-600">Order ID: <span className="font-semibold text-gray-800">{order.customOrderId || order._id}</span></p>
            {order.customOrderId && (
              <p className="text-gray-500 text-xs mt-1">Database ID: {order._id}</p>
            )}
            <p className="text-gray-600 text-sm mt-2">Placed on: {format(new Date(order.createdAt), 'd/MM/yyyy h:mm a')}</p>
          </div>

          <div className="space-y-8">
            {/* ENHANCEMENT: Show scheduled delivery if it exists */}
            {order.scheduledDelivery && (
              <div>
                <h2 className="text-xl font-semibold text-gray-800 flex items-center mb-4">
                  <Clock className="w-6 h-6 mr-3 text-gray-500" />
                  Scheduled Delivery
                </h2>
                <div className="bg-blue-50 rounded-lg p-4 text-blue-800">
                  <p className="font-semibold">{format(new Date(order.scheduledDelivery), "eeee, MMMM d, yyyy 'at' h:mm a")}</p>
                </div>
              </div>
            )}

            {/* Order Summary */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 flex items-center mb-4">
                <ShoppingBag className="w-6 h-6 mr-3 text-gray-500" />
                Order Summary
              </h2>
              <div className="space-y-4">
                {/* FIX: Map over `order.items` */}
                {order.items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between pb-4 border-b last:border-b-0">
                    <div className="flex items-center">
                      <img
                        src={config.fixImageUrl(item.image)}
                        alt={item.name}
                        className="w-16 h-16 rounded-lg object-cover mr-4"
                      />
                      <div>
                        <p className="font-semibold text-gray-800">{item.name}</p>
                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <p className="font-semibold text-gray-800">₹{item.price.toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ENHANCEMENT: Show Add-Ons if they exist */}
            {order.addOns && order.addOns.length > 0 && (
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold text-gray-700 flex items-center mb-3">
                  <PlusCircle className="w-5 h-5 mr-2 text-gray-400" />
                  Add-Ons
                </h3>
                <div className="space-y-2">
                  {order.addOns.map((addOn, index) => (
                    <div key={index} className="flex items-center justify-between pb-3 border-b last:border-b-0">
                      <div>
                        <p className="font-semibold text-gray-800">{addOn.name}</p>
                        <p className="text-sm text-gray-500">₹{addOn.price.toFixed(2)}{addOn.quantity && addOn.quantity > 1 ? ` × ${addOn.quantity}` : ''}</p>
                      </div>
                      <p className="font-semibold text-gray-800">₹{(addOn.price * (addOn.quantity || 1)).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Totals */}
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              {/* FIX: `totalAmount` already includes all charges */}
              <div className="flex justify-between font-bold text-xl text-gray-800 pt-2 border-t">
                <span>Total Amount</span>
                <span>₹{order.totalAmount.toFixed(2)}</span>
              </div>
            </div>

            {/* Shipping Information */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 flex items-center mb-4">
                <Truck className="w-6 h-6 mr-3 text-gray-500" />
                Shipping To
              </h2>
              <div className="bg-gray-50 rounded-lg p-4 text-gray-700">
                {/* FIX: Use correct address structure */}
                <p className="font-semibold">{order.customerName}</p>
                <p>{order.address.street}</p>
                <p>{order.address.pincode}</p>
                <p>{order.address.country}</p>
                {/* ENHANCEMENT: Add map link */}
                {order.address.location && order.address.location.coordinates && (
                  <a href={`https://www.google.com/maps?q=${order.address.location.coordinates[1]},${order.address.location.coordinates[0]}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm font-semibold mt-2 inline-flex items-center">
                    <MapPin size={14} className="mr-1" />View on Map
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className="text-center mt-10">
            <Link to="/shop" className="bg-gray-800 text-white px-8 py-3 rounded-lg hover:bg-gray-900 transition-colors">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;