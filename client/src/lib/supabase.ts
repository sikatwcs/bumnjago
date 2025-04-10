import axios from 'axios';

const baseURL = 'https://api.jagobumn.com';

const api = axios.create({
  baseURL,
  withCredentials: true,
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
    
    console.log(`Sending request to: ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor
api.interceptors.response.use(
  (response) => {
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
      console.error('API Error:', error.response.status, error.response.data);
    } else if (error.request) {
      // Request dibuat tapi tidak ada respons
      console.error('API Error: No response received', error.request);
      if (error.code === 'ECONNABORTED') {
        console.error('API Error: Request timeout. Server mungkin sedang sibuk atau tidak tersedia.');
      }
    } else {
      // Terjadi error saat menyiapkan request
      console.error('API Error:', error.message);
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