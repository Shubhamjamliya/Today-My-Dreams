import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Phone } from 'lucide-react';
import toast from 'react-hot-toast';
import config from '../config/config';
// New: Import the hooks for Google login and Auth context
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';

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


const Signup = () => {
    const navigate = useNavigate();
    // New: Get the loginWithGoogle function from your AuthContext
    const { loginWithGoogle } = useAuth();

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    // New: State for Google-specific loading
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const [phone, setPhone] = useState("");
    const [phoneImmediateError, setPhoneImmediateError] = useState("");
    const [otpVerified, setOtpVerified] = useState(false);
    const [otpLoading, setOtpLoading] = useState(false);
    const [otpError, setOtpError] = useState("");
    const [otpSuccess, setOtpSuccess] = useState("");
    const [otpWidgetShown, setOtpWidgetShown] = useState(false);
    const widgetScriptLoaded = useRef(false);

    // ... (Your useEffect hooks for the OTP widget remain unchanged)
    useEffect(() => {
        // Dynamically load MSG91 widget script once
        if (!widgetScriptLoaded.current) {
            const script = document.createElement('script');
            script.src = 'https://verify.msg91.com/otp-provider.js';
            script.async = true;
            script.onload = () => {
                widgetScriptLoaded.current = true;
            };
            document.body.appendChild(script);
        }
    }, []);

    useEffect(() => {
        // Only trigger if phone is 10 digits and no error
        if (
            phone.match(/^\d{10}$/) &&
            !otpVerified &&
            !otpWidgetShown &&
            widgetScriptLoaded.current &&
            !phoneImmediateError
        ) {
            triggerOtpWidget();
            setOtpWidgetShown(true);
        }
        // Reset widget shown if phone changes to invalid
        if ((!phone.match(/^\d{10}$/) || phoneImmediateError) && otpWidgetShown) {
            setOtpWidgetShown(false);
        }
    }, [phone, otpVerified, otpWidgetShown, phoneImmediateError]);


    // New: Handler for successful Google login/signup
    const handleGoogleSuccess = async (tokenResponse) => {
        setError('');
        setIsGoogleLoading(true);
        try {
            // This function handles sending the token to the backend and setting the user state
            await loginWithGoogle(tokenResponse.access_token);
            toast.success('Welcome! Your account is ready.');
            navigate('/'); // Navigate to the homepage because the user is now logged in
            window.location.reload(); // To ensure all app state is fresh
        } catch (err) {
            setError(err.message || 'Google sign up failed. Please try again.');
        } finally {
            setIsGoogleLoading(false);
        }
    };

    // New: Initialize the Google Login hook
    const googleLogin = useGoogleLogin({
        onSuccess: handleGoogleSuccess,
        onError: () => {
            setError('Google sign up failed. Please try again.');
            toast.error('Google sign up failed.');
        },
    });


    const handleSubmit = async (e) => {
        // ... (Your existing handleSubmit function for the form remains unchanged)
        e.preventDefault();
        setError('');
        setIsLoading(true);

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setIsLoading(false);
            return;
        }

        if (phone.length === 11) {
            setError('Please enter a 10-digit phone number');
            setIsLoading(false);
            return;
        }
        if (!phone.match(/^\d{10}$/)) {
            setError('Please enter your 10-digit phone number');
            setIsLoading(false);
            return;
        }

        if (!otpVerified) {
            setError('Please verify your phone number with OTP before signing up.');
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch(`${config.API_URLS.AUTH}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    phone: '91' + phone
                })
            });
            const data = await response.json();
            if (response.ok) {
                toast.success('Account created successfully! Please log in.');
                navigate('/login');
            } else {
                setError(data.message || 'Registration failed');
            }
        } catch (err) {
            setError('Failed to create account.');
        } finally {
            setIsLoading(false);
        }
    };

    const triggerOtpWidget = () => {
        // ... (Your existing triggerOtpWidget function remains unchanged)
        setOtpError("");
        setOtpSuccess("");
        setOtpLoading(true);

        if (!window.initSendOTP) {
            setOtpError("OTP widget not loaded. Please try again.");
            setOtpLoading(false);
            return;
        }

        const configuration = {
            widgetId: "3567686d316c363335313136",
            tokenAuth: "458779TNIVxOl3qDwI6866bc33P1",
            identifier: '91' + phone,
            success: async (data) => {
                setOtpVerified(true);
                setOtpSuccess("Phone verified successfully!");
                setOtpLoading(false);
            },
            failure: (error) => {
                setOtpError(error?.message || "OTP verification failed");
                setOtpVerified(false);
                setOtpLoading(false);
            },
        };
        window.initSendOTP(configuration);
    };

    const handleChange = (e) => {
        // ... (Your existing handleChange function remains unchanged)
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };
    
    // ... (Your ArtisanCraftSVG and FeatureItem components remain unchanged)
    const ArtisanCraftSVG = () => ( <motion.svg width="100%" viewBox="0 0 400 350" initial="hidden" animate="visible" className="max-w-md mx-auto drop-shadow-lg" > <defs> <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%"> <stop offset="0%" stopColor="#FDE68A" /> <stop offset="100%" stopColor="#FCD24C" /> </linearGradient> <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%"> <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" /> <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.5 0" result="glow" /> <feComposite in="glow" in2="SourceGraphic" operator="over" /> </filter> </defs> {/* Background Sunburst/Mandala */} {Array.from({ length: 12 }).map((_, i) => ( <motion.path key={i} d="M 200 175 L 350 175" transform={`rotate(${i * 30}, 200, 175)`} stroke="rgba(255, 255, 255, 0.2)" strokeWidth="1" variants={{ hidden: { pathLength: 0, opacity: 0 }, visible: { pathLength: 1, opacity: 1, transition: { duration: 1.5, delay: i * 0.1, ease: "easeInOut" } } }} /> ))} {/* Central Vase/Pot */} <motion.path d="M 150 300 C 150 250, 120 220, 160 180 C 180 160, 220 160, 240 180 C 280 220, 250 250, 250 300 Z" fill="url(#goldGradient)" stroke="#FFF" strokeWidth="3" filter="url(#softGlow)" variants={{ hidden: { opacity: 0, scale: 0.5 }, visible: { opacity: 1, scale: 1, transition: { duration: 1, delay: 0.5, type: 'spring' } } }} /> {/* Decorative Elements */} <motion.circle cx="200" cy="120" r="15" fill="rgba(255,255,255,0.8)" variants={{ hidden: {opacity: 0}, visible: {opacity: 1, transition: {delay: 1.5}} }} /> <motion.path d="M 120 150 C 150 100, 250 100, 280 150" stroke="rgba(255,255,255,0.5)" fill="transparent" strokeWidth="2" variants={{ hidden: {pathLength: 0}, visible: {pathLength: 1, transition: {duration: 1, delay: 1}} }} /> </motion.svg> );
    const FeatureItem = ({ icon, title, children }) => ( <div className="flex items-start gap-4"> <div className="flex-shrink-0 bg-brand-gold/20 text-brand-gold-dark p-3 rounded-full"> {icon} </div> <div> <h3 className="font-semibold text-stone-800 text-md">{title}</h3> <p className="text-stone-600 text-sm">{children}</p> </div> </div> );


    return (
        <div className="min-h-fit flex flex-col lg:flex-row mb-10 md:mb-0">
            {/* Left Side - Form */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full lg:w-1/2  flex items-start lg:items-center justify-center px-4 sm:px-6 lg:px-8 pt-8 lg:pt-0"
            >
                <div className="max-w-md w-full space-y-6 py-10 ">
                    <div>
                        <h2 className="text-4xl font-light tracking-tight text-gray-900">
                            Create <span className="font-serif italic">Account</span>
                        </h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Already have an account?{' '}
                            <Link to="/login" className="font-medium text-primary hover:text-primary-dark">
                                Sign in
                            </Link>
                        </p>
                    </div>

                    {/* New: Google Sign up button and divider */}
                    <div className="space-y-4">
                        <button
                            type="button"
                            onClick={() => googleLogin()}
                            disabled={isGoogleLoading}
                            className="w-full flex justify-center items-center gap-3 py-3 px-4 border border-gray-300 rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-200 disabled:opacity-50"
                        >
                            {isGoogleLoading ? (
                                <span className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    Signing in...
                                </span>
                            ) : (
                                <>
                                    <GoogleIcon />
                                    Sign up with Google
                                </>
                            )}
                        </button>
                        <div className="relative flex items-center">
                            <div className="flex-grow border-t border-gray-300"></div>
                            <span className="flex-shrink mx-4 text-gray-400 text-xs">OR</span>
                            <div className="flex-grow border-t border-gray-300"></div>
                        </div>
                    </div>


                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                            <span className="block sm:inline">{error}</span>
                        </div>
                    )}
                    {otpError && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                            <span className="block sm:inline">{otpError}</span>
                        </div>
                    )}
                    {otpSuccess && (
                        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
                            <span className="block sm:inline">{otpSuccess}</span>
                        </div>
                    )}

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {/* ... Your existing form inputs remain here ... */}
                        <div className="space-y-4">
                            <div> <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label> <div className="mt-1 relative"> <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"> <User className="h-5 w-5 text-gray-400" /> </div> <input id="name" name="name" type="text" autoComplete="name" required className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200" placeholder="Full Name" value={formData.name} onChange={handleChange} disabled={isLoading} /> </div> </div>
                            <div> <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email address</label> <div className="mt-1 relative"> <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"> <Mail className="h-5 w-5 text-gray-400" /> </div> <input id="email" name="email" type="email" autoComplete="email" required className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200" placeholder="Email address" value={formData.email} onChange={handleChange} disabled={isLoading} /> </div> </div>
                            <div> <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label> <div className="mt-1 relative"> <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"> <Lock className="h-5 w-5 text-gray-400" /> </div> <input id="password" name="password" type={showPassword ? "text" : "password"} autoComplete="new-password" required className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200" placeholder="Password" value={formData.password} onChange={handleChange} disabled={isLoading} /> <div className="absolute inset-y-0 right-0 pr-3 flex items-center"> <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-gray-400 hover:text-gray-500 focus:outline-none" disabled={isLoading} > {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />} </button> </div> </div> </div>
                            <div> <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm Password</label> <div className="mt-1 relative"> <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"> <Lock className="h-5 w-5 text-gray-400" /> </div> <input id="confirmPassword" name="confirmPassword" type={showConfirmPassword ? "text" : "password"} autoComplete="new-password" required className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200" placeholder="Confirm Password" value={formData.confirmPassword} onChange={handleChange} disabled={isLoading} /> <div className="absolute inset-y-0 right-0 pr-3 flex items-center"> <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="text-gray-400 hover:text-gray-500 focus:outline-none" disabled={isLoading} > {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />} </button> </div> </div> </div>
                            <div> <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label> <div className="mt-1 relative flex"> <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm select-none">+91</span> <input id="phone" name="phone" type="tel" required pattern="[0-9]{10}" maxLength={11} className="block w-full pl-3 pr-4 py-3 border border-gray-300 rounded-r-xl shadow-sm placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200" placeholder="10-digit phone number" value={phone} onChange={e => { let val = e.target.value.replace(/\D/g, '').slice(0, 11); setPhone(val); if (val.length === 11) { setPhoneImmediateError('Please enter a 10-digit phone number'); } else { setPhoneImmediateError(''); } }} disabled={isLoading || otpVerified} /> </div> {phoneImmediateError && ( <div className="text-red-500 text-sm mt-1">{phoneImmediateError}</div> )} </div>
                        </div>
                        <div>
                            <button
                                type="submit"
                                className="group relative w-full flex justify-center py-3 px-4 border border-transparent rounded-xl text-white overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{
                                    backgroundColor: '#FCD24C',
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center'
                                }}
                                disabled={isLoading || otpLoading}
                            >
                                <div className="absolute transition-colors duration-300"></div>
                                <span className="absolute left-0 inset-y-0 flex items-center pl-3 z-10">
                                    <ArrowRight className="h-5 w-5 text-white/80 group-hover:text-white" />
                                </span>
                                <span className="relative z-10">
                                    {isLoading || otpLoading ? (
                                        <span className="flex items-center">
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            {otpLoading ? 'Verifying OTP...' : 'Creating Account...'}
                                        </span>
                                    ) : (
                                        'Create Account'
                                    )}
                                </span>
                            </button>
                        </div>
                    </form>
                </div>
            </motion.div>

            {/* Right Side - Image */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, ease: 'easeInOut' }}
                className="hidden lg:flex w-1/2 bg-gradient-to-br from-[#FCD24C] to-[#FBBF24] relative items-center justify-center p-12 flex-col"
            >
                <div className="w-full max-w-lg text-center text-white">
                    <ArtisanCraftSVG />
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 1.5, ease: 'easeOut' }}
                    >
                        <h2 className="font-display text-4xl font-extrabold mt-8 drop-shadow-md">
                            A Canvas of Decoration
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

export default Signup;