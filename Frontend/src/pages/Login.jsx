import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { useGoogleLogin } from '@react-oauth/google';

const Login = () => {
  const navigate = useNavigate();
  const { login, loginWithGoogle, error: contextError } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  // isGoogleLoading will be managed either locally or passed down if needed, 
  // but for simplicity, let the child component verify loading or just manage generic loading.
  // Actually, keeping isGoogleLoading here is fine if I pass setter to child, 
  // but better to keep google logic encapsulated.
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
      toast.success('Welcome to your account!');
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

  // Separate component to safely use the hook
  const GoogleLoginButton = ({ onLoginSuccess, onError }) => {
    const [isLoading, setIsLoading] = useState(false);

    const login = useGoogleLogin({
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
        onClick={() => login()}
        disabled={isLoading}
        className="w-full flex justify-center items-center gap-3 py-3 px-4 border border-gray-300 rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-200 disabled:opacity-50"
      >
        {isLoading ? (
          <span className="flex items-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Signing in...
          </span>
        ) : (
          <>
            <GoogleIcon />
            Sign in with Google
          </>
        )}
      </button>
    );
  };

  const GoogleIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 533.5 544.3">
      <path
        fill="#4285F4"
        d="M533.5 278.4c0-17.4-1.6-34-4.6-50.1H272v95h147.5c-6.3 33.7-25 62.2-53.5 81.4l86.4 67.2c50.6-46.6 81.1-115.3 81.1-193.5z"
      />
      <path
        fill="#34A853"
        d="M272 544.3c72.6 0 133.6-24 178.1-65.2l-86.4-67.2c-24 16-54.7 25.4-91.7 25.4-70.6 0-130.5-47.7-151.9-111.8l-89.5 69c43.5 86.1 133.2 149.8 241.4 149.8z"
      />
      <path
        fill="#FBBC05"
        d="M120.1 325.5c-11.4-33.7-11.4-69.7 0-103.4l-89.5-69C4.8 190.2 0 216.3 0 243.8c0 27.5 4.8 53.6 30.6 90.7l89.5-69z"
      />
      <path
        fill="#EA4335"
        d="M272 107.7c39.7 0 75.2 13.6 103.2 40.2l77.2-77.2C405.6 24 344.6 0 272 0 163.8 0 74.1 63.7 30.6 153.8l89.5 69c21.4-64.1 81.3-115.9 151.9-115.9z"
      />
    </svg>
  );

  const ArtisanCraftSVG = () => (
    <motion.svg width="100%" viewBox="0 0 400 350" initial="hidden" animate="visible" className="max-w-md mx-auto drop-shadow-lg">
      <defs>
        <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="100%" stopColor="#FCD24C" />
        </linearGradient>
        <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
          <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.5 0" result="glow" />
          <feComposite in="glow" in2="SourceGraphic" operator="over" />
        </filter>
      </defs>
      {Array.from({ length: 12 }).map((_, i) => (<motion.path key={i} d="M 200 175 L 350 175" transform={`rotate(${i * 30}, 200, 175)`} stroke="rgba(255, 255, 255, 0.2)" strokeWidth="1" variants={{ hidden: { pathLength: 0, opacity: 0 }, visible: { pathLength: 1, opacity: 1, transition: { duration: 1.5, delay: i * 0.1, ease: "easeInOut" } } }} />))}
      <motion.path d="M 150 300 C 150 250, 120 220, 160 180 C 180 160, 220 160, 240 180 C 280 220, 250 250, 250 300 Z" fill="url(#goldGradient)" stroke="#FFF" strokeWidth="3" filter="url(#softGlow)" variants={{ hidden: { opacity: 0, scale: 0.5 }, visible: { opacity: 1, scale: 1, transition: { duration: 1, delay: 0.5, type: 'spring' } } }} />
      <motion.circle cx="200" cy="120" r="15" fill="rgba(255,255,255,0.8)" variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { delay: 1.5 } } }} />
      <motion.path d="M 120 150 C 150 100, 250 100, 280 150" stroke="rgba(255,255,255,0.5)" fill="transparent" strokeWidth="2" variants={{ hidden: { pathLength: 0 }, visible: { pathLength: 1, transition: { duration: 1, delay: 1 } } }} />
    </motion.svg>
  );

  // Check if Google Login is configured
  const isGoogleConfigured = !!import.meta.env.VITE_GOOGLE_CLIENT_ID;

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="w-full lg:w-1/2 flex items-start lg:items-center justify-start lg:justify-center px-4 sm:px-6 lg:px-8 pt-8 lg:pt-0">
        <div className="max-w-md w-full space-y-6">
          <div>
            <h2 className="text-4xl font-light tracking-tight text-gray-900">
              Welcome <span className="font-serif italic">Back</span>
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/signup" className="font-medium text-primary hover:text-primary-dark">Sign up</Link>
            </p>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          {/* Google Login Button Section */}
          {isGoogleConfigured && (
            <>
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

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-gray-300"></div>
                <span className="flex-shrink mx-4 text-gray-400 text-xs">OR</span>
                <div className="flex-grow border-t border-gray-300"></div>
              </div>
            </>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="identifier" className="block text-sm font-medium text-gray-700">
                  Email or Phone
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="identifier"
                    name="identifier"
                    type="text"
                    autoComplete="username"
                    required
                    value={formData.identifier}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                    placeholder="Enter your email or phone number"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                    placeholder="Enter your password"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-gray-400 hover:text-gray-500 focus:outline-none">
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm">
                <Link to="/forgot-password" className="font-medium text-primary hover:text-primary-dark">
                  Forgot your password?
                </Link>
              </div>
            </div>

            <div>
              <button type="submit" disabled={isLoading} className="group relative w-full flex justify-center py-3 px-4 border border-transparent rounded-xl text-white overflow-hidden  disabled:cursor-not-allowed" style={{ backgroundColor: '#FCD24C', backgroundSize: 'cover', backgroundPosition: 'center' }}>
                <div className="absolute transition-colors duration-300"></div>
                <span className="absolute left-0 inset-y-0 flex items-center pl-3 z-10">
                  <Lock className="h-5 w-5 text-white/80 group-hover:text-white" />
                </span>
                <span className="relative z-10">
                  {isLoading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Signing in...
                    </span>
                  ) : ('Sign in')}
                </span>
              </button>
            </div>
          </form>
        </div>
      </motion.div>

      <div className="lg:hidden w-full bg-gray-50 py-12 px-4">
        <div className="max-w-md mx-auto">
          <h3 className="text-2xl font-semibold text-gray-900 text-center mb-8">
            Why Choose Us?
          </h3>
          <div className="grid grid-cols-2 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="font-medium text-gray-900 mb-1">Reliable</h4>
              <p className="text-sm text-gray-600">Trusted service for years</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h4 className="font-medium text-gray-900 mb-1">Safe</h4>
              <p className="text-sm text-gray-600">Secure transactions</p>
            </div>
          </div>
        </div>
      </div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, ease: 'easeInOut' }} className="hidden lg:flex w-1/2 bg-gradient-to-br from-[#FCD24C] to-[#FBBF24] relative items-center justify-center p-12 flex-col">
        <div className="w-full max-w-lg text-center text-white">
          <ArtisanCraftSVG />
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 1.5, ease: 'easeOut' }}>
            <h2 className="font-display text-4xl font-extrabold mt-8 drop-shadow-md">
              A Canvas of Culture & Craft
            </h2>
            <p className="mt-4 text-lg leading-relaxed opacity-90">
              Log in to continue your journey through a curated world of Best Decoration.
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;