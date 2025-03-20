import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://157.66.34.226:3000',
  withCredentials: true
});

export default api; 