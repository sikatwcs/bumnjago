import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/utils/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  institution: string;
  idCard: File | null;
}

const FreeTryoutForm = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    phone: "",
    institution: "",
    idCard: null,
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast.error("Ukuran file terlalu besar. Maksimal 2MB");
        return;
      }
      setFormData({ ...formData, idCard: file });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Generate unique tryout ID
      const tryoutId = `TO-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Simulate API call - in real app, this would be a server request
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Store tryout ID in localStorage (in real app, this would be in a database)
      const userTryouts = JSON.parse(localStorage.getItem('userTryouts') || '{}');
      userTryouts[user?.id] = [...(userTryouts[user?.id] || []), tryoutId];
      localStorage.setItem('userTryouts', JSON.stringify(userTryouts));

      toast.success("Pendaftaran tryout gratis berhasil!");
      navigate(`/exam/${tryoutId}`);
    } catch (error) {
      toast.error("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900">Daftar Tryout Gratis</h1>
            <p className="text-gray-600 mt-2">
              Isi form berikut untuk mendapatkan akses tryout gratis
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="fullName">Nama Lengkap</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="phone">Nomor Telepon</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="institution">Institusi/Sekolah</Label>
              <Input
                id="institution"
                value={formData.institution}
                onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="idCard">Upload Kartu Identitas</Label>
              <div className="mt-1">
                <Input
                  id="idCard"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  required
                  className="mt-1"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Format: JPG, PNG. Maksimal 2MB
                </p>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Memproses..." : "Daftar Sekarang"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FreeTryoutForm; 