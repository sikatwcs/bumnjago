interface ImportMetaEnv {
  VITE_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'https://api.jagobumn.com';
console.log('Using API baseURL:', baseURL);

const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // Menambah timeout menjadi 30 detik
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const url = config.url?.toLowerCase() || '';
    let token;

    // Determine which token to use based on URL
    if (url.includes('/questioner/')) {
      token = localStorage.getItem('questioner_token'); // Mengubah format token key
      console.log('Using questioner token for:', url);
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log request details in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Request:', {
        url: `${config.baseURL}${config.url}`,
        method: config.method,
        headers: config.headers,
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
    if (process.env.NODE_ENV === 'development') {
      console.log('Response:', {
        url: response.config.url,
        status: response.status,
        data: response.data
      });
    }
    return response;
  },
  (error) => {
    // Log detailed error information
    console.error('API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
      data: error.response?.data,
      stack: error.stack
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
