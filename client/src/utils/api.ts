import axios from 'axios';

// Dapatkan base URL dari environment variable
const baseURL = import.meta.env.VITE_API_URL;
// const baseURL = 'http://157.66.34.226:3000'; // Hapus atau komentar

console.log('API Base URL:', baseURL); // Untuk debugging

const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Add request interceptor untuk debugging
api.interceptors.request.use(
  (config) => {
    // Pastikan credentials selalu true untuk setiap request
    config.withCredentials = true;
    
    // Pastikan credentials disertakan
    if (config.headers) {
      config.headers['Access-Control-Allow-Credentials'] = 'true';
    }
    
    // Log request untuk debugging
    console.log('Request:', {
      url: config.url,
      method: config.method,
      headers: config.headers,
      data: config.data,
      baseURL: config.baseURL,
      withCredentials: config.withCredentials
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
    return Promise.reject(error);
  }
);

export default api; 