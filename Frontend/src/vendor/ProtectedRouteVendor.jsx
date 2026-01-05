import React from 'react';
import { Navigate } from 'react-router-dom';
import { useVendorAuth } from './context/VendorAuthContext';
import Loader from '../components/Loader';

const ProtectedRouteVendor = ({ children }) => {
  const { loading, vendor, isApproved } = useVendorAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader size="md" text="Loading..." />
      </div>
    );
  }
  if (!vendor) return <Navigate to="/vendor/login" replace />;
  if (!isApproved) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6 text-center">
        <div>
          <h1 className="text-xl font-bold mb-2">Account awaiting approval</h1>
          <p className="text-gray-600">Please wait for admin approval to access the vendor panel.</p>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRouteVendor;

