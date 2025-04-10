import axios from 'axios';

// Base API instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  // Penting: set withCredentials ke false
  withCredentials: false
});

// Admin API methods
export const adminAPI = {
  // Tryout
  getTryoutLists: () => api.get('/admin/tryouts'),
  createTryout: (data: any) => api.post('/admin/tryouts', data),
  updateTryout: (id: string, data: any) => api.put(`/admin/tryouts/${id}`, data),
  deleteTryout: (id: string) => api.delete(`/admin/tryouts/${id}`),
  
  // Questions
  getTryoutQuestions: (tryoutId: string) => api.get(`/admin/tryouts/${tryoutId}/questions`),
  createTryoutQuestion: (tryoutId: string, data: any) => api.post(`/admin/tryouts/${tryoutId}/questions`, data),
  updateTryoutQuestion: (tryoutId: string, questionId: string, data: any) => 
    api.put(`/admin/tryouts/${tryoutId}/questions/${questionId}`, data),
  deleteTryoutQuestion: (tryoutId: string, questionId: string) => 
    api.delete(`/admin/tryouts/${tryoutId}/questions/${questionId}`),
  
  // Users/Profiles
  getProfiles: () => api.get('/admin/profiles'),
  
  // Image upload
  uploadImage: (formData: FormData) => {
    return api.post('/admin/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

// Request interceptor untuk menambahkan token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor untuk handling unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

export default api;