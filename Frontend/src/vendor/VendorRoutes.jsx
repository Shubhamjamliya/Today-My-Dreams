import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import VendorLayout from './components/VendorLayout';
import ProtectedRouteVendor from './ProtectedRouteVendor';
import { VendorAuthProvider } from './context/VendorAuthContext';
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

const VendorRoutes = () => (
  <VendorAuthProvider>
    <Routes>
      <Route path="login" element={<Login />} />
      <Route path="register" element={<Register />} />
      <Route path="forgot-password" element={<ForgotPassword />} />
      <Route path="reset-password/:token" element={<ResetPassword />} />
      <Route element={<VendorLayout />}>
        <Route path="/" element={<ProtectedRouteVendor><Dashboard /></ProtectedRouteVendor>} />
        <Route path="dashboard" element={<ProtectedRouteVendor><Dashboard /></ProtectedRouteVendor>} />
        <Route path="orders" element={<ProtectedRouteVendor><Orders /></ProtectedRouteVendor>} />
        <Route path="settings" element={<ProtectedRouteVendor><Settings /></ProtectedRouteVendor>} />
        <Route path="profile" element={<ProtectedRouteVendor><Profile /></ProtectedRouteVendor>} />
      </Route>
      <Route path="*" element={<Navigate to="/vendor" replace />} />
    </Routes>
  </VendorAuthProvider>
);

export default VendorRoutes;

