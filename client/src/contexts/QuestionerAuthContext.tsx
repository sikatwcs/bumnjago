import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import { toast } from '@/components/ui/use-toast';

interface Questioner {
  id?: number;
  name: string;
  email: string;
  role: 'questioner';
}

interface QuestionerAuthContextType {
  questioner: Questioner | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  getProfile: () => Promise<void>;
}

const QuestionerAuthContext = createContext<QuestionerAuthContextType | undefined>(undefined);

export const QuestionerAuthProvider = ({ children }: { children: ReactNode }) => {
  const [questioner, setQuestioner] = useState<Questioner | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Memeriksa autentikasi questioner ketika aplikasi dimuat
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('questioner-token');
      
      if (!token) {
        setLoading(false);
        return;
      }
      
      try {
        const response = await api.get('/questioner/profile', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        const questionerData = response.data;
        setQuestioner({
          id: questionerData.id,
          name: questionerData.name,
          email: questionerData.email,
          role: 'questioner'
        });
      } catch (error) {
        console.error('Questioner auth check error:', error);
        // Token tidak valid, hapus dari localStorage
        localStorage.removeItem('questioner-token');
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  const getProfile = async () => {
    const token = localStorage.getItem('questioner-token');
    
    if (!token) {
      return;
    }
    
    try {
      const response = await api.get('/questioner/profile', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      const questionerData = response.data;
      setQuestioner({
        id: questionerData.id,
        name: questionerData.name,
        email: questionerData.email,
        role: 'questioner'
      });
    } catch (error) {
      console.error('Questioner profile error:', error);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('Attempting questioner login with:', { email });
      
      const response = await api.post('/questioner/login', {
        email,
        password
      });
      
      console.log('Questioner login response:', response.data);
      
      const { token, questioner: questionerData } = response.data;
      
      // Set token 
      localStorage.setItem('questioner-token', token);
      
      // Set questioner state
      setQuestioner({
        id: questionerData.id,
        name: questionerData.name,
        email: questionerData.email,
        role: 'questioner'
      });

      toast({
        title: "Login berhasil",
        description: "Selamat datang kembali!"
      });
      
      navigate('/questioner/dashboard');
      return true;
    } catch (error: any) {
      console.error('Questioner login error:', error);
      
      toast({
        variant: "destructive",
        title: "Login gagal",
        description: error.response?.data?.message || "Terjadi kesalahan saat login"
      });
      
      return false;
    }
  };

  const logout = () => {
    // Hapus token dari localStorage
    localStorage.removeItem('questioner-token');
    
    // Reset state
    setQuestioner(null);
    
    toast({
      title: "Logout berhasil",
      description: "Sampai jumpa kembali!"
    });
    
    navigate('/questioner/login');
  };

  return (
    <QuestionerAuthContext.Provider
      value={{
        questioner,
        loading,
        login,
        logout,
        getProfile
      }}
    >
      {children}
    </QuestionerAuthContext.Provider>
  );
};

export const useQuestionerAuth = () => {
  const context = useContext(QuestionerAuthContext);
  
  if (context === undefined) {
    throw new Error('useQuestionerAuth must be used within a QuestionerAuthProvider');
  }
  
  return context;
}; 