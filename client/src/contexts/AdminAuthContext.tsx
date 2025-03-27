import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '@/lib/api';

interface Admin {
  id?: number;
  name: string;
  email: string;
  role: 'admin';
}

interface AdminAuthContextType {
  admin: Admin | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  getProfile: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider = ({ children }: { children: ReactNode }) => {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);

  // Memeriksa autentikasi admin ketika aplikasi dimuat
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('admin-token');
      
      if (!token) {
        setLoading(false);
        return;
      }
      
      try {
        const response = await api.get('/admin/profile', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        const adminData = response.data;
        setAdmin({
          id: adminData.id,
          name: adminData.name,
          email: adminData.email,
          role: 'admin'
        });
      } catch (error) {
        console.error('Admin auth check error:', error);
        // Token tidak valid, hapus dari localStorage
        localStorage.removeItem('admin-token');
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  const getProfile = async () => {
    const token = localStorage.getItem('admin-token');
    
    if (!token) {
      return;
    }
    
    try {
      const response = await api.get('/admin/profile', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      const adminData = response.data;
      setAdmin({
        id: adminData.id,
        name: adminData.name,
        email: adminData.email,
        role: 'admin'
      });
    } catch (error) {
      console.error('Admin profile error:', error);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('Attempting admin login with:', { email });
      
      const response = await api.post('/admin/login', {
        email,
        password
      });
      
      console.log('Admin login response:', response.data);
      
      const { token, admin: adminData } = response.data;
      
      // Set token 
      localStorage.setItem('admin-token', token);
      
      // Set admin state
      setAdmin({
        id: adminData.id,
        name: adminData.name,
        email: adminData.email,
        role: 'admin'
      });
      
      return true;
    } catch (error) {
      console.error('Admin login error:', error);
      return false;
    }
  };

  const logout = () => {
    // Hapus token dari localStorage
    localStorage.removeItem('admin-token');
    
    // Reset state
    setAdmin(null);
  };

  return (
    <AdminAuthContext.Provider
      value={{
        admin,
        loading,
        login,
        logout,
        getProfile
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  
  return context;
}; 