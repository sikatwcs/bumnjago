interface ImportMetaEnv {
  VITE_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

import axios from 'axios';

const baseURL = `${import.meta.env.VITE_API_URL}/api`;
console.log('Using API baseURL:', baseURL);

const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token') || localStorage.getItem('questioner-token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('questioner-token');
      window.location.href = '/questioner/login';
    }
    return Promise.reject(error);
  }
);

export default api;
