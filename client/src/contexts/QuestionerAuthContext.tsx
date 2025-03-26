import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/questioner';

interface Questioner {
  id: number;
  name: string;
  email: string;
}

interface QuestionerAuthContextType {
  questioner: Questioner | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
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
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('questioner-token');
      if (!token) {
        setIsLoading(false);
        return;
      }

      const response = await api.get('/questioner/profile');
      setQuestioner(response.data);
    } catch (error) {
      console.error('Error checking questioner auth:', error);
      localStorage.removeItem('questioner-token');
      setQuestioner(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      console.log('Attempting questioner login...');
      const response = await api.post('/questioner/login', { email, password });
      console.log('Login response:', response.data);
      
      const { token, questioner: questionerData } = response.data;
      
      localStorage.setItem('questioner-token', token);
      setQuestioner(questionerData);
      
      console.log('Redirecting to questioner dashboard...');
      navigate('/questioner/dashboard');
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.response?.data?.message || 'Login gagal');
    }
  };

  const logout = () => {
    localStorage.removeItem('questioner-token');
    setQuestioner(null);
    navigate('/questioner/login');
  };

  const value = {
    questioner,
    isLoading,
    login,
    logout,
    checkAuth
  };

  return (
    <QuestionerAuthContext.Provider value={value}>
      {children}
    </QuestionerAuthContext.Provider>
  );
}; 