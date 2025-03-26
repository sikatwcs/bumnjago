import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { questionerAPI } from '@/lib/api';

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

  // Memeriksa autentikasi questioner ketika aplikasi dimuat
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('questioner-token');
      
      if (!token) {
        setLoading(false);
        return;
      }
      
      try {
        const response = await questionerAPI.getProfile();
        const questionerData = response.data;
        
        setQuestioner({
          id: questionerData.id,
          name: questionerData.name,
          email: questionerData.email,
          role: 'questioner'
        });
      } catch (error) {
        console.error('Questioner auth check error:', error);
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
      const response = await questionerAPI.getProfile();
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
      
      const response = await questionerAPI.login(email, password);
      console.log('Questioner login response:', response.data);
      
      const { token, questioner: questionerData } = response.data;
      
      localStorage.setItem('questioner-token', token);
      
      setQuestioner({
        id: questionerData.id,
        name: questionerData.name,
        email: questionerData.email,
        role: 'questioner'
      });
      
      return true;
    } catch (error) {
      console.error('Questioner login error:', error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('questioner-token');
    setQuestioner(null);
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