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
    // Cek token berdasarkan tipe endpoint
    const url = config.url || '';
    
    // Admin endpoints
    if (url.includes('/admin')) {
      // Jangan tambahkan header Authorization untuk login admin
      if (!url.includes('/admin/login')) {
        const adminToken = localStorage.getItem('admin-token');
        if (adminToken) {
          config.headers.Authorization = `Bearer ${adminToken}`;
        }
      }
    } 
    // Questioner endpoints
    else if (url.includes('/questioner')) {
      const questionerToken = localStorage.getItem('questioner-token');
      if (questionerToken) {
        config.headers.Authorization = `Bearer ${questionerToken}`;
      }
    } 
    // User/auth endpoints
    else {
      const userToken = localStorage.getItem('token');
      if (userToken) {
        config.headers.Authorization = `Bearer ${userToken}`;
      }
    }

    // Log request in development atau jika URL contains /admin/login
    if (process.env.NODE_ENV === 'development' || url.includes('/admin/login')) {
      console.log('API Request:', {
        method: config.method,
        url: config.url,
        baseURL: config.baseURL,
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
    const url = response.config.url || '';
    
    // Log response in development atau jika URL contains /admin/login
    if (process.env.NODE_ENV === 'development' || url.includes('/admin/login')) {
      console.log('API Response:', {
        status: response.status,
        url: response.config.url,
        data: response.data
      });
    }
    return response;
  },
  (error) => {
    // Log error details dengan informasi lebih detail
    const url = error.config?.url || '';
    
    console.error('API Error:', {
      message: error.message,
      url: url,
      method: error.config?.method,
      baseURL: error.config?.baseURL,
      fullURL: error.config?.baseURL + url,
      status: error.response?.status,
      statusText: error.response?.statusText,
      response: error.response?.data,
      request: error.config?.data
    });

    // Handle 401 Unauthorized berdasarkan tipe endpoint
    if (error.response?.status === 401) {
      if (url.includes('/admin')) {
        localStorage.removeItem('admin-token');
        window.location.href = '/admin/login';
      } 
      else if (url.includes('/questioner')) {
        localStorage.removeItem('questioner-token');
        window.location.href = '/questioner/login';
      }
      else {
        localStorage.removeItem('token');
        window.location.href = '/auth';
      }
    }

    return Promise.reject(error);
  }
);

// Helper functions for common API calls

// Admin API calls
export const adminAPI = {
  login: async (email: string, password: string) => {
    try {
      console.log('Calling admin login with:', { email, password: '******' });
      return await api.post('/admin/login', { email, password });
    } catch (error) {
      console.error('Admin login API call failed:', error);
      throw error;
    }
  },
  getProfile: async () => {
    return api.get('/admin/profile');
  },
  getProfiles: async () => {
    return api.get('/admin/profiles');
  },
  getTryoutLists: async () => {
    return api.get('/admin-tryout/tryoutlists');
  },
  createTryout: async (data: any) => {
    return api.post('/admin-tryout/tryoutlists', data);
  },
  updateTryout: async (id: string, data: any) => {
    return api.put(`/admin-tryout/tryoutlists/${id}`, data);
  },
  deleteTryout: async (id: string) => {
    return api.delete(`/admin-tryout/tryoutlists/${id}`);
  },
  // Tambah endpoint untuk manajemen soal tryout
  getTryoutQuestions: async (tryoutId: string) => {
    return api.get(`/admin-tryout/tryoutlists/${tryoutId}/questions`);
  },
  createTryoutQuestion: async (tryoutId: string, data: any) => {
    return api.post(`/admin-tryout/tryoutlists/${tryoutId}/questions`, data);
  },
  updateTryoutQuestion: async (tryoutId: string, questionId: string, data: any) => {
    return api.put(`/admin-tryout/tryoutlists/${tryoutId}/questions/${questionId}`, data);
  },
  deleteTryoutQuestion: async (tryoutId: string, questionId: string) => {
    return api.delete(`/admin-tryout/tryoutlists/${tryoutId}/questions/${questionId}`);
  },
  // Endpoint untuk upload gambar
  uploadImage: async (formData: FormData) => {
    return api.post('/admin/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
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
  getQuestions: async () => {
    return api.get('/questioner/questions');
  },
  createQuestion: async (data: any) => {
    return api.post('/questioner/questions', data);
  },
  updateQuestion: async (id: string, data: any) => {
    return api.put(`/questioner/questions/${id}`, data);
  },
  deleteQuestion: async (id: string) => {
    return api.delete(`/questioner/questions/${id}`);
  },
  // Upload gambar untuk soal
  uploadImage: async (formData: FormData) => {
    return api.post('/questioner/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
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
  },
  getTryoutById: async (id: string) => {
    return api.get(`/tryout/${id}`);
  },
  submitTryoutAnswers: async (tryoutId: string, answers: any) => {
    return api.post(`/tryout/${tryoutId}/submit`, { answers });
  }
};

export default api;
