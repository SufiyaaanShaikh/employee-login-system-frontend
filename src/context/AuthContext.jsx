import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AuthContext = createContext();

// Configure axios defaults
axios.defaults.baseURL = "/api";  // ✅ No domain needed
axios.defaults.withCredentials = true;


export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is authenticated on app load
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await axios.get('/auth/me');
      if (response.data.success) {
        setUser(response.data.user);
      }
    } catch (error) {
      // User not authenticated
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      const response = await axios.post('/auth/login', credentials);
      
      if (response.data.success) {
        setUser(response.data.user);
        toast.success(response.data.message);
        return { success: true };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  const logout = async () => {
    try {
      await axios.post('/auth/logout');
      setUser(null);
      toast.success('Logged out successfully');
    } catch (error) {
      // Even if logout fails on server, clear local state
      setUser(null);
      toast.error('Logout failed');
    }
  };

  const value = {
    user,
    login,
    logout,
    loading,
    checkAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};