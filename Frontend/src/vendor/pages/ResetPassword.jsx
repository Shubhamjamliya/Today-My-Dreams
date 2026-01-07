import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import config from '../../config/config';
import { Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.put(`${config.API_BASE_URL}/api/vendor/auth/reset-password/${token}`, { password });
      setMessage(res.data.message);
      // Optional: redirect after success
      setTimeout(() => {
        navigate('/vendor/login');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong or token expired');
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
            <h2 className="text-2xl font-bold text-gray-900">Reset Password</h2>
            <p className="text-gray-800 text-sm mt-1">Create a new secure password</p>
          </div>
          <div className="px-8 py-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {message && (
                <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl">
                  {message}
                  <p className="text-sm mt-2">Redirecting to login...</p>
                </div>
              )}
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter new password"
                    className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FCD24C] focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Confirm new password"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FCD24C] focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
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
                {loading ? 'Resetting...' : 'Set New Password'}
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

export default ResetPassword;
