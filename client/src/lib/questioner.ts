import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'https://api.jagobumn.com';
console.log('=== Questioner API Configuration ===');
console.log('Base URL:', baseURL);
console.log('============================');

const api = axios.create({
  baseURL: `${baseURL}/api`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Log untuk debugging
    console.log('Questioner API Request:', {
      url: config.url,
      method: config.method,
      baseURL: config.baseURL
    });
    
    const token = localStorage.getItem('questioner-token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('Token:', token);
    
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
    console.log('Response success:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('Response error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
      data: error.response?.data
    });

    if (error.response?.status === 401) {
      localStorage.removeItem('questioner-token');
      window.location.href = '/questioner/login';
    }

    return Promise.reject(error);
  }
);

export default api; 