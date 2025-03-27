import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '@/lib/api';

interface Questioner {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  questioner: Questioner | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const QuestionerAuthContext = createContext<AuthContextType | undefined>(undefined);

export const QuestionerAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [questioner, setQuestioner] = useState<Questioner | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('questioner_token');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await api.get('/api/questioner/profile');
      if (response.data) {
        setQuestioner(response.data);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('questioner_token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      console.log('Attempting login with:', { email });
      
      const response = await api.post('/api/questioner/login', { 
        email, 
        password 
      });
      
      console.log('Login response:', response.data);

      if (!response.data || !response.data.success) {
        throw new Error(response.data?.message || 'Login gagal');
      }

      const { token, user } = response.data.data;
      
      if (!token || !user) {
        throw new Error('Data login tidak valid');
      }

      localStorage.setItem('questioner_token', token);
      setQuestioner(user);

      console.log('Login successful, user:', user);
    } catch (error: any) {
      console.error('Login error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });

      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error('Terjadi kesalahan saat login');
      }
    }
  };

  const logout = () => {
    localStorage.removeItem('questioner_token');
    setQuestioner(null);
  };

  return (
    <QuestionerAuthContext.Provider value={{ questioner, loading, login, logout }}>
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