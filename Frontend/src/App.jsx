import React, { useState, useEffect, Suspense, lazy } from 'react';
import './App.css';
import './styles/blog.css';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useSearchParams, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';


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
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const Account = lazy(() => import('./pages/Account'));
const Wishlist = lazy(() => import('./pages/Wishlist'));
const ProductView = lazy(() => import('./pages/ProductView'));
const Checkout = lazy(() => import('./pages/Checkout'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const AboutUs = lazy(() => import('./pages/AboutUs'));
const OrderConfirmation = lazy(() => import('./pages/OrderConfirmation'));

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
    // Only handle visibility change for title, removed window focus listener to avoid scroll jumping
    const handleVisibilityChange = () => {
      if (document.hidden) {
        window.previousTitle = document.title;
        document.title = "Come back! 😢";
      } else if (window.previousTitle) {
        document.title = window.previousTitle;
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
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

  // Helper for customer layout to avoid code duplication
  const CustomerLayout = () => (
    <div className="min-h-screen flex flex-col">
      <PerformanceMonitor />
      <SEO {...seoData} />
      <Header />
      <div className="flex-grow w-full">
        <Routes>
          <Route path="/" element={
            <main>
              <ErrorBoundary>
                <Hero />
              </ErrorBoundary>
              <Suspense fallback={<Loader size="sm" text="Loading..." />}>
                <ErrorBoundary>
                  <Categories />
                </ErrorBoundary>
              </Suspense>
              <Suspense fallback={<Loader size="sm" text="Loading..." />}>
                <BirthdaySubcategories />
              </Suspense>
              <Suspense fallback={<Loader size="sm" text="Loading..." />}>
                <CatCard />
              </Suspense>
              <Suspense fallback={<Loader size="sm" text="Loading..." />}>
                <ErrorBoundary>
                  <VideoGallery />
                </ErrorBoundary>
              </Suspense>
              <Suspense fallback={<Loader size="sm" text="Loading..." />}>
                <ErrorBoundary>
                  <Testimonials />
                </ErrorBoundary>
              </Suspense>
              <Suspense fallback={<Loader size="sm" text="Loading..." />}>
                <ErrorBoundary>
                  <MissionVision />
                </ErrorBoundary>
              </Suspense>
              <Suspense fallback={<Loader size="sm" text="Loading..." />}>
                <Offerpage />
              </Suspense>
              <Suspense fallback={<Loader size="sm" text="Loading..." />}>
                <ErrorBoundary>
                  <InfoSection />
                </ErrorBoundary>
              </Suspense>
            </main>
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
        </Routes>
      </div>

      <Suspense fallback={<Loader size="sm" text="Loading..." />}>
        <Footer />
      </Suspense>
      <Suspense fallback={<Loader size="sm" text="Loading..." />}>
        <ScrollToTop />
      </Suspense>
      {/* Show FloatingContactButton on all pages except ProductView and Admin */}
      {!location.pathname.startsWith('/product/') && !location.pathname.startsWith('/admin') && (
        <Suspense fallback={<Loader size="sm" text="Loading..." />}>
          <FloatingContactButton />
        </Suspense>
      )}
      <Toaster position="top-right" />
    </div>
  );

  // Main Route Structure
  return (
    <Routes>
      {/* Admin Section */}
      <Route path="/admin/*" element={
        <Suspense fallback={<Loader size="md" text="Loading Admin..." />}>
          <AdminRoutes />
        </Suspense>
      } />

      {/* Customer Section - Matches everything else */}
      <Route path="/*" element={<CustomerLayout />} />
    </Routes>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
