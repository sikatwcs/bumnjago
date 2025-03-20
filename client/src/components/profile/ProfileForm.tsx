import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { User, Briefcase, MapPin, Phone } from 'lucide-react';

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

interface ProfileFormData {
  name: string;
  province: string;
  phone: string;
  gender: 'male' | 'female';
  instance: string;
}

export function ProfileForm() {
  const navigate = useNavigate();
  const { user, profile, fetchProfile, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<ProfileFormData>({
    name: '',
    province: '',
    phone: '',
    gender: 'male',
    instance: ''
  });
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        province: profile.province || '',
        phone: profile.phone || '',
        gender: profile.gender || 'male',
        instance: profile.instance || ''
      });
    } else {
      fetchProfile();
    }
  }, [profile, fetchProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);
      
      await updateProfile(formData);
      
      setSuccess(true);
      toast('Profil berhasil diperbarui!', {
        position: 'top-center',
      });
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError(err.response?.data?.message || 'Gagal memperbarui profil');
      toast.error('Gagal memperbarui profil', { 
        description: err.response?.data?.message || 'Terjadi kesalahan',
        position: 'top-center',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (value: string, name: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading && !formData.name) {
    return <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg">
          Profil berhasil diperbarui!
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">Email</Label>
          <Input
            id="email"
            value={user?.email || ''}
            disabled
            className="bg-gray-50"
          />
          <p className="text-sm text-gray-500">Email tidak dapat diubah</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-medium">Nama Lengkap</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="pl-10"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="province" className="text-sm font-medium">Provinsi</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Select
              value={formData.province}
              onValueChange={(value) => handleSelectChange(value, 'province')}
            >
              <SelectTrigger id="province" className="pl-10">
                <SelectValue placeholder="Pilih Provinsi" />
              </SelectTrigger>
              <SelectContent>
                {PROVINCES.map((province) => (
                  <SelectItem key={province} value={province}>
                    {province}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" className="text-sm font-medium">Nomor Telepon/WhatsApp</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              required
              className="pl-10"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="gender" className="text-sm font-medium">Jenis Kelamin</Label>
          <Select
            value={formData.gender}
            onValueChange={(value) => handleSelectChange(value, 'gender')}
          >
            <SelectTrigger id="gender">
              <SelectValue placeholder="Pilih Jenis Kelamin" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Laki-laki</SelectItem>
              <SelectItem value="female">Perempuan</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="instance" className="text-sm font-medium">Instansi/Sekolah</Label>
          <div className="relative">
            <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Select
              value={formData.instance}
              onValueChange={(value) => handleSelectChange(value, 'instance')}
            >
              <SelectTrigger id="instance" className="pl-10">
                <SelectValue placeholder="Pilih Instansi" />
              </SelectTrigger>
              <SelectContent>
                {BUMN_LIST.map((bumn) => (
                  <SelectItem key={bumn} value={bumn}>
                    {bumn}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Card className="bg-blue-50 border-blue-200 mt-8">
        <CardContent className="p-4">
          <div className="flex items-start">
            <div className="bg-blue-100 p-2 rounded-full">
              <User className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="font-medium text-blue-800">Informasi Akun</h3>
              <p className="text-sm text-blue-700 mt-1">
                Data profil Anda digunakan untuk personalisasi pengalaman belajar dan sertifikat tryout.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end pt-4">
        <Button
          type="submit"
          className="w-full md:w-auto"
          disabled={loading}
        >
          {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
        </Button>
      </div>
    </form>
  );
} 