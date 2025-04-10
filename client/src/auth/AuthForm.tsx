import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';

interface AuthFormProps {
  mode: 'login' | 'register';
}

const AuthForm = ({ mode }: AuthFormProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (mode === 'register') {
      if (!formData.name.trim()) {
        newErrors.name = 'Nama harus diisi';
      }
      
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Password tidak cocok';
      }
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email harus diisi';
    } else if (!formData.email.includes('@')) {
      newErrors.email = 'Email tidak valid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password harus diisi';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password minimal 6 karakter';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user types
    setErrors(prev => ({ ...prev, [name]: '' }));
  };
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      console.log('Login attempt:', formData.email);
      const response = await api.post('/auth/login', {
        email: formData.email,
        password: formData.password
      }, {
        withCredentials: false
      });
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('loginTime', Date.now().toString());
        
        login(response.data.token, response.data.user);
        navigate('/dashboard');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setErrors({
        email: err.response?.data?.message || 'Error logging in',
        password: err.response?.data?.message || 'Error logging in'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      console.log('Register data:', formData);
      const response = await api.post('/auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password
      }, {
        withCredentials: false
      });
      
      const { token, user } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('loginTime', Date.now().toString());
      
      login(token, user);
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Registration error:', err);
      setErrors({
        name: err.response?.data?.message || 'Error creating account',
        email: err.response?.data?.message || 'Error creating account',
        password: err.response?.data?.message || 'Error creating account',
        confirmPassword: err.response?.data?.message || 'Error creating account'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="px-8 pt-8 pb-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <h2 className="text-2xl font-bold text-center">
            {mode === 'login' ? 'Selamat datang kembali' : 'Buat akun baru'}
          </h2>
          <p className="text-blue-100 text-center mt-2">
            {mode === 'login' 
              ? 'Masuk ke akun Anda' 
              : 'Bergabung untuk mengikuti ujian'}
          </p>
        </div>
        
        <div className="p-8">
          <form onSubmit={mode === 'login' ? handleLogin : handleRegister} className="space-y-4">
            {mode === 'register' && (
              <div className="space-y-2">
                <Label htmlFor="name">Nama Lengkap</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Masukkan nama Anda"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className={`input-field ${errors.name ? 'border-red-500' : ''}`}
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name}</p>
                )}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Masukkan email Anda"
                value={formData.email}
                onChange={handleChange}
                required
                className={`input-field ${errors.email ? 'border-red-500' : ''}`}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Masukkan password"
                value={formData.password}
                onChange={handleChange}
                required
                className={`input-field ${errors.password ? 'border-red-500' : ''}`}
              />
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password}</p>
              )}
            </div>
            
            {mode === 'register' && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Konfirmasi password Anda"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className={`input-field ${errors.confirmPassword ? 'border-red-500' : ''}`}
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-red-500">{errors.confirmPassword}</p>
                )}
              </div>
            )}
            
            <Button
              type="submit"
              className="w-full mt-6 btn-primary"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                  </svg>
                  {mode === 'login' ? 'Sedang masuk...' : 'Membuat akun...'}
                </span>
              ) : (
                mode === 'login' ? 'Masuk' : 'Buat Akun'
              )}
            </Button>
          </form>
          
          <div className="mt-6 text-center text-sm">
            {mode === 'login' ? (
              <p className="text-gray-600">
                Belum punya akun?{' '}
                <a
                  href="/auth?mode=register"
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Daftar
                </a>
              </p>
            ) : (
              <p className="text-gray-600">
                Sudah punya akun?{' '}
                <a
                  href="/auth?mode=login"
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Masuk
                </a>
              </p>
            )}
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-center text-gray-500">
              Dengan melanjutkan, Anda menyetujui{' '}
              <a href="/terms" className="text-blue-600 hover:text-blue-800">
                Ketentuan Layanan
              </a>{' '}
              dan{' '}
              <a href="/privacy-policy" className="text-blue-600 hover:text-blue-800">
                Kebijakan Privasi
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
