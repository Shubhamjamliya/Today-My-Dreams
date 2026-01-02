// File: admin/src/App.jsx
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import Products from "./pages/Products";
import Orders from "./pages/Orders";
import Login from "./pages/Login";
import EditProduct from "./pages/EditProduct";
import SidebarLayout from "./components/SidebarLayout";
import Seller from "./pages/Seller";
import Editseller from "./pages/Editseller";
import Categories from './pages/Categories';
import EditCategories from "./pages/EditCategories";
import ErrorBoundary from './components/ErrorBoundary';
import HeroCarousel from './pages/HeroCarousel';
import EditHeroCarousel from './pages/EditHeroCarousel';
import SellerManagement from './pages/SellerManagement';
import CouponManagement from './pages/CouponManagement';
import DataPage from './pages/DataPage';
import Settings from './pages/Settings';
import BlogManagement from './pages/BlogManagement';
import BlogEditor from './pages/BlogEditor';
import apiService from './services/api';
import Cities from "./pages/Cities";
import Addons from './pages/Addons';
import CreateAddon from './pages/CreateAddon';
import EditAddon from './pages/EditAddon';
import Videos from './pages/Videos';

const isAuthenticated = () => {
  const token = localStorage.getItem("token");
  const adminLoggedIn = localStorage.getItem("admin_logged_in") === "true";
  return token && adminLoggedIn;
};

const ProtectedRoute = ({ children }) => {
  const [isValidating, setIsValidating] = useState(true);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const validateToken = async () => {
      console.log('ProtectedRoute: Starting token validation');
      const token = localStorage.getItem("token");
      const adminLoggedIn = localStorage.getItem("admin_logged_in");
      
      console.log('ProtectedRoute: Checking localStorage', {
        hasToken: !!token,
        tokenPreview: token ? `${token.substring(0, 20)}...` : 'none',
        adminLoggedIn: adminLoggedIn
      });
      
      // First check: Do we have token and admin flag?
      if (!isAuthenticated()) {
        console.log('ProtectedRoute: Not authenticated (no token or admin flag)');
        if (isMounted) {
          setIsValidating(false);
          setIsValid(false);
        }
        return;
      }

      console.log('ProtectedRoute: Token exists, verifying with server...');

      try {
        const response = await apiService.verifyToken();
        console.log('ProtectedRoute: Token verification successful', response);
        
        if (isMounted) {
          setIsValid(true);
        }
      } catch (error) {
        console.error('ProtectedRoute: Token validation failed:', error);
        console.error('ProtectedRoute: Error response:', error.response?.data);
        console.error('ProtectedRoute: Error status:', error.response?.status);
        
        if (isMounted) {
          // Check if it's an actual auth error or just a network/server error
          if (error.response?.status === 401 || error.response?.status === 403) {
            console.log('ProtectedRoute: Invalid token, clearing and redirecting to login');
            apiService.logout();
            setIsValid(false);
          } else if (error.code === 'ERR_NETWORK' || !error.response) {
            // Network error - backend might be down, but allow access for now
            console.warn('ProtectedRoute: Network error during verification, allowing access');
            setIsValid(true);
          } else {
            // Other server errors - allow access but log the issue
            console.warn('ProtectedRoute: Server error during verification, allowing access');
            setIsValid(true);
          }
        }
      } finally {
        if (isMounted) {
          setIsValidating(false);
        }
      }
    };

    validateToken();

    return () => {
      isMounted = false;
    };
  }, []);

  if (isValidating) {
    console.log('ProtectedRoute: Showing validation spinner');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Validating authentication...</p>
          <p className="text-gray-400 text-sm mt-2">Please wait</p>
        </div>
      </div>
    );
  }

  console.log('ProtectedRoute: Validation complete, isValid:', isValid);

  return isValid ? <SidebarLayout>{children}</SidebarLayout> : <Navigate to="/admin/login" replace />;
};

const App = () => {
  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/admin/login" element={<Login />} />
          
          {/* Protected routes */}
          <Route path="/admin" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/admin/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/admin/products" element={<ProtectedRoute><Products /></ProtectedRoute>} />
          <Route path="/admin/products/edit/:id" element={<ProtectedRoute><EditProduct /></ProtectedRoute>} />
          <Route path="/admin/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
          <Route path="/admin/categories" element={<ProtectedRoute><Categories /></ProtectedRoute>} />
          <Route path="/admin/categories/edit/:id" element={<ProtectedRoute><EditCategories /></ProtectedRoute>} />
          <Route path="/admin/seller" element={<ProtectedRoute><Seller /></ProtectedRoute>} />
          <Route path="/admin/seller/edit/:id" element={<ProtectedRoute><Editseller /></ProtectedRoute>} />
          <Route path="/admin/seller/new" element={<ProtectedRoute><Editseller /></ProtectedRoute>} />
          <Route path="/admin/hero-carousel" element={<ProtectedRoute><HeroCarousel /></ProtectedRoute>} />
          <Route path="/admin/hero-carousel/edit/:id" element={<ProtectedRoute><EditHeroCarousel /></ProtectedRoute>} />
          <Route path="/admin/hero-carousel/new" element={<ProtectedRoute><EditHeroCarousel /></ProtectedRoute>} />
          <Route path="/admin/venue" element={<ProtectedRoute><SellerManagement /></ProtectedRoute>} />
          <Route path="/admin/coupons" element={<ProtectedRoute><CouponManagement /></ProtectedRoute>} />
          <Route path="/admin/data" element={<ProtectedRoute><DataPage /></ProtectedRoute>} />
          <Route path="/admin/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/admin/blog" element={<ProtectedRoute><BlogManagement /></ProtectedRoute>} />
          <Route path="/admin/blog/new" element={<ProtectedRoute><BlogEditor /></ProtectedRoute>} />
          <Route path="/admin/blog/edit/:id" element={<ProtectedRoute><BlogEditor /></ProtectedRoute>} />
          <Route path="/admin/cities" element={<ProtectedRoute><Cities /></ProtectedRoute>} />
          <Route path="/admin/addons" element={<ProtectedRoute><Addons /></ProtectedRoute>} />
          <Route path="/admin/addons/create" element={<ProtectedRoute><CreateAddon /></ProtectedRoute>} />
          <Route path="/admin/addons/edit/:id" element={<ProtectedRoute><EditAddon /></ProtectedRoute>} />
          <Route path="/admin/videos" element={<ProtectedRoute><Videos /></ProtectedRoute>} />
          
          {/* Catch all route - redirect to admin dashboard */}
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
};

export default App;