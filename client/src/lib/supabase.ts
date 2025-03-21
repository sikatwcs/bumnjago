import axios from 'axios';

// Gunakan environment variable untuk base URL
const baseURL = import.meta.env.VITE_API_URL || 'http://157.66.34.226:3000';
const isDevelopment = import.meta.env.MODE === 'development';

const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

console.log('=== API Configuration ===');
console.log(`> Base URL: ${baseURL}`);
console.log(`> Running on: ${isDevelopment ? 'development' : 'production'}`);
console.log('========================');

// Add request interceptor
api.interceptors.request.use(
  (config) => {
    // Get appropriate token based on URL
    let token;
    
    // Jika URL berkaitan dengan admin, gunakan token admin
    if (config.url?.startsWith('/admin')) {
      token = localStorage.getItem('admin-token');
      console.log('Using admin token for admin endpoint:', config.url);
    } 
    // Jika URL berkaitan dengan questioner, gunakan token questioner
    else if (config.url?.startsWith('/questioner')) {
      token = localStorage.getItem('questioner-token');
      console.log('Using questioner token for questioner endpoint:', config.url);
    }
    // Untuk URL lainnya, gunakan token user biasa
    else {
      token = localStorage.getItem('token');
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Pastikan credentials selalu true
    config.withCredentials = true;
    
    console.log('Sending request:', {
      url: config.url,
      baseURL: config.baseURL,
      fullURL: `${config.baseURL}${config.url}`,
      method: config.method,
      headers: config.headers
    });
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor
api.interceptors.response.use(
  (response) => {
    console.log('Response received:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Identifikasi jenis rute dari URL
      const url = error.config?.url || '';
      
      if (url.startsWith('/admin')) {
        // Admin routes - clear admin token and redirect to admin login
        console.log('Admin unauthorized, redirecting to admin login');
        localStorage.removeItem('admin-token');
        window.location.href = '/admin/login';
      } else if (url.startsWith('/questioner')) {
        // Questioner routes - clear questioner token and redirect to questioner login
        console.log('Questioner unauthorized, redirecting to questioner login');
        localStorage.removeItem('questioner-token');
        window.location.href = '/questioner/login';
      } else {
        // User routes - clear token and redirect to login
        console.log('User unauthorized, redirecting to auth');
        localStorage.removeItem('token');
        localStorage.removeItem('loginTime');
        window.location.href = '/auth';
      }
    } else if (error.response) {
      // Server merespons dengan kode status error
      console.error('API Error:', {
        status: error.response.status,
        data: error.response.data,
        url: error.config?.url
      });
    } else if (error.request) {
      // Request dibuat tapi tidak ada respons
      console.error('Network Error:', {
        message: 'No response received',
        code: error.code,
        url: error.config?.url
      });
    } else {
      // Terjadi error saat menyiapkan request
      console.error('Request Error:', error.message);
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