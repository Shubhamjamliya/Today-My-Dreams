import React, { useState, useEffect, useMemo } from 'react';
import { useVendorAuth } from '../context/VendorAuthContext';
import { Link } from 'react-router-dom';
import config from '../../config/config';
import { ShoppingBag, MapPin, List, Activity, User, Mail, Phone, TrendingUp, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const StatCard = ({ title, value, icon: Icon, color, subValue }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-all duration-200">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
        {subValue && <p className="text-xs text-slate-400 mt-1">{subValue}</p>}
      </div>
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon size={24} className="text-white" />
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const { vendor } = useVendorAuth();
  const [stats, setStats] = useState({
    orders: 0,
    revenue: 0,
    pending: 0,
    myOrders: 0,
    chartData: [],
    upcoming: []
  });

  // Simulator for stats - typically you'd fetch this
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('vendor_token');
        if (!token) return;

        const res = await fetch(`${config.API_BASE_URL}/api/vendor/orders/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();

        if (data.success) {
          setStats(data.stats);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard stats", error);
      }
    };

    fetchStats();
  }, []);

  const chartData = useMemo(() => {
    // Prepare last 7 days data
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];

      // Find data for this day
      const found = stats.chartData?.find(item => item._id === dateStr);

      days.push({
        name: d.toLocaleDateString('en-US', { weekday: 'short' }),
        date: dateStr,
        orders: found ? found.orders : 0,
        revenue: found ? found.revenue : 0
      });
    }
    return days;
  }, [stats.chartData]);

  return (
    <div className="space-y-8">
      {/* NEW: Profile Card */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl shadow-lg p-6 relative overflow-hidden text-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#FCD24C] opacity-10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-slate-700 flex items-center justify-center border-4 border-slate-600 shadow-xl shrink-0">
            <span className="text-3xl font-bold text-[#FCD24C]">{vendor?.name ? vendor.name.charAt(0).toUpperCase() : <User size={32} />}</span>
          </div>
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl font-bold text-white mb-1 flex items-center justify-center md:justify-start gap-2">
              {vendor?.name}
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-medium border border-emerald-500/30">
                {vendor?.status || 'Active'}
              </span>
            </h2>
            <p className="text-slate-400 text-sm mb-3">Today My Dream Partner</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-x-6 gap-y-2 text-sm text-slate-300">
              <span className="flex items-center gap-2"><Mail size={14} className="text-[#FCD24C]" /> {vendor?.email}</span>
              {vendor?.phone && <span className="flex items-center gap-2"><Phone size={14} className="text-[#FCD24C]" /> {vendor?.phone}</span>}
            </div>
          </div>
          <div className="md:border-l md:border-slate-700 md:pl-6 flex flex-col items-center md:items-end gap-2 min-w-[140px]">
            <div className="text-center md:text-right">
              <p className="text-xs text-slate-400">Total Revenue</p>
              <p className="text-xl font-bold text-[#FCD24C]">₹{stats.revenue?.toLocaleString() || '0'}</p>
            </div>
            <Link to="/vendor/profile" className="text-xs text-white underline hover:text-[#FCD24C] transition-colors mt-1">
              View Full Profile
            </Link>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 hidden md:block">Welcome back, {vendor?.name || 'Vendor'}</p>
        </div>
        <div className="flex gap-3">
          <Link to="/vendor/orders" className="bg-[#FCD24C] text-slate-900 px-4 py-2 rounded-lg font-semibold hover:bg-[#eec12b] transition-colors flex items-center gap-2 shadow-sm text-sm md:text-base">
            <ShoppingBag size={18} />
            <span className="hidden md:inline">View Orders</span>
            <span className="md:hidden">Orders</span>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Assigned City"
          value={vendor?.cityId?.name || vendor?.cityText || 'N/A'}
          icon={MapPin}
          color="bg-blue-500"
          subValue="Service Area"
        />
        <StatCard
          title="Categories"
          value={Array.isArray(vendor?.categoryIds) ? vendor.categoryIds.length : (vendor?.categoryText ? 1 : 0)}
          icon={List}
          color="bg-indigo-500"
          subValue="Active Services"
        />
        <StatCard
          title="Account Status"
          value={vendor?.status || 'Active'}
          icon={Activity}
          color="bg-emerald-500"
          subValue="Verified Vendor"
        />
        <StatCard
          title="Total Orders"
          value={stats.myOrders || 0}
          icon={ShoppingBag}
          color="bg-orange-500"
          subValue="Assigned to you"
        />
      </div>

      {/* Performance Overview */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp size={20} className="text-slate-400" /> Performance Overview
          </h3>
          <select className="border-slate-200 rounded-lg text-sm text-slate-600 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm py-1.5 pl-3 pr-8">
            <option>Last 7 Days</option>
          </select>
        </div>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#94A3B8', fontSize: 12 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#94A3B8', fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                cursor={{ fill: '#F8FAFC' }}
              />
              <Bar dataKey="orders" fill="#FCD24C" radius={[6, 6, 0, 0]} barSize={40} name="Orders" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-slate-800">Upcoming Schedule</h2>
          <Calendar size={20} className="text-slate-400" />
        </div>
        <div className="space-y-4">
          {stats.upcoming && stats.upcoming.length > 0 ? (
            stats.upcoming.map(order => (
              <div key={order._id} className="p-3 bg-slate-50 rounded-lg flex gap-3 hover:bg-slate-100 transition-colors">
                <div className="w-12 h-12 bg-white rounded-md flex flex-col items-center justify-center font-bold text-slate-700 shadow-sm border border-slate-100 shrink-0">
                  <span className="text-lg leading-none">{new Date(order.scheduledDelivery || order.createdAt).getDate()}</span>
                  <span className="text-[10px] uppercase text-slate-400 font-medium">{new Date(order.scheduledDelivery || order.createdAt).toLocaleDateString('en-US', { month: 'short' })}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <Link to={`/vendor/orders`} className="font-semibold text-slate-800 truncate block hover:text-orange-500 transition-colors text-sm">
                    {order.items?.[0]?.name || 'Service'}
                    <span className="text-slate-400 font-normal ml-1">#{order.customOrderId?.slice(-6) || '...'}</span>
                  </Link>
                  <p className="text-xs text-slate-500 truncate mt-0.5 capitalize">
                    {order.customerName} • <span className={`${order.orderStatus === 'confirmed' ? 'text-green-600' : 'text-blue-600'} font-medium`}>{order.orderStatus?.replace('_', ' ')}</span>
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-slate-400">
              <p className="text-sm">No upcoming orders</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

