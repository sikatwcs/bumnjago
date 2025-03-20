import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/supabase';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

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

export function RegisterForm() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    province: '',
    phone: '',
    gender: 'male',
    instance: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await api.post('/auth/register', formData);
      const { token, user } = response.data;

      // Simpan waktu login
      localStorage.setItem('loginTime', Date.now().toString());
      
      // Login menggunakan context
      login(token, user);

      // Redirect ke dashboard
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.response?.data?.message || 'Terjadi kesalahan saat registrasi');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          required
          className="w-full"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">Nama Lengkap</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="province">Provinsi</Label>
        <Input
          id="province"
          name="province"
          value={formData.province}
          onChange={handleChange}
          required
          className="w-full"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Nomor Telepon</Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          value={formData.phone}
          onChange={handleChange}
          required
          className="w-full"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="gender">Jenis Kelamin</Label>
        <select
          id="gender"
          name="gender"
          value={formData.gender}
          onChange={handleChange}
          required
          className="w-full border rounded-md p-2"
        >
          <option value="male">Laki-laki</option>
          <option value="female">Perempuan</option>
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="instance">Instansi BUMN</Label>
        <select
          id="instance"
          name="instance"
          value={formData.instance}
          onChange={handleChange}
          required
          className="w-full border rounded-md p-2"
        >
          <option value="">Pilih Instansi</option>
          {BUMN_LIST.map((bumn) => (
            <option key={bumn} value={bumn}>
              {bumn}
            </option>
          ))}
        </select>
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={isLoading}
      >
        {isLoading ? 'Mendaftar...' : 'Daftar'}
      </Button>

      <div className="text-center text-sm">
        Sudah punya akun?{' '}
        <a href="/auth" className="text-red-600 hover:text-red-700 font-medium">
          Login
        </a>
      </div>
    </form>
  );
} 