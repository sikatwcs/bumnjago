import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/supabase';

const BUMN_LIST = [
  'AirNav Indonesia',
  'ASDP',
  'Barata Indonesia',
  'BNI',
  'BRI',
  'BTN',
  'Biofarma',
  'Bulog',
  'DAMRI',
  'Danareksa',
  'Jasamarga',
  'Jasa Tirta 1',
  'KAI',
  'LEN',
  'MIND ID',
  'Mandiri',
  'Pupuk Indonesia',
  'Pelindo',
  'Pelni',
  'Perhutani',
  'Perkebunan Nusantara',
  'Peruri',
  'PLN',
  'PP',
  'Pos Indonesia',
  'SIG',
  'Taspen',
  'Telkom Indonesia',
  'Waskita',
  'WIKA'
];

const PROVINCES = [
  'Aceh',
  'Bali',
  'Bangka Belitung',
  'Banten',
  'Bengkulu',
  'DI Yogyakarta',
  'DKI Jakarta',
  'Gorontalo',
  'Jambi',
  'Jawa Barat',
  'Jawa Tengah',
  'Jawa Timur',
  'Kalimantan Barat',
  'Kalimantan Tengah',
  'Kalimantan Timur',
  'Kalimantan Utara',
  'Kepulauan Riau',
  'Lampung',
  'Maluku',
  'Maluku Utara',
  'Nusa Tenggara Barat',
  'Nusa Tenggara Timur',
  'Papua',
  'Papua Barat',
  'Riau',
  'Sulawesi Barat',
  'Sulawesi Selatan',
  'Sulawesi Tengah',
  'Sulawesi Tenggara',
  'Sulawesi Utara',
  'Sumatera Barat',
  'Sumatera Selatan',
  'Sumatera Utara'
];

interface AuthFormProps {
  mode: 'login' | 'register';
}

export default function AuthForm({ mode }: AuthFormProps) {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  const [registerData, setRegisterData] = useState({
    email: '',
    password: '',
    name: '',
    province: '',
    phone: '',
    gender: 'male',
    instance: ''
  });

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setRegisterData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      console.log('Login attempt:', loginData.email);
      const response = await api.post('/auth/login', loginData);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('loginTime', Date.now().toString());
        
        // Login dengan context
        login(response.data.token, response.data.user);

        // Redirect ke dashboard
        navigate('/dashboard');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Error logging in');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      console.log('Register data:', registerData);
      const response = await api.post('/auth/register', registerData);
      const { token, user } = response.data;

      // Simpan token dan data
      localStorage.setItem('token', token);
      localStorage.setItem('loginTime', Date.now().toString());
      
      // Login dengan context
      login(token, user);

      // Redirect ke dashboard
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.response?.data?.message || 'Error creating account');
    } finally {
      setIsLoading(false);
    }
  };

  // Form Login
  if (mode === 'login') {
    return (
      <form onSubmit={handleLogin} className="space-y-6">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            required
            value={loginData.email}
            onChange={handleLoginChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            required
            value={loginData.password}
            onChange={handleLoginChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
          />
        </div>
        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            {isLoading ? 'Loading...' : 'Masuk'}
          </button>
        </div>
      </form>
    );
  }

  // Form Register
  return (
    <form onSubmit={handleRegister} className="space-y-6">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          required
          value={registerData.email}
          onChange={handleRegisterChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          required
          value={registerData.password}
          onChange={handleRegisterChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
        />
      </div>
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nama Lengkap</label>
        <input
          id="name"
          name="name"
          type="text"
          required
          value={registerData.name}
          onChange={handleRegisterChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
        />
      </div>
      <div>
        <label htmlFor="province" className="block text-sm font-medium text-gray-700">Provinsi</label>
        <select
          id="province"
          name="province"
          required
          value={registerData.province}
          onChange={handleRegisterChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
        >
          <option value="">Pilih Provinsi</option>
          {PROVINCES.map((province) => (
            <option key={province} value={province}>
              {province}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Nomor Telepon</label>
        <input
          id="phone"
          name="phone"
          type="tel"
          required
          value={registerData.phone}
          onChange={handleRegisterChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
        />
      </div>
      <div>
        <label htmlFor="gender" className="block text-sm font-medium text-gray-700">Jenis Kelamin</label>
        <select
          id="gender"
          name="gender"
          required
          value={registerData.gender}
          onChange={handleRegisterChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
        >
          <option value="male">Laki-laki</option>
          <option value="female">Perempuan</option>
        </select>
      </div>
      <div>
        <label htmlFor="instance" className="block text-sm font-medium text-gray-700">Instansi BUMN</label>
        <select
          id="instance"
          name="instance"
          required
          value={registerData.instance}
          onChange={handleRegisterChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
        >
          <option value="">Pilih Instansi</option>
          {BUMN_LIST.map((bumn) => (
            <option key={bumn} value={bumn}>
              {bumn}
            </option>
          ))}
        </select>
      </div>
      <div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          {isLoading ? 'Mendaftar...' : 'Daftar'}
        </button>
      </div>
    </form>
  );
}