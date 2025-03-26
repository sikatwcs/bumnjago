import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'https://api.jagobumn.com';

const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('questioner-token');
    
    // Log untuk debugging
    console.log('Request URL:', `${config.baseURL}${config.url}`);
    console.log('Token:', token ? 'Present' : 'Not found');
    
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
    console.log('Response success:', {
      url: response.config.url,
      status: response.status
    });
    return response;
  },
  (error) => {
    console.error('Response error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message
    });

    if (error.response?.status === 401) {
      localStorage.removeItem('questioner-token');
      window.location.href = '/questioner/login';
    }

    return Promise.reject(error);
  }
);

export default api; 