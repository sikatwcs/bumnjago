import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut, Plus, Edit, Trash, Loader2 } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/supabase";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface TryoutList {
  id: string;
  title: string;
  price: number;
  imageUrl?: string;
  description?: string;
  batch: number;
  type: 'TKD_BUMN' | 'AKHLAK_BUMN' | 'TWK_BUMN';
  status: boolean;
  isOnline: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Profile {
  id: number;
  userId: number;
  name: string;
  province: string;
  phone: string;
  gender: 'male' | 'female';
  instance: string;
  createdAt: string;
  updatedAt: string;
  user: {
    email: string;
  };
}

interface User {
  id: string;
  email: string;
  profile: Profile | null;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { admin, logout } = useAdminAuth();
  const [activeTab, setActiveTab] = useState("exams");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // TryoutLists state
  const [tryoutLists, setTryoutLists] = useState<TryoutList[]>([]);
  const [currentTryout, setCurrentTryout] = useState<Partial<TryoutList>>({
    title: '',
    price: 0,
    description: '',
    batch: 1,
    type: 'TKD_BUMN',
    status: true,
    isOnline: true,
  });

  // Users state
  const [profiles, setProfiles] = useState<Profile[]>([]);

  useEffect(() => {
    if (!admin) {
      navigate('/admin/login');
    } else {
      loadData();
    }
  }, [admin, navigate]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [tryoutListsRes, profilesRes] = await Promise.all([
        api.get('/admin-tryout/tryoutlists'),
        api.get('/admin/profiles')
      ]);

      setTryoutLists(tryoutListsRes.data);
      setProfiles(profilesRes.data);
    } catch (error) {
      toast.error("Gagal memuat data");
    } finally {
      setIsLoading(false);
    }
  };

  // TryoutList handlers
  const handleSaveTryout = async () => {
    try {
      setIsSaving(true);
      if (currentTryout.id) {
        await api.put(`/admin-tryout/tryoutlists/${currentTryout.id}`, currentTryout);
        toast.success('Tryout berhasil diperbarui');
      } else {
        await api.post('/admin-tryout/tryoutlists', currentTryout);
        toast.success('Tryout berhasil ditambahkan');
      }
      setCurrentTryout({
        title: '',
        price: 0,
        description: '',
        batch: 1,
        type: 'TKD_BUMN',
        status: true,
        isOnline: true,
      });
      loadData();
    } catch (error) {
      toast.error('Gagal menyimpan tryout');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteTryout = async (id: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus tryout ini?')) {
      try {
        await api.delete(`/admin-tryout/tryoutlists/${id}`);
        toast.success('Tryout berhasil dihapus');
        loadData();
      } catch (error) {
        toast.error('Gagal menghapus tryout');
      }
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  // Reset form ketika dialog ditutup
  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setCurrentTryout({
      title: '',
      price: 0,
      description: '',
      batch: 1,
      type: 'TKD_BUMN',
      status: true,
      isOnline: true,
    });
  };

  // Handle edit tryout
  const handleEditTryout = (tryout: TryoutList) => {
    setCurrentTryout({
      id: tryout.id,
      title: tryout.title,
      price: Number(tryout.price),
      description: tryout.description,
      batch: tryout.batch,
      type: tryout.type,
      status: tryout.status,
      isOnline: tryout.isOnline,
      imageUrl: tryout.imageUrl
    });
    setIsDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">Admin Dashboard</h1>
            </div>
            <div className="flex items-center">
              <Button variant="ghost" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="exams">Ujian</TabsTrigger>
            <TabsTrigger value="users">Pengguna Terdaftar</TabsTrigger>
          </TabsList>

          {/* Exams Tab */}
          <TabsContent value="exams">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-medium">Daftar Ujian</h2>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => setCurrentTryout({
                      title: '',
                      price: 0,
                      description: '',
                      batch: 1,
                      type: 'TKD_BUMN',
                      status: true,
                      isOnline: true,
                    })}>
                      <Plus className="w-4 h-4 mr-2" />
                      Tambah Ujian
                    </Button>
                  </DialogTrigger>
                  <DialogContent onInteractOutside={handleDialogClose}>
                    <DialogHeader>
                      <DialogTitle>
                        {currentTryout.id ? "Edit Ujian" : "Tambah Ujian"}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Judul</Label>
                        <Input
                          value={currentTryout.title}
                          onChange={(e) =>
                            setCurrentTryout({ ...currentTryout, title: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <Label>Harga</Label>
                        <Input
                          type="number"
                          value={currentTryout.price}
                          onChange={(e) =>
                            setCurrentTryout({ ...currentTryout, price: parseInt(e.target.value) })
                          }
                        />
                      </div>
                      <div>
                        <Label>Deskripsi</Label>
                        <Textarea
                          value={currentTryout.description}
                          onChange={(e) =>
                            setCurrentTryout({ ...currentTryout, description: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <Label>Batch</Label>
                        <Input
                          type="number"
                          value={currentTryout.batch}
                          onChange={(e) =>
                            setCurrentTryout({ ...currentTryout, batch: parseInt(e.target.value) })
                          }
                        />
                      </div>

                      <div>
                        <Label>Status</Label>
                        <Select
                          value={currentTryout.status ? "active" : "inactive"}
                          onValueChange={(value) =>
                            setCurrentTryout({ ...currentTryout, status: value === "active" })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Aktif</SelectItem>
                            <SelectItem value="inactive">Tidak Aktif</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Metode </Label>
                        <Select
                          value={currentTryout.isOnline ? "online" : "offline"}
                          onValueChange={(value) =>
                            setCurrentTryout({ ...currentTryout, isOnline: value === "online" })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih metode" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="online">Online</SelectItem>
                            <SelectItem value="offline">Offline</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>URL Gambar (opsional)</Label>
                        <Input
                          value={currentTryout.imageUrl || ""}
                          onChange={(e) =>
                            setCurrentTryout({ ...currentTryout, imageUrl: e.target.value })
                          }
                        />
                      </div>
                      <Button
                        onClick={handleSaveTryout}
                        className="w-full"
                        disabled={isSaving}
                      >
                        {isSaving ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Menyimpan...
                          </>
                        ) : (
                          "Simpan"
                        )}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Judul</TableHead>
                      <TableHead>Harga</TableHead>
                      <TableHead>Batch</TableHead>
                      <TableHead>Tipe</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Metode</TableHead>
                      <TableHead>Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tryoutLists.map((tryout) => (
                      <TableRow key={tryout.id}>
                        <TableCell>{tryout.title}</TableCell>
                        <TableCell>Rp {tryout.price.toLocaleString()}</TableCell>
                        <TableCell>{tryout.batch}</TableCell>
                        <TableCell>{tryout.type}</TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              tryout.status
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {tryout.status ? "Aktif" : "Tidak Aktif"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              tryout.isOnline
                                ? "bg-blue-100 text-blue-800"
                                : "bg-orange-100 text-orange-800"
                            }`}
                          >
                            {tryout.isOnline ? "Online" : "Offline"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditTryout(tryout)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteTryout(tryout.id)}
                            >
                              <Trash className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="mb-6">
                <h2 className="text-lg font-medium">Daftar Pengguna Terdaftar</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Data profil pengguna yang telah terdaftar
                </p>
              </div>

              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nama Lengkap</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Provinsi</TableHead>
                        <TableHead>Telepon</TableHead>
                        <TableHead>Gender</TableHead>
                        <TableHead>Instansi</TableHead>
                        <TableHead>Terdaftar</TableHead>
                        <TableHead>Terakhir Diperbarui</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {profiles.map((profile) => (
                        <TableRow key={profile.id}>
                          <TableCell className="font-medium">{profile.name}</TableCell>
                          <TableCell>{profile.user.email}</TableCell>
                          <TableCell>{profile.province}</TableCell>
                          <TableCell>{profile.phone}</TableCell>
                          <TableCell>
                            {profile.gender === 'male' ? 'Laki-laki' : 'Perempuan'}
                          </TableCell>
                          <TableCell>{profile.instance}</TableCell>
                          <TableCell>
                            {new Date(profile.createdAt).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </TableCell>
                          <TableCell>
                            {new Date(profile.updatedAt).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard; 