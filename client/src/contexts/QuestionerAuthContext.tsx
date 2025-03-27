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
      }, { timeout: 60000 });
      
      console.log('Raw response:', response);
      console.log('Login response data:', response.data);

      let token, userData;
      
      if (response.data.token && response.data.questioner) {
        token = response.data.token;
        userData = {
          id: response.data.questioner.id,
          name: response.data.questioner.name,
          email: response.data.questioner.email,
          role: 'questioner'
        };
        console.log('Format 1 detected');
      } else if (response.data.success && response.data.data) {
        token = response.data.data.token;
        userData = response.data.data.user;
        console.log('Format 2 detected');
      } else if (typeof response.data === 'object') {
        console.log('Unknown format, attempting to extract data');
        
        if (response.data.token) {
          token = response.data.token;
        } else if (response.data.data?.token) {
          token = response.data.data.token;
        }
        
        if (response.data.questioner) {
          userData = {
            id: response.data.questioner.id,
            name: response.data.questioner.name,
            email: response.data.questioner.email,
            role: 'questioner'
          };
        } else if (response.data.data?.user) {
          userData = response.data.data.user;
        } else if (response.data.user) {
          userData = response.data.user;
        }
      }
      
      if (!token || !userData) {
        console.error('Required data not found in response:', response.data);
        throw new Error('Data login tidak lengkap atau format tidak valid');
      }
      
      localStorage.setItem('questioner_token', token);
      setQuestioner(userData);
      
      console.log('Login successful, parsed data:', { token: token.substring(0, 10) + '...', userData });
      return;

    } catch (error: any) {
      console.error('Login error details:', error);
      
      if (error.response) {
        console.error('Server response error:', {
          status: error.response.status,
          data: error.response.data
        });
        throw new Error(error.response.data?.message || 'Terjadi kesalahan saat login');
      } else if (error.request) {
        console.error('No response received:', error.request);
        throw new Error('Tidak ada respons dari server, periksa koneksi internet Anda');
      } else {
        console.error('Other error:', error.message);
        throw new Error(error.message || 'Terjadi kesalahan saat login');
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