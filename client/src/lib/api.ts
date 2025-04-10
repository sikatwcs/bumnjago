import axios from 'axios';

// Base API instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false
});

// Admin API instance
export const adminAPI = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false
});

// Request interceptor untuk token
const addAuthHeader = (config: any) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

// Response interceptor untuk handling error
const handleResponse = (response: any) => response;
const handleError = (error: any) => {
  if (error.response?.status === 401) {
    localStorage.removeItem('token');
    window.location.href = '/login';
  }
  return Promise.reject(error);
};

// Tambahkan interceptors ke instance api
api.interceptors.request.use(addAuthHeader);
api.interceptors.response.use(handleResponse, handleError);

// Tambahkan interceptors ke instance adminAPI
adminAPI.interceptors.request.use(addAuthHeader);
adminAPI.interceptors.response.use(handleResponse, handleError);

export default api;