import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { RegisterForm } from '@/components/auth/RegisterForm';
import AuthForm from '@/components/auth/AuthForm';
import api from '@/lib/supabase';

export default function Auth() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(location.search.includes('mode=register'));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;

      // Simpan waktu login
      localStorage.setItem('loginTime', Date.now().toString());
      
      // Login menggunakan context
      login(token, user);

      // Redirect ke halaman yang dituju atau dashboard
      const from = (location.state as any)?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Terjadi kesalahan saat login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {isRegister ? 'Daftar Akun Baru' : 'Login ke Akun Anda'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {isRegister ? (
              <>Sudah punya akun? <button onClick={() => setIsRegister(false)} className="text-red-600 hover:text-red-500 font-medium">Login</button></>
            ) : (
              <>Belum punya akun? <button onClick={() => setIsRegister(true)} className="text-red-600 hover:text-red-500 font-medium">Daftar sekarang</button></>
            )}
          </p>
        </div>
        
        <AuthForm mode={isRegister ? 'register' : 'login'} />
        
        <div className="pt-6 border-t border-gray-200 mt-8">
          <p className="text-center text-sm text-gray-600 mb-4">Login khusus:</p>
          <div className="flex space-x-4 justify-center">
            <button
              onClick={() => navigate('/admin/login')}
              className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Admin
            </button>
            <button
              onClick={() => navigate('/questioner/login')}
              className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
            >
              Questioner
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
