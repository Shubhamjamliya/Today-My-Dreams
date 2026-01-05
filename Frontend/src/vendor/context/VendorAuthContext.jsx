import React, { createContext, useContext, useEffect, useState } from 'react';
import config from '../../config/config';
import { toast } from 'react-hot-toast';

const VendorAuthContext = createContext(null);

export const VendorAuthProvider = ({ children }) => {
  const [vendor, setVendor] = useState(null);
  const [isApproved, setIsApproved] = useState(false);
  const [loading, setLoading] = useState(true);
  const tokenKey = 'vendor_token';

  const fetchMe = async (token) => {
    try {
      const res = await fetch(`${config.API_BASE_URL}/api/vendor/auth/me`, {
        credentials: 'include',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setVendor(data.vendor);
        setIsApproved(!!data.vendor?.isApproved);
      } else {
        setVendor(null);
        setIsApproved(false);
      }
    } catch (err) {
      setVendor(null);
      setIsApproved(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem(tokenKey);
    if (token) fetchMe(token);
    else setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const res = await fetch(`${config.API_BASE_URL}/api/vendor/auth/login`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.success && data.token) {
        localStorage.setItem(tokenKey, data.token);
        await fetchMe(data.token);
        return { success: true };
      }
      toast.error(data.message || 'Login failed');
      return { success: false, message: data.message };
    } catch {
      toast.error('Login error');
      return { success: false };
    }
  };

  const register = async (payload) => {
    try {
      const res = await fetch(`${config.API_BASE_URL}/api/vendor/auth/register`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message || 'Registered successfully. Await approval.');
      } else {
        toast.error(data.message || 'Registration failed');
      }
      return data;
    } catch {
      toast.error('Registration error');
      return { success: false };
    }
  };

  const logout = () => {
    localStorage.removeItem(tokenKey);
    setVendor(null);
    setIsApproved(false);
    toast.success('Logged out');
  };

  return (
    <VendorAuthContext.Provider value={{ vendor, isApproved, loading, login, register, logout }}>
      {children}
    </VendorAuthContext.Provider>
  );
};

export const useVendorAuth = () => useContext(VendorAuthContext);

