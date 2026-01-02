import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService'; // Correctly using the service
import { toast } from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        try {
            const stored = localStorage.getItem('user');
            return stored ? JSON.parse(stored) : null;
        } catch (error) {
            localStorage.removeItem('user'); // Clear invalid data
            return null;
        }
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const initAuth = async () => {
            const token = localStorage.getItem('token');
            let storedUser = null;
            try {
                const stored = localStorage.getItem('user');
                storedUser = stored ? JSON.parse(stored) : null;
            } catch (error) {
                localStorage.removeItem('user');
            }
            
            if (token && !storedUser) {
                setLoading(true);
                try {
                    const data = await authService.getCurrentUser();
                    setUser(data.user);
                    localStorage.setItem('user', JSON.stringify(data.user));
                } catch (err) {
                    setUser(null);
                    localStorage.removeItem('user');
                    localStorage.removeItem('token');
                } finally {
                    setLoading(false);
                }
            }
        };
        initAuth();
    }, []);

    const login = async (credentials) => {
        try {
            setError(null);
            const data = await authService.login(credentials);
            setUser(data.user);
            localStorage.setItem('user', JSON.stringify(data.user));
            if (data.token) {
                localStorage.setItem('token', data.token);
            }
            return data;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    // --- UPDATED to use authService ---
    const loginWithGoogle = async (googleAccessToken) => {
        try {
            setError(null);
            // 1. Call the centralized loginWithGoogle function from your service
            const data = await authService.loginWithGoogle(googleAccessToken);
            
            // 2. Handle the response and update state, just like in the normal login
            setUser(data.user);
            localStorage.setItem('user', JSON.stringify(data.user));
            if (data.token) {
                localStorage.setItem('token', data.token);
            }
            return data;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    const register = async (userData) => {
        try {
            setError(null);
            const data = await authService.register(userData);
            return data;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    const logout = async () => {
        try {
            await authService.logout();
        } catch (err) {
            // Logout failed - silent error
        }
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
    };

    const updateProfile = async (userData) => {
        try {
            const response = await authService.updateProfile(userData);
            setUser(response.user);
            localStorage.setItem('user', JSON.stringify(response.user));
            return response;
        } catch (error) {
            setError(error.message);
            throw error;
        }
    };

    const forgotPassword = async (email) => {
        try {
            const response = await authService.forgotPassword(email);
            toast.success('Password reset link sent to your email');
            return response;
        } catch (error) {
            setError(error.message);
            throw error;
        }
    };

    const value = {
        user,
        loading,
        error,
        login,
        register,
        logout,
        updateProfile,
        forgotPassword,
        loginWithGoogle,
        isAuthenticated: !!user,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};