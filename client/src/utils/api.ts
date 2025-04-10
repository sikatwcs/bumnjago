import axios from 'axios';

// Dapatkan base URL dari environment variable
const baseURL = import.meta.env.VITE_API_URL;

console.log('API Base URL:', baseURL);

const api = axios.create({
  baseURL,
  // Ubah withCredentials menjadi false karena kita menggunakan token
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Add request interceptor untuk menambahkan token
api.interceptors.request.use(
  (config) => {
    // Ambil token dari localStorage
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log request untuk debugging
    console.log('Request:', {
      url: config.url,
      method: config.method,
      headers: config.headers,
      data: config.data,
      baseURL: config.baseURL
    });
    
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor untuk debugging
api.interceptors.response.use(
  (response) => {
    console.log('Response:', {
      status: response.status,
      headers: response.headers,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('Response Error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default api;