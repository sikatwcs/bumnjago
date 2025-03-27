interface ImportMetaEnv {
  VITE_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://api.jagobumn.com',
  withCredentials: true,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('questioner_token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log request in development
    if (process.env.NODE_ENV === 'development') {
      console.log('API Request:', {
        method: config.method,
        url: config.url,
        data: config.data,
        headers: config.headers
      });
    }

    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Log response in development
    if (process.env.NODE_ENV === 'development') {
      console.log('API Response:', {
        status: response.status,
        url: response.config.url,
        data: response.data
      });
    }
    return response;
  },
  (error) => {
    // Log error details
    console.error('API Error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      url: error.config?.url
    });

    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      localStorage.removeItem('questioner_token');
      window.location.href = '/questioner/login';
    }

    return Promise.reject(error);
  }
);

// Helper functions for common API calls

// Admin API calls
export const adminAPI = {
  login: async (email: string, password: string) => {
    return api.post('/admin/login', { email, password });
  },
  getProfile: async () => {
    return api.get('/admin/profile');
  },
  getTryoutLists: async () => {
    return api.get('/admin-tryout/tryoutlists');
  },
  createTryout: async (data: any) => {
    return api.post('/admin-tryout/tryoutlists', data);
  },
  updateTryout: async (id: number, data: any) => {
    return api.put(`/admin-tryout/tryoutlists/${id}`, data);
  },
  deleteTryout: async (id: number) => {
    return api.delete(`/admin-tryout/tryoutlists/${id}`);
  }
};

// Questioner API calls
export const questionerAPI = {
  login: async (email: string, password: string) => {
    return api.post('/api/questioner/login', { email, password });
  },
  getProfile: async () => {
    return api.get('/api/questioner/profile');
  },
  getTryoutLists: async () => {
    return api.get('/api/questioner/tryoutlists');
  },
  getTryoutDetails: async (id: number) => {
    return api.get(`/api/questioner/tryouts/${id}`);
  },
  createQuestion: async (data: any) => {
    return api.post('/api/questioner/tryouts', data);
  },
  updateQuestion: async (id: number, data: any) => {
    return api.put(`/api/questioner/tryouts/${id}`, data);
  }
};

// User API calls
export const userAPI = {
  login: async (email: string, password: string) => {
    return api.post('/auth/login', { email, password });
  },
  register: async (data: any) => {
    return api.post('/auth/register', data);
  },
  getProfile: async () => {
    return api.get('/auth/me');
  },
  getAvailableTryouts: async () => {
    return api.get('/tryout/available');
  }
};

export default api;
