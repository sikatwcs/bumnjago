import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '@/lib/supabase';

interface User {
  id: number;
  email: string;
  name?: string;
}

interface Profile {
  id?: number;
  userId?: number;
  name: string;
  province: string;
  phone: string;
  gender: 'male' | 'female';
  instance: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  login: (token: string, userData: User) => void;
  logout: () => void;
  fetchProfile: () => Promise<void>;
  updateProfile: (profileData: Partial<Profile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Memeriksa autentikasi ketika aplikasi dimuat
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setLoading(false);
        return;
      }
      
      try {
        // Set authorization header
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Mendapatkan data user
        const response = await api.get('/auth/me');
        setUser(response.data);
        
        // Mendapatkan profil
        await fetchProfile();
      } catch (error) {
        console.error('Auth check error:', error);
        // Token tidak valid, hapus dari localStorage
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  const login = (token: string, userData: User) => {
    // Simpan token
    localStorage.setItem('token', token);
    
    // Set header untuk request selanjutnya
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    // Simpan data user
    setUser(userData);
    
    // Ambil data profil
    fetchProfile();
  };

  const logout = () => {
    // Hapus token dari localStorage
    localStorage.removeItem('token');
    
    // Hapus header authorization
    delete api.defaults.headers.common['Authorization'];
    
    // Reset state
    setUser(null);
    setProfile(null);
  };

  const fetchProfile = async () => {
    if (!user && !localStorage.getItem('token')) return;
    
    try {
      const response = await api.get('/auth/profile');
      setProfile(response.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const updateProfile = async (profileData: Partial<Profile>) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      const response = await api.put('/auth/profile', profileData);
      setProfile(response.data);
      return response.data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        login,
        logout,
        fetchProfile,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}; 