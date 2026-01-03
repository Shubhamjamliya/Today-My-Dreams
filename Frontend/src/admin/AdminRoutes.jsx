import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import Products from "./pages/Products";
import Orders from "./pages/Orders";
import Login from "./pages/Login";
import EditProduct from "./pages/EditProduct";
import SidebarLayout from "./components/SidebarLayout";
import Categories from './pages/Categories';
import EditCategories from "./pages/EditCategories";
import HeroCarousel from './pages/HeroCarousel';
import EditHeroCarousel from './pages/EditHeroCarousel';
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
  const token = localStorage.getItem("admin_token");
  const adminLoggedIn = localStorage.getItem("admin_logged_in") === "true";
  return token && adminLoggedIn;
};

const ProtectedRoute = ({ children }) => {
  const [isValidating, setIsValidating] = useState(true);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const validateToken = async () => {
      if (!isAuthenticated()) {
        if (isMounted) {
          setIsValidating(false);
          setIsValid(false);
        }
        return;
      }

      try {
        await apiService.verifyToken();
        if (isMounted) {
          setIsValid(true);
        }
      } catch (error) {
        console.error('ProtectedRoute: Token validation failed:', error);
        if (isMounted) {
          // Allow access on error for now if it's network/server related, unless explicitly 401
          if (error.response?.status === 401 || error.response?.status === 403) {
            apiService.logout();
            setIsValid(false);
          } else {
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
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          Loading...
        </div>
      </div>
    );
  }

  return isValid ? <SidebarLayout>{children}</SidebarLayout> : <Navigate to="/admin/login" replace />;
};

const AdminRoutes = () => {
  return (
    <Routes>
      <Route path="login" element={<Login />} />

      {/* Protected Routes */}
      {/* Note: Paths are relative to /admin because this component is rendered at /admin/* */}
      <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

      <Route path="products" element={<ProtectedRoute><Products /></ProtectedRoute>} />
      <Route path="products/edit/:id" element={<ProtectedRoute><EditProduct /></ProtectedRoute>} />

      <Route path="orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />

      <Route path="categories" element={<ProtectedRoute><Categories /></ProtectedRoute>} />
      <Route path="categories/edit/:id" element={<ProtectedRoute><EditCategories /></ProtectedRoute>} />

      <Route path="hero-carousel" element={<ProtectedRoute><HeroCarousel /></ProtectedRoute>} />
      <Route path="hero-carousel/edit/:id" element={<ProtectedRoute><EditHeroCarousel /></ProtectedRoute>} />
      <Route path="hero-carousel/new" element={<ProtectedRoute><EditHeroCarousel /></ProtectedRoute>} />

      <Route path="coupons" element={<ProtectedRoute><CouponManagement /></ProtectedRoute>} />
      <Route path="data" element={<ProtectedRoute><DataPage /></ProtectedRoute>} />
      <Route path="settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

      <Route path="blog" element={<ProtectedRoute><BlogManagement /></ProtectedRoute>} />
      <Route path="blog/new" element={<ProtectedRoute><BlogEditor /></ProtectedRoute>} />
      <Route path="blog/edit/:id" element={<ProtectedRoute><BlogEditor /></ProtectedRoute>} />

      <Route path="cities" element={<ProtectedRoute><Cities /></ProtectedRoute>} />

      <Route path="addons" element={<ProtectedRoute><Addons /></ProtectedRoute>} />
      <Route path="addons/create" element={<ProtectedRoute><CreateAddon /></ProtectedRoute>} />
      <Route path="addons/edit/:id" element={<ProtectedRoute><EditAddon /></ProtectedRoute>} />

      <Route path="videos" element={<ProtectedRoute><Videos /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
};

export default AdminRoutes;
