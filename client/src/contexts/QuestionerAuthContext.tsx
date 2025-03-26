import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/questioner';
import { toast } from 'react-hot-toast';

interface Questioner {
  id: number;
  name: string;
  email: string;
}

interface QuestionerAuthContextType {
  questioner: Questioner | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const QuestionerAuthContext = createContext<QuestionerAuthContextType | undefined>(undefined);

export const useQuestionerAuth = () => {
  const context = useContext(QuestionerAuthContext);
  if (!context) {
    throw new Error('useQuestionerAuth must be used within a QuestionerAuthProvider');
  }
  return context;
};

export const QuestionerAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [questioner, setQuestioner] = useState<Questioner | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('questioner-token');
    if (token) {
      checkAuth();
    }
  }, []);

  const checkAuth = async () => {
    try {
      const response = await api.get('/questioner/profile');
      if (response.data && response.data.id) {
        setQuestioner(response.data);
        setIsAuthenticated(true);
      } else {
        setQuestioner(null);
        setIsAuthenticated(false);
        localStorage.removeItem('questioner-token');
      }
    } catch (error) {
      console.error('Error checking auth:', error);
      setQuestioner(null);
      setIsAuthenticated(false);
      localStorage.removeItem('questioner-token');
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('Attempting questioner login with:', { email });
      
      const response = await api.post('/questioner/login', { 
        email, 
        password 
      });

      console.log('Login response:', response.data);

      if (response.data && response.data.token) {
        localStorage.setItem('questioner-token', response.data.token);
        setQuestioner(response.data.questioner);
        setIsAuthenticated(true);
        toast.success('Login berhasil!');
        navigate('/questioner/dashboard');
        return true;
      } else {
        console.error('Invalid login response:', response.data);
        toast.error('Login gagal: Response tidak valid');
        return false;
      }
    } catch (error: any) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.message || 'Terjadi kesalahan saat login';
      toast.error(errorMessage);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('questioner-token');
    setQuestioner(null);
    setIsAuthenticated(false);
    navigate('/questioner/login');
    toast.success('Berhasil logout');
  };

  return (
    <QuestionerAuthContext.Provider value={{ questioner, isAuthenticated, login, logout }}>
      {children}
    </QuestionerAuthContext.Provider>
  );
}; 