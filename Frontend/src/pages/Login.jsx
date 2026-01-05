import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { useGoogleLogin } from '@react-oauth/google';

const Login = () => {
  const navigate = useNavigate();
  const { login, loginWithGoogle, error: contextError } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Handler for traditional form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    let identifier = formData.identifier;
    if (/^\d{10}$/.test(identifier)) {
      identifier = '91' + identifier;
    }
    const loginData = { ...formData, identifier };
    try {
      await login(loginData);
      toast.success('Welcome back to TodayMyDream!');
      navigate('/');
      window.location.reload();
    } catch (err) {
      setError(err.message || contextError || 'Failed to login');
    } finally {
      setIsLoading(false);
    }
  };

  // Handler for input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Google Login Component
  const GoogleLoginButton = ({ onLoginSuccess, onError }) => {
    const [isLoading, setIsLoading] = useState(false);

    const loginHook = useGoogleLogin({
      onSuccess: async (tokenResponse) => {
        setIsLoading(true);
        try {
          await onLoginSuccess(tokenResponse);
        } catch (err) {
          onError(err);
        } finally {
          setIsLoading(false);
        }
      },
      onError: () => {
        onError(new Error('Google login failed'));
      },
      flow: 'implicit',
    });

    return (
      <button
        type="button"
        onClick={() => loginHook()}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-3 py-3.5 px-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FCD24C] transition-all duration-200"
      >
        {isLoading ? (
          <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
        ) : (
          <>
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
            <span className="text-gray-700 font-medium">Sign in with Google</span>
          </>
        )}
      </button>
    );
  };

  const isGoogleConfigured = !!import.meta.env.VITE_GOOGLE_CLIENT_ID;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 p-4 lg:p-8">
      <div className="w-full max-w-6xl h-full min-h-[600px] bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col lg:flex-row shadow-orange-100/50">

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
              {/* Increased Logo Size */}
              <img src="/TodayMyDream.png" alt="TodayMyDream Logo" className="w-32 h-auto object-contain drop-shadow-md" />
            </div>
            <h1 className="text-5xl font-bold leading-tight mb-6 tracking-tight">
              Turn Your <br />
              <span className="text-white opacity-90 italic font-serif">Dream Events</span> <br />
              Into Reality
            </h1>
            <p className="text-lg text-yellow-50 max-w-md leading-relaxed">
              Join our community to discover the best decorations, plan unforgettable moments, and bring your vision to life.
            </p>
          </div>

          <div className="relative z-10 flex items-center gap-4 text-sm font-medium text-yellow-100/80">
            <span>© 2024 TodayMyDream</span>
            <span className="w-1 h-1 rounded-full bg-yellow-100/50" />
            <span>Privacy Policy</span>
            <span className="w-1 h-1 rounded-full bg-yellow-100/50" />
            <span>Terms</span>
          </div>
        </motion.div>

        {/* Right Side - Login Form */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center p-8 sm:p-12 lg:p-16 bg-white relative">

          <div className="max-w-md w-full mx-auto">
            {/* Mobile Logo */}
            <div className="lg:hidden flex justify-center mb-8">
              <img src="/TodayMyDream.png" alt="TodayMyDream Logo" className="w-24 h-auto" />
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
              <p className="text-gray-500 mb-8">Please enter your details to sign in.</p>

              {error && (
                <div className="mb-6 bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                  <div className="w-1 h-4 bg-red-500 rounded-full" />
                  {error}
                </div>
              )}

              {isGoogleConfigured && (
                <div className="mb-8">
                  <GoogleLoginButton
                    onLoginSuccess={async (tokenResponse) => {
                      await loginWithGoogle(tokenResponse.access_token);
                      toast.success('Successfully logged in with Google!');
                      navigate('/');
                      window.location.reload();
                    }}
                    onError={(err) => {
                      setError(err.message || 'Google login failed');
                      toast.error('Google login failed');
                    }}
                  />
                  <div className="relative flex py-4 items-center">
                    <div className="flex-grow border-t border-gray-100"></div>
                    <span className="flex-shrink mx-4 text-gray-400 text-xs font-medium uppercase tracking-wider">Or continue with</span>
                    <div className="flex-grow border-t border-gray-100"></div>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700 ml-1">Email or Phone</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                      <Mail className="h-5 w-5" />
                    </div>
                    <input
                      name="identifier"
                      type="text"
                      required
                      value={formData.identifier}
                      onChange={handleChange}
                      className="block w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FCD24C] focus:border-transparent focus:bg-white transition-all duration-200"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center ml-1">
                    <label className="text-sm font-semibold text-gray-700">Password</label>
                    <Link to="/forgot-password" className="text-sm font-medium text-[#F59E0B] hover:text-[#d97706] transition-colors">
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                      <Lock className="h-5 w-5" />
                    </div>
                    <input
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={formData.password}
                      onChange={handleChange}
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

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 py-4 px-6 bg-gradient-to-r from-[#FCD24C] to-[#F59E0B] hover:from-[#facc15] hover:to-[#d97706] text-white font-bold rounded-xl shadow-lg shadow-orange-200 hover:shadow-xl transform transition-all duration-200 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed mt-4 text-lg"
                >
                  {isLoading ? (
                    <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Sign In <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-8 text-center">
                <p className="text-gray-500">
                  Don't have an account yet?{' '}
                  <Link to="/signup" className="font-bold text-[#F59E0B] hover:text-[#d97706] transition-colors">
                    Create free account
                  </Link>
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;