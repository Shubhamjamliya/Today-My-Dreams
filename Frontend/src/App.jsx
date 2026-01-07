import React, { useState, useEffect, Suspense, lazy } from 'react';
import './App.css';
import './styles/blog.css';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useSearchParams, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { Outlet } from 'react-router-dom';


import Loader from './components/Loader';
import useScrollToTop from './hooks/useScrollToTop';
import { seoConfig, defaultSEO } from './config/seo';

import Header from './components/Header/Header';
import Hero from './components/Hero/Hero';
import SEO from './components/SEO/SEO';
import PerformanceMonitor from './components/SEO/PerformanceMonitor';

// Lazy load heavy components
const Categories = lazy(() => import('./components/Categories/Categories'));
const Testimonials = lazy(() => import('./components/Testimonials/Testimonials'));
const Footer = lazy(() => import('./components/Footer/Footer'));
const MissionVision = lazy(() => import('./components/MissionVision/MissionVision'));
const ScrollToTop = lazy(() => import('./components/ScrollToTop/ScrollToTop'));
const InfoSection = lazy(() => import('./components/Info'));
const VideoGallery = lazy(() => import('./components/Video/VideoGallery'));
const FloatingContactButton = lazy(() => import('./components/FloatingContactButton'));

// Lazy load pages for code splitting
const ContactPage = lazy(() => import('./pages/ContactPage'));
const Shop = lazy(() => import('./pages/Shop'));
const ShopCart = lazy(() => import('./pages/ShopCart'));
const ShopCheckout = lazy(() => import('./pages/ShopCheckout'));
const Service = lazy(() => import('./pages/Service'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const Account = lazy(() => import('./pages/Account'));
const Wishlist = lazy(() => import('./pages/Wishlist'));
const ProductView = lazy(() => import('./pages/ProductView'));
const Checkout = lazy(() => import('./pages/Checkout'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const AboutUs = lazy(() => import('./pages/AboutUs'));
const OrderConfirmation = lazy(() => import('./pages/OrderConfirmation'));
// Direct import for LCP optimization
import Home from './pages/Home';

const Policies = lazy(() => import('./pages/Policies'));
const PaymentStatus = lazy(() => import('./pages/PaymentStatus'));
const VenuePage = lazy(() => import('./pages/Venupage'));
const ViewVenue = lazy(() => import('./pages/Viewvenu'));
const SubCategoryPage = lazy(() => import('./pages/SubCategoryPage'));
const Blog = lazy(() => import('./pages/Blog'));
const BlogPost = lazy(() => import('./pages/BlogPost'));
const Videos = lazy(() => import('./pages/Videos'));
const NotFound = lazy(() => import('./pages/NotFound'));
const AppDownload = lazy(() => import('./pages/AppDownload'));

// Lazy load components
const FeaturedProducts = lazy(() => import('./components/Products/FeaturedProducts'));
const WeeklyBestsellers = lazy(() => import('./components/Products/WeeklyBestsellers'));
const MostLoved = lazy(() => import('./components/Products/MostLoved'));
const FAQ = lazy(() => import('./components/FAQ/FAQ'));
const Offerpage = lazy(() => import('./components/Hero/Offer'));
const CatCard = lazy(() => import('./components/Catcard'));
const BirthdaySubcategories = lazy(() => import('./components/BirthdaySubcategories'));

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader size="md" text="Loading..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return children;
};

// Simple Error Boundary
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Error caught by boundary
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong</h1>
            <p className="text-gray-600 mb-4">Please try refreshing the page.</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Import Admin Routes
import AdminRoutes from './admin/AdminRoutes';
import VendorRoutes from './vendor/VendorRoutes';

function AppContent() {
  useScrollToTop();
  const { loading: authLoading } = useAuth();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // --- Performance & Scroll Management ---
  useEffect(() => {
    // Force scroll to top on any page load/reload
    const handlePageLoad = () => {
      setTimeout(() => {
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      }, 0);
    };

    handlePageLoad();
  }, []);

  // SEO configuration based on current route
  const getSEOConfig = () => {
    const path = location.pathname;

    if (path === '/') return seoConfig.home;
    if (path === '/shop') return seoConfig.shop;
    if (path === '/about') return seoConfig.about;
    if (path === '/contact') return seoConfig.contact;
    if (path === '/login') return seoConfig.login;
    if (path === '/signup') return seoConfig.signup;
    if (path === '/policies') return seoConfig.policies;
    // if (path === '/venue') return seoConfig.seller; // Seller removed
    if (path === '/blog') return seoConfig.blog;
    if (path === '/app') return seoConfig.app;

    return defaultSEO;
  };

  // Show loading only if auth is still loading
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader size="md" text="Loading..." showLogo={true} />
      </div>
    );
  }

  const seoData = getSEOConfig();


  return (
    <Routes>
      {/* Admin Section */}
      <Route path="/admin/*" element={
        <Suspense fallback={<Loader size="md" text="Loading Admin..." />}>
          <AdminRoutes />
        </Suspense>
      } />
      {/* Vendor Section */}
      <Route path="/vendor/*" element={
        <Suspense fallback={<Loader size="md" text="Loading Vendor..." />}>
          <VendorRoutes />
        </Suspense>
      } />
      {/* Customer Section */}
      <Route element={<CustomerLayout seoData={seoData} />}>
        <Route path="/" element={
          <ErrorBoundary>
            <Home />
          </ErrorBoundary>
        } />
        <Route path="/about" element={
          <Suspense fallback={<Loader size="md" text="Loading..." />}>
            <AboutUs />
          </Suspense>
        } />
        <Route path="/contact" element={
          <Suspense fallback={<Loader size="md" text="Loading..." />}>
            <ContactPage />
          </Suspense>
        } />
        <Route path="/shop" element={
          <Suspense fallback={<Loader size="md" text="Loading..." />}>
            <Shop />
          </Suspense>
        } />
        <Route path="/shop/cart" element={
          <Suspense fallback={<Loader size="md" text="Loading..." />}>
            <ShopCart />
          </Suspense>
        } />
        <Route path="/shop/checkout" element={
          <Suspense fallback={<Loader size="md" text="Loading..." />}>
            <ShopCheckout />
          </Suspense>
        } />
        <Route path="/services" element={
          <Suspense fallback={<Loader size="md" text="Loading..." />}>
            <Service />
          </Suspense>
        } />
        <Route path="/subcategory" element={
          <Suspense fallback={<Loader size="md" text="Loading..." />}>
            <SubCategoryPage />
          </Suspense>
        } />
        <Route path="/login" element={
          <Suspense fallback={<Loader size="md" text="Loading..." />}>
            <Login />
          </Suspense>
        } />
        <Route path="/signup" element={
          <Suspense fallback={<Loader size="md" text="Loading..." />}>
            <Signup />
          </Suspense>
        } />
        <Route path="/categories" element={<Categories />} />
        <Route path="/account" element={
          <ProtectedRoute>
            <Suspense fallback={<Loader size="md" text="Loading..." />}>
              <Account />
            </Suspense>
          </ProtectedRoute>
        } />
        <Route path="/wishlist" element={
          <Suspense fallback={<Loader size="md" text="Loading..." />}>
            <Wishlist />
          </Suspense>
        } />

        <Route path="/checkout" element={
          <Suspense fallback={<Loader size="md" text="Loading..." />}>
            <Checkout />
          </Suspense>
        } />
        <Route path="/order-confirmation/:id" element={
          <Suspense fallback={<Loader size="md" text="Loading..." />}>
            <OrderConfirmation />
          </Suspense>
        } />
        <Route path="/product/:id" element={
          <Suspense fallback={<Loader size="md" text="Loading..." />}>
            <ProductView />
          </Suspense>
        } />
        <Route path="/forgot-password" element={
          <Suspense fallback={<Loader size="md" text="Loading..." />}>
            <ForgotPassword />
          </Suspense>
        } />
        <Route path="/policies" element={
          <Suspense fallback={<Loader size="md" text="Loading..." />}>
            <Policies />
          </Suspense>
        } />
        <Route path="/venues" element={
          <Suspense fallback={<Loader size="md" text="Loading..." />}>
            <VenuePage />
          </Suspense>
        } />
        <Route path="/venues/:venueId" element={
          <Suspense fallback={<Loader size="md" text="Loading..." />}>
            <ViewVenue />
          </Suspense>
        } />
        <Route path="/payment/status" element={
          <Suspense fallback={<Loader size="md" text="Loading..." />}>
            <PaymentStatus />
          </Suspense>
        } />
        <Route path="/blog" element={
          <Suspense fallback={<Loader size="md" text="Loading..." />}>
            <Blog />
          </Suspense>
        } />
        <Route path="/blog/:slug" element={
          <Suspense fallback={<Loader size="md" text="Loading..." />}>
            <BlogPost />
          </Suspense>
        } />
        <Route path="/videos" element={
          <Suspense fallback={<Loader size="md" text="Loading..." />}>
            <Videos />
          </Suspense>
        } />
        <Route path="/app" element={
          <Suspense fallback={<Loader size="md" text="Loading..." />}>
            <AppDownload />
          </Suspense>
        } />
        <Route path="*" element={
          <Suspense fallback={<Loader size="md" text="Loading..." />}>
            <NotFound />
          </Suspense>
        } />
      </Route>
    </Routes >
  );
}

// ---------------------------------------------------------
// Helper for customer layout to avoid code duplication
// ---------------------------------------------------------
const CustomerLayout = ({ seoData }) => (
  <div className="min-h-screen flex flex-col font-inter">
    <PerformanceMonitor />
    <SEO {...seoData} />
    <Header />
    <div className="flex-grow w-full min-h-[60vh]">
      <Outlet />
    </div>

    <Suspense fallback={<Loader size="sm" text="Loading..." />}>
      <Footer />
    </Suspense>
    <Suspense fallback={<Loader size="sm" text="Loading..." />}>
      <ScrollToTop />
    </Suspense>
    <Suspense fallback={null}>
      <FloatingContactButton />
    </Suspense>
    <Toaster position="top-right" />
  </div>
);


import { SettingsProvider } from './context/SettingsContext';

function App() {
  return (
    <ErrorBoundary>
      <SettingsProvider>
        <CartProvider>
          <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <AppContent />
          </Router>
        </CartProvider>
      </SettingsProvider>
    </ErrorBoundary>
  );
}

export default App;
