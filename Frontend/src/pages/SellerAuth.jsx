import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useSeller } from '../context/SellerContext';
import { toast } from 'react-hot-toast';
import Loader from '../components/Loader';
import { ArrowRight, LogIn, Eye, EyeOff } from 'lucide-react'; // Using consistent Lucide icons

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

export default function SellerAuth() {
  const { seller, login, loading } = useSeller();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (seller) {
      navigate('/dashboard/profile');
    }
  }, [seller, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
        toast.error("Please enter both email and password.");
        return;
    }
    try {
      await login(formData.email, formData.password);
      toast.success('Welcome to your account!');
    } catch (err) {
      const message = err.message || 'An unexpected error occurred.';
      if (message.includes('auth/invalid-credential') || message.includes('auth/wrong-password') || message.includes('auth/user-not-found')) {
        toast.error('Invalid email or password.');
      } else if (message.includes('auth/invalid-email')) {
        toast.error('Please enter a valid email format.');
      } else {
        toast.error('Login failed. Please try again.');
      }
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (loading && !seller) {
    return (
        <div 
            className="min-h-screen flex items-center justify-center bg-amber-50/50"
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23FDE68A' fill-opacity='0.2'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}
        >
            <Loader text="Signing You In..." />
        </div>
    );
  }

  return (
    <div 
        className="min-h-screen flex items-start justify-start lg:justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23FDE68A' fill-opacity='0.2'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}
    >
      <div className="max-w-md w-full mx-auto space-y-8">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="text-center"
        >
          <LogIn className="mx-auto h-12 w-12 text-amber-500" />
          <h2 className="mt-4 text-xl font-bold font-serif text-slate-900 sm:text-5xl">
            Welcome Back, Partner!
          </h2>
          <p className="mt-4 text-xs text-slate-600">
            Sign in to manage your magical offerings.
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          transition={{ delay: 0.2 }}
          className="bg-white py-10 px-6 sm:px-10 shadow-2xl shadow-amber-200/50 rounded-2xl border border-amber-200/60"
        >
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-700">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                id="email"
                autoComplete="email"
                required
                className="mt-1 block w-full px-4 py-3 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-500 transition"
                onChange={handleChange}
                value={formData.email}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-slate-700">
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  id="password"
                  autoComplete="current-password"
                  required
                  className="block w-full px-4 py-3 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-500 transition pr-10"
                  onChange={handleChange}
                  value={formData.password}
                />
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                    tabIndex={-1}
                >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="pt-2">
                <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-lg text-base font-semibold text-white bg-amber-500 hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-400 transition-all"
                >
                    {loading ? (
                        <span className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            Signing In...
                        </span>
                    ) : (
                        <span className="flex items-center">
                            Sign In
                            <ArrowRight className="w-5 h-5 ml-2" />
                        </span>
                    )}
                </motion.button>
            </div>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-slate-600">
              New to our platform?{' '}
              <button
                onClick={() => navigate('/dashboard')}
                className="text-amber-600 hover:text-amber-700 font-semibold focus:outline-none focus:underline"
              >
                Register here
              </button>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}