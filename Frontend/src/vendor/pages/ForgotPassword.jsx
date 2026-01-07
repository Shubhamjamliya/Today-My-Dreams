import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import config from '../../config/config';
import { User, ArrowLeft } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);

    try {
      const res = await axios.post(`${config.API_BASE_URL}/api/vendor/auth/forgot-password`, { email });
      setMessage(res.data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
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
            <h2 className="text-2xl font-bold text-gray-900">Forgot Password</h2>
            <p className="text-gray-800 text-sm mt-1">Enter your email to reset password</p>
          </div>
          <div className="px-8 py-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {message && (
                <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl">
                  {message}
                </div>
              )}
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700">Email Address</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    id="email"
                    type="email"
                    placeholder="Enter your registered email"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FCD24C] focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-4 rounded-xl text-gray-900 font-bold text-lg shadow-lg transform transition-all duration-200 active:scale-95 ${loading
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-gradient-to-r from-[#FCD24C] to-[#F59E0B] hover:shadow-xl hover:-translate-y-0.5'
                  }`}
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
            <div className="text-center mt-6">
              <Link to="/vendor/login" className="flex items-center justify-center text-gray-600 hover:text-gray-900 font-semibold transition-colors">
                <ArrowLeft size={16} className="mr-2" />
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
