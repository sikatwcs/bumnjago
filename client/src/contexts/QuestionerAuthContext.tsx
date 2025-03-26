import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../lib/questioner';
import { useNavigate } from 'react-router-dom';

interface Questioner {
  id: string;
  email: string;
  name: string;
}

interface QuestionerAuthContextType {
  isAuthenticated: boolean;
  questioner: Questioner | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const QuestionerAuthContext = createContext<QuestionerAuthContextType>({
  isAuthenticated: false,
  questioner: null,
  login: async () => false,
  logout: () => {},
});

export const useQuestionerAuth = () => {
  const context = useContext(QuestionerAuthContext);
  if (!context) {
    throw new Error('useQuestionerAuth must be used within a QuestionerAuthProvider');
  }
  return context;
};

interface QuestionerAuthProviderProps {
  children: ReactNode;
}

export const QuestionerAuthProvider = ({ children }: QuestionerAuthProviderProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [questioner, setQuestioner] = useState<Questioner | null>(null);
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
      if (response.data) {
        setQuestioner(response.data);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      logout();
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('Attempting questioner login with:', { email });
      
      const response = await api.post('/api/questioner/login', {
        email,
        password
      });

      console.log('Questioner login response:', response.data);

      if (response.data && response.data.token) {
        localStorage.setItem('questioner-token', response.data.token);
        setQuestioner(response.data.questioner);
        setIsAuthenticated(true);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Questioner login error:', error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('questioner-token');
    setQuestioner(null);
    setIsAuthenticated(false);
    navigate('/questioner/login');
  };

  const value = {
    isAuthenticated,
    questioner,
    login,
    logout
  };

  return (
    <QuestionerAuthContext.Provider value={value}>
      {children}
    </QuestionerAuthContext.Provider>
  );
}; 