import React, { useState, useEffect } from 'react';
import { useVendorAuth } from '../context/VendorAuthContext';
import { User, Mail, Phone, MapPin, Building, Award, Calendar, CheckCircle, Edit, Star, Shield, Clock, Briefcase, Globe } from 'lucide-react';
import config from '../../config/config';

const Profile = () => {
  const { vendor } = useVendorAuth();
  const [stats, setStats] = useState({
    myOrders: 0,
    revenue: 0
  });

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
        console.error("Failed to fetch profile stats", error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      {/* Profile Header Card */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl shadow-lg p-6 md:p-8 relative overflow-hidden text-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#FCD24C] opacity-10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-slate-700 flex items-center justify-center border-4 border-slate-600 shadow-xl shrink-0">
            <span className="text-3xl font-bold text-[#FCD24C]">{vendor?.name ? vendor.name.charAt(0).toUpperCase() : <User size={40} />}</span>
          </div>

          <div className="flex-1 text-center md:text-left">
            <h1 className="text-2xl font-bold text-white flex flex-col md:flex-row items-center gap-2 md:gap-3 justify-center md:justify-start">
              {vendor?.name}
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
                {vendor?.status || 'Active'}
              </span>
            </h1>
            <p className="text-slate-400 font-medium flex items-center justify-center md:justify-start gap-2 mt-1 mb-4">
              <Briefcase size={16} />
              {vendor?.role || 'Vendor Partner'}
              <span className="text-slate-600">•</span>
              Joined {vendor?.createdAt ? new Date(vendor.createdAt).toLocaleDateString() : 'N/A'}
            </p>

            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm">
              <div className="flex items-center gap-2 text-slate-300 bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-700">
                <Star size={14} className="text-[#FCD24C] fill-[#FCD24C]" />
                <span className="font-bold text-white">4.9</span> Rating
              </div>
              <div className="flex items-center gap-2 text-slate-300 bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-700">
                <Briefcase size={14} className="text-[#FCD24C]" />
                <span className="font-bold text-white">{stats.myOrders || 0}</span> Orders
              </div>
            </div>
          </div>

          <button className="bg-[#FCD24C] text-slate-900 px-4 py-2 rounded-lg font-bold hover:bg-[#eec12b] transition-colors flex items-center gap-2 shrink-0 shadow-lg">
            <Edit size={16} /> Edit Profile
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Contact & Personal */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Shield size={20} className="text-indigo-500" />
              Contact Information
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                  <Mail size={18} />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium">Email Address</p>
                  <p className="text-sm font-semibold text-slate-900 break-all">{vendor?.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-500">
                  <Phone size={18} />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium">Phone Number</p>
                  <p className="text-sm font-semibold text-slate-900">{vendor?.phone || 'Not provided'}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-500">
                  <MapPin size={18} />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium">Service Area</p>
                  <p className="text-sm font-semibold text-slate-900">
                    {vendor?.cityId?.name || vendor?.cityText || 'No city assigned'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Verification</h3>
            <div className="flex items-center gap-3 text-sm text-slate-600 mb-2">
              <CheckCircle size={16} className="text-emerald-500" /> Email Verified
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-600 mb-2">
              <CheckCircle size={16} className="text-emerald-500" /> Phone Verified
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <CheckCircle size={16} className="text-emerald-500" /> Vendor KYB Verified
            </div>
          </div>
        </div>

        {/* Right Column (Wider): Business Details & Categories */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Building size={22} className="text-slate-400" />
                Business Profile
              </h3>
              {/* <span className="text-xs font-mono text-slate-400">ID: {vendor?._id}</span> */}
            </div>

            <div className="mb-8">
              <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">About the Business</h4>
              <p className="text-slate-600 leading-relaxed bg-slate-50 p-6 rounded-xl border border-slate-100">
                {vendor?.description || (
                  <span className="italic text-slate-400">
                    "No detailed description provided yet. We are dedicated to providing the best service to our customers."
                  </span>
                )}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4">Services Offered</h4>
                <div className="flex flex-wrap gap-2">
                  {Array.isArray(vendor?.categoryIds) && vendor.categoryIds.length > 0 ? (
                    vendor.categoryIds.map((cat, index) => (
                      <span key={index} className="inline-flex items-center px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-medium border border-indigo-100 hover:bg-indigo-100 transition-colors cursor-default">
                        <CheckCircle size={14} className="mr-2 opacity-60" />
                        {cat.name || 'Category'}
                      </span>
                    ))
                  ) : (
                    <div className="text-slate-700">
                      {vendor?.categoryText ? (
                        <span className="inline-flex items-center px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-medium border border-indigo-100">
                          {vendor.categoryText}
                        </span>
                      ) : (
                        <p className="text-slate-500 italic">No categories listed.</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4">Performance Metrics</h4>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-600 font-medium">Job Completion Rate</span>
                      <span className="font-bold text-slate-900">98%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div className="bg-emerald-500 h-2 rounded-full shadow-sm" style={{ width: '98%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-600 font-medium">On-Time Arrival</span>
                      <span className="font-bold text-slate-900">94%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div className="bg-[#FCD24C] h-2 rounded-full shadow-sm" style={{ width: '94%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

