interface ImportMetaEnv {
  VITE_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL;
console.log('Using API baseURL:', baseURL);

const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    const url = config.url?.toLowerCase() || '';
    let token;

    // Log full URL yang akan dipanggil
    console.log('Request details:', {
      fullUrl: `${config.baseURL}${config.url}`,
      baseURL: config.baseURL,
      url: config.url,
      method: config.method
    });

    if (url.includes('/admin/')) {
      token = localStorage.getItem('admin-token');
      console.log('Menggunakan admin token');
    } else if (url.includes('/questioner/')) {
      token = localStorage.getItem('questioner-token');
      console.log('Menggunakan questioner token');
    } else {
      token = localStorage.getItem('token');
      console.log('Menggunakan user token');
    }

    console.log('Token yang digunakan:', token);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log request details
    console.log('Request:', {
      url: `${config.baseURL}${config.url}`,
      method: config.method,
      headers: config.headers,
      data: config.data
    });
    
    return config;
  },
  (error) => {
    console.error('Error dalam request interceptor:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    // Log successful response
    console.log('Response:', {
      status: response.status,
      data: response.data,
      headers: response.headers
    });
    return response;
  },
  (error) => {
    // Log detailed error information
    console.error('Response Error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        baseURL: error.config?.baseURL,
        headers: error.config?.headers
      }
    });

    if (error.response?.status === 401) {
      console.log('Unauthorized access, clearing tokens...');
      localStorage.removeItem('token');
      localStorage.removeItem('questioner-token');
      window.location.href = '/auth/login';
    }

    return Promise.reject(error);
  }
);

export default api;
