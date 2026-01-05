import React, { useState } from 'react';
import { useVendorAuth } from '../context/VendorAuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, User, Phone, MapPin, Layers } from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useVendorAuth();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', cityText: '', categoryText: '' });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await register(form);
    setMessage(res.message || (res.success ? 'Registered successfully. Await approval.' : 'Failed'));
    setLoading(false);

    if (res.success) {
      setTimeout(() => {
        navigate('/vendor/login');
      }, 1500);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-[#FCD24C] to-[#F59E0B] px-8 py-6 text-center">
            <div className="inline-flex items-center justify-center mb-4">
              <img src="/TodayMyDream.png" alt="Today My Dream Logo" className="w-24 h-24 object-contain" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Vendor Registration</h2>
            <p className="text-gray-800 text-sm mt-1">Join and provide services</p>
          </div>
          <div className="px-8 py-8">
            <form className="space-y-6" onSubmit={onSubmit}>
              {message && (
                <div className={`p-4 rounded-xl border ${message.toLowerCase().includes('fail') ? 'bg-red-50 border-red-200 text-red-700' : 'bg-green-50 border-green-200 text-green-700'}`}>
                  <span className="text-sm font-medium">{message}</span>
                </div>
              )}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input name="name" className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FCD24C] focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white" placeholder="Full name" value={form.name} onChange={onChange} required />
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Email</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input name="email" type="email" className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FCD24C] focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white" placeholder="Email address" value={form.email} onChange={onChange} required />
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Phone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input name="phone" className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FCD24C] focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white" placeholder="Phone number" value={form.phone} onChange={onChange} required />
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input name="password" type="password" className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FCD24C] focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white" placeholder="Create password" value={form.password} onChange={onChange} required />
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">City</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input name="cityText" className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FCD24C] focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white" placeholder="City name" value={form.cityText} onChange={onChange} required />
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Service Categories</label>
                <div className="relative">
                  <Layers className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input name="categoryText" className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FCD24C] focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white" placeholder="Comma-separated category names" value={form.categoryText} onChange={onChange} required />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-4 rounded-xl text-gray-900 font-bold text-lg shadow-lg transform transition-all duration-200 active:scale-95 ${loading ? 'bg-gray-300 cursor-not-allowed' : 'bg-gradient-to-r from-[#FCD24C] to-[#F59E0B] hover:shadow-xl hover:-translate-y-0.5'}`}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-6 h-6 border-3 border-gray-900 border-t-transparent rounded-full animate-spin mr-2"></div>
                    Registering...
                  </div>
                ) : (
                  'Register'
                )}
              </button>
            </form>
            <div className="text-center mt-6">
              <p className="text-sm text-gray-500">
                Already registered? <Link to="/vendor/login" className="text-gray-900 font-semibold underline">Login</Link>
              </p>
            </div>
          </div>
        </div>
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">Admin approval required to access panel</p>
        </div>
      </div>
    </div>
  );
};

export default Register;
