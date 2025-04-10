import axios from 'axios';

// Gunakan URL dari environment
const baseURL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL,
  // Set withCredentials ke false karena kita menggunakan token
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 10000 // timeout 10 detik
});

console.log('=== API Configuration ===');
console.log(`> Base URL: ${baseURL}`);
console.log(`> Environment: ${import.meta.env.MODE}`);
console.log('========================');

// Add request interceptor untuk logging
api.interceptors.request.use(
  (config) => {
    // Get token based on URL
    let token;
    if (config.url?.startsWith('/admin')) {
      token = localStorage.getItem('admin-token');
    } else {
      token = localStorage.getItem('token');
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log request untuk debugging
    console.log('Request:', {
      url: `${config.baseURL}${config.url}`,
      method: config.method,
      headers: config.headers
    });
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor untuk error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      console.error('API Error:', error.response.status, error.response.data);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// Implementasi mock supabase untuk kompatibilitas dengan kode yang ada
export const supabase = {
  from: (table: string) => {
    return {
      select: () => {
        return {
          order: (column: string, { ascending }: { ascending: boolean }) => {
            return api.get(`/${table}`).then(response => ({
              data: response.data,
              error: null
            }));
          },
          eq: (column: string, value: any) => {
            return api.get(`/${table}?${column}=${value}`).then(response => ({
              data: response.data,
              error: null
            }));
          }
        };
      },
      insert: (data: any) => {
        return api.post(`/${table}`, data).then(response => ({
          data: response.data,
          error: null
        }));
      },
      update: (data: any) => {
        return {
          eq: (column: string, value: any) => {
            return api.put(`/${table}/${value}`, data).then(response => ({
              data: response.data,
              error: null
            }));
          }
        };
      },
      delete: () => {
        return {
          eq: (column: string, value: any) => {
            return api.delete(`/${table}/${value}`).then(response => ({
              data: null,
              error: null
            }));
          }
        };
      }
    };
  },
  storage: {
    from: (bucket: string) => ({
      upload: (path: string, file: any) => {
        const formData = new FormData();
        formData.append('file', file);
        return api.post(`/upload/${bucket}/${path}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }).then(response => ({
          data: { path: response.data.path },
          error: null
        }));
      }
    })
  },
  auth: {
    signOut: () => {
      localStorage.removeItem('token');
      return Promise.resolve({ error: null });
    }
  }
};

console.log(`API configured to use: ${baseURL}`);

export default api; 