import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'https://api.jagobumn.com/api';

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
    const url = config.url?.toLowerCase() || '';
    
    // Log untuk debugging
    console.log('Using questioner token for endpoint:', config.url);
    
    // Selalu gunakan questioner token untuk semua request
    const token = localStorage.getItem('questioner-token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log request details
    console.log('Sending request to:', `${config.baseURL}${config.url}`);
    
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
    console.log('Response received:', {
      endpoint: response.config.url,
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('Response error:', {
      endpoint: error.config?.url,
      status: error.response?.status,
      message: error.message,
      data: error.response?.data
    });

    // Handle unauthorized access
    if (error.response?.status === 401) {
      localStorage.removeItem('questioner-token');
      window.location.href = '/questioner/login';
    }

    return Promise.reject(error);
  }
);

export default api; 