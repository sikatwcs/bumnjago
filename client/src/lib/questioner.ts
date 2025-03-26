import axios from 'axios';

// Gunakan base URL yang konsisten
const baseURL = 'https://api.jagobumn.com/api';

console.log('=== Questioner API Configuration ===');
console.log('Base URL:', baseURL);
console.log('============================');

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
    
    console.log('Questioner API Request:', {
      url: config.url,
      method: config.method,
      baseURL: config.baseURL,
      token: token ? 'present' : 'not present'
    });
    
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

    // Hanya redirect jika benar-benar unauthorized
    if (error.response?.status === 401 && window.location.pathname !== '/questioner/login') {
      localStorage.removeItem('questioner-token');
      window.location.href = '/questioner/login';
    }

    return Promise.reject(error);
  }
);

export default api; 