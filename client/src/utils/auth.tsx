import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '@/lib/supabase';
import axios from 'axios';

interface User {
  id: number;
  email: string;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Cek token di localStorage
    const token = localStorage.getItem('token');
    if (token) {
      console.log('Token ditemukan, melakukan validasi...');
      // Validasi token dan ambil data user
      api.get('/auth/me')
        .then(res => {
          console.log('Auth/me response:', res.data);
          setUser(res.data);
        })
        .catch((err) => {
          console.error('Auth/me error:', err);
          if (axios.isAxiosError(err)) {
            if (err.response) {
              console.error('Status:', err.response.status);
              console.error('Data:', err.response.data);
            } else if (err.request) {
              console.error('No response received', err.request);
            }
          }
          localStorage.removeItem('token');
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      console.log('Tidak ada token, user belum login');
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      console.log('Attempting login with:', { email });
      const res = await api.post('/auth/login', { email, password });
      console.log('Login response:', res.data);
      
      if (!res.data.token) {
        throw new Error('Login failed - No token received');
      }

      localStorage.setItem('token', res.data.token);
      setUser(res.data.user);
    } catch (error) {
      console.error('Login error:', error);
      
      // Tampilkan detail error lebih lengkap
      if (axios.isAxiosError(error)) {
        if (error.response) {
          console.error('Response data:', error.response.data);
          console.error('Response status:', error.response.status);
        } else if (error.request) {
          console.error('Request details:', error.request);
          if (error.code === 'ECONNABORTED') {
            console.error('Request timed out');
          }
        }
      }
      
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      console.log('Attempting registration with:', { name, email });
      console.log('API base URL:', api.defaults.baseURL);
      
      const res = await api.post('/auth/register', { name, email, password });
      console.log('Registration response:', res.data);
      
      if (!res.data.token) {
        throw new Error('Registration failed - No token received');
      }

      localStorage.setItem('token', res.data.token);
      setUser(res.data.user);
    } catch (error) {
      console.error('Registration error:', error);
      
      // Tampilkan detail error lebih lengkap
      if (axios.isAxiosError(error)) {
        if (error.response) {
          console.error('Response data:', error.response.data);
          console.error('Response status:', error.response.status);
        } else if (error.request) {
          console.error('Request details:', error.request);
          if (error.code === 'ECONNABORTED') {
            console.error('Request timed out');
          }
        }
      }
      
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  return !!token;
};

export const getToken = () => {
  return localStorage.getItem('token');
};

export const setToken = (token: string) => {
  localStorage.setItem('token', token);
};

export const removeToken = () => {
  localStorage.removeItem('token');
};