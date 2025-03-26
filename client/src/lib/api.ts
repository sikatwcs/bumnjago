interface ImportMetaEnv {
  VITE_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'https://api.jagobumn.com/api';
console.log('Using API baseURL:', baseURL);

const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const url = config.url?.toLowerCase() || '';
    let token;

    // Log request details
    console.log('Request URL:', url);

    // Determine which token to use based on URL
    if (url.includes('/admin/') || url.includes('/admin-tryout/')) {
      token = localStorage.getItem('admin-token');
      console.log('Using admin token for admin endpoint:', url);
    } else if (url.includes('/questioner/')) {
      token = localStorage.getItem('questioner-token');
      console.log('Using questioner token for questioner endpoint:', url);
    } else {
      token = localStorage.getItem('token');
      console.log('Using user token for endpoint:', url);
    }

    // Log full request URL
    console.log('Sending request to:', `${config.baseURL}${config.url}`);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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
    // Log successful response
    console.log('Response received:', {
      endpoint: response.config.url,
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    // Log error response
    console.error('Response error:', {
      endpoint: error.config?.url,
      status: error.response?.status,
      message: error.message,
      data: error.response?.data
    });

    // Handle unauthorized access based on URL path
    if (error.response?.status === 401) {
      const url = error.config?.url?.toLowerCase() || '';
      
      if (url.includes('/admin/') || url.includes('/admin-tryout/')) {
        localStorage.removeItem('admin-token');
        window.location.href = '/admin/login';
      } else if (url.includes('/questioner/')) {
        localStorage.removeItem('questioner-token');
        window.location.href = '/questioner/login';
      } else {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
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
    return api.post('/questioner/login', { email, password });
  },
  getProfile: async () => {
    return api.get('/questioner/profile');
  },
  getTryoutLists: async () => {
    return api.get('/questioner/tryoutlists');
  },
  getTryoutDetails: async (id: number) => {
    return api.get(`/questioner/tryouts/${id}`);
  },
  createQuestion: async (data: any) => {
    return api.post('/questioner/tryouts', data);
  },
  updateQuestion: async (id: number, data: any) => {
    return api.put(`/questioner/tryouts/${id}`, data);
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
