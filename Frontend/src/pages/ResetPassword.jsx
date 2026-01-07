import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import config from '../config/config';

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
      toast.error("Passwords don't match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.put(`${config.API_BASE_URL}/api/auth/reset-password/${token}`, { password });
      setMessage(res.data.message);
      toast.success(res.data.message);

      // Delay redirect
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Something went wrong or token expired';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center lg:bg-gradient-to-br lg:from-yellow-50 lg:via-amber-50 lg:to-orange-50 lg:p-8 bg-white">
      <div className="w-full lg:max-w-6xl h-full min-h-screen lg:min-h-[600px] bg-white lg:rounded-[2.5rem] lg:shadow-2xl overflow-hidden flex flex-col lg:flex-row lg:shadow-orange-100/50">

        {/* Left Side - Brand (Visible on large screens) */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="hidden lg:flex w-1/2 relative bg-gradient-to-br from-[#FCD24C] to-[#F59E0B] p-16 flex-col justify-between text-white overflow-hidden"
        >
          {/* Abstract circles */}
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <div className="absolute top-[-20%] left-[-20%] w-[600px] h-[600px] rounded-full border-[60px] border-white/20 blur-xl" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full bg-white/20 blur-3xl opacity-50" />
            <div className="absolute top-[40%] right-[20%] w-[100px] h-[100px] rounded-full bg-white/30 blur-2xl" />
          </div>

          <div className="relative z-10">
            <div className="bg-white/20 w-fit p-4 rounded-2xl backdrop-blur-md mb-8">
              <img src="/TodayMyDream.png" alt="TodayMyDream Logo" className="w-32 h-auto object-contain drop-shadow-md" />
            </div>
            <h1 className="text-5xl font-bold leading-tight mb-6 tracking-tight">
              Secure Your <br />
              <span className="text-white opacity-90 italic font-serif">Account</span>
            </h1>
            <p className="text-lg text-yellow-50 max-w-md leading-relaxed">
              Create a new, strong password to protect your account and get back to your dream events.
            </p>
          </div>

          <div className="relative z-10 flex items-center gap-4 text-sm font-medium text-yellow-100/80">
            <span>© 2024 TodayMyDream</span>
            <span className="w-1 h-1 rounded-full bg-yellow-100/50" />
            <span>Secure Recovery</span>
          </div>
        </motion.div>

        {/* Right Side - Form */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 py-10 pb-32 sm:p-12 lg:p-16 bg-white relative">
          <div className="max-w-md w-full mx-auto">

            {/* Mobile Logo centered */}
            <div className="lg:hidden flex justify-center mb-8">
              <img src="/TodayMyDream.png" alt="TodayMyDream Logo" className="w-24 h-auto object-contain" />
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Reset Password</h2>
                {!message && (
                  <p className="text-gray-500">Please enter your new password below.</p>
                )}
              </div>

              {message ? (
                <div className="bg-green-50 rounded-2xl p-8 border border-green-100 text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Password Reset!</h3>
                  <p className="text-gray-600 mb-6">Your password has been successfully updated. You can now login with your new credentials.</p>
                  <Link
                    to="/login"
                    className="inline-flex items-center justify-center w-full py-4 bg-[#FCD24C] hover:bg-[#F59E0B] text-white font-bold rounded-xl transition-all shadow-lg shadow-orange-200"
                  >
                    Go to Login
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                      <div className="w-1 h-4 bg-red-500 rounded-full" />
                      {error}
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700 ml-1">New Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                        <Lock className="h-5 w-5" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="block w-full pl-11 pr-11 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FCD24C] focus:border-transparent focus:bg-white transition-all duration-200"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700 ml-1">Confirm Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                        <Lock className="h-5 w-5" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="block w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FCD24C] focus:border-transparent focus:bg-white transition-all duration-200"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-4 px-6 bg-gradient-to-r from-[#FCD24C] to-[#F59E0B] hover:from-[#facc15] hover:to-[#d97706] text-white font-bold rounded-xl shadow-lg shadow-orange-200 hover:shadow-xl transform transition-all duration-200 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed text-lg"
                  >
                    {loading ? (
                      <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        Set New Password <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>

                  <div className="text-center mt-6">
                    <Link to="/login" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-[#F59E0B] transition-colors">
                      <ArrowLeft className="w-4 h-4 mr-1" />
                      Back to Login
                    </Link>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
