import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuestionerAuth } from "@/contexts/QuestionerAuthContext";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogOut, Plus, Save, Trash, Image as ImageIcon, Loader2 } from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";

interface Tryout {
  id: number;
  tryoutListId: number;
  number: number;
  question: string;
  explanation: string;
  imageUrl?: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  optionE: string;
  correctAnswer: string;
  type: TestType;
  subType: SubType;
  createdAt: string;
  updatedAt: string;
}

enum TestType {
  TKD_BUMN = 'TKD_BUMN',
  AKHLAK_BUMN = 'AKHLAK_BUMN',
  TWK_BUMN = 'TWK_BUMN'
}

enum SubType {
  // TKD BUMN
  verbal_logical_reasoning = 'verbal_logical_reasoning',
  number_sequence = 'number_sequence',
  word_classification = 'word_classification',
  diagram_reasoning = 'diagram_reasoning',
  // AKHLAK BUMN
  penilaian_diri_akhlak = 'penilaian_diri_akhlak',
  // TWK BUMN
  wawasan_kebangsaan = 'wawasan_kebangsaan'
}

interface TryoutList {
  id: number;
  title: string;
  price: string;
  description?: string;
  batch: number;
  type: 'TKD_BUMN' | 'AKHLAK_BUMN' | 'TWK_BUMN';
  status: boolean;
  isOnline: boolean;
}

const QuestionerDashboard = () => {
  const navigate = useNavigate();
  const { questioner, logout } = useQuestionerAuth();
  const [tryouts, setTryouts] = useState<Tryout[]>([]);
  const [tryoutLists, setTryoutLists] = useState<TryoutList[]>([]);
  const [selectedTryoutList, setSelectedTryoutList] = useState<number>(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState<Partial<Tryout>>({
    id: 0,
    tryoutListId: 0,
    number: 0,
    question: '',
    explanation: '',
    imageUrl: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    optionE: '',
    correctAnswer: '',
    type: TestType.TKD_BUMN,
    subType: SubType.verbal_logical_reasoning
  });

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  useEffect(() => {
    if (!questioner) {
      navigate('/questioner/login');
    } else {
      loadData();
    }
  }, [questioner, navigate]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      await fetchTryoutLists();
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error("Gagal memuat data");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTryouts = async (tryoutListId: number) => {
    try {
      setIsLoading(true);
      const response = await api.get(`/questioner/tryouts/${tryoutListId}`);
      setTryouts(response.data);
    } catch (error) {
      console.error('Error fetching tryouts:', error);
      toast.error("Gagal memuat soal-soal");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTryoutLists = async () => {
    try {
      console.log('Fetching tryout lists...');
      console.log('Token:', localStorage.getItem('questioner-token'));
      const response = await api.get('/questioner/tryoutlists');
      console.log('Tryout lists response:', response.data);
      setTryoutLists(response.data);
      
      // Jika ada tryout list, pilih yang pertama
      if (response.data.length > 0) {
        setSelectedTryoutList(response.data[0].id);
        await fetchTryouts(response.data[0].id);
      }
    } catch (error) {
      console.error('Error fetching tryout lists:', error);
      toast.error("Gagal memuat daftar tryout");
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/questioner/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error("Gagal logout");
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      const formDataToSend = new FormData();
      
      // Menambahkan semua field yang diperlukan
      const tryoutData = {
        tryoutListId: selectedTryoutList,
        number: formData.number || tryouts.length + 1,
        question: formData.question,
        explanation: formData.explanation || '',
        optionA: formData.optionA,
        optionB: formData.optionB,
        optionC: formData.optionC,
        optionD: formData.optionD,
        optionE: formData.optionE,
        correctAnswer: formData.correctAnswer,
        type: formData.type as TestType,
        subType: formData.subType as SubType
      };

      // Append semua field ke FormData
      Object.entries(tryoutData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formDataToSend.append(key, value.toString());
        }
      });
      
      // Append image jika ada file baru yang dipilih
      if (selectedImage) {
        formDataToSend.append('image', selectedImage);
      }

      let response;
      if (!formData.id) {
        // Tambah soal baru
        response = await api.post('/questioner/tryouts', formDataToSend);
        toast.success("Soal berhasil ditambahkan");
      } else {
        // Update soal yang ada
        response = await api.put(`/questioner/tryouts/${formData.id}`, formDataToSend);
        toast.success("Soal berhasil diperbarui");
      }

      // Reset form dan refresh data
      resetForm();
      setIsDialogOpen(false);
      
      // Refresh tryouts list
      fetchTryouts(selectedTryoutList);
    } catch (error) {
      console.error('Error submitting tryout:', error);
      toast.error("Gagal menyimpan soal");
    } finally {
      setIsSaving(false);
    }
  };

  const resetForm = () => {
    setFormData({
      id: 0,
      tryoutListId: selectedTryoutList,
      number: tryouts.length + 1,
      question: '',
      explanation: '',
      imageUrl: '',
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      optionE: '',
      correctAnswer: '',
      type: TestType.TKD_BUMN,
      subType: SubType.verbal_logical_reasoning
    });
    setSelectedImage(null);
    setImagePreview('');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">Questioner Dashboard</h1>
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
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-lg font-medium">Daftar Tryout</h2>
              <p className="text-sm text-gray-500 mt-1">
                Pilih tryout untuk mengelola soal-soal
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Select
                value={selectedTryoutList.toString()}
                onValueChange={(value) => {
                  setSelectedTryoutList(Number(value));
                }}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Pilih Tryout" />
                </SelectTrigger>
                <SelectContent>
                  {tryoutLists.map((tryout) => (
                    <SelectItem key={tryout.id} value={tryout.id.toString()}>
                      {tryout.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => {
                    resetForm();
                    setIsDialogOpen(true);
                  }}>
                    <Plus className="w-4 h-4 mr-2" />
                    Tambah Soal
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {formData.id ? 'Edit Soal' : 'Tambah Soal Baru'}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Form fields */}
                    <div className="space-y-2">
                      <Label htmlFor="question">Pertanyaan</Label>
                      <Textarea
                        id="question"
                        value={formData.question}
                        onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="explanation">Penjelasan</Label>
                      <Textarea
                        id="explanation"
                        value={formData.explanation}
                        onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="image">Gambar (opsional)</Label>
                      <Input
                        id="image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                      {(imagePreview || formData.imageUrl) && (
                        <div className="mt-2">
                          <img
                            src={imagePreview || formData.imageUrl}
                            alt="Preview"
                            className="max-w-full h-auto"
                          />
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="optionA">Opsi A</Label>
                        <Input
                          id="optionA"
                          value={formData.optionA}
                          onChange={(e) => setFormData({ ...formData, optionA: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="optionB">Opsi B</Label>
                        <Input
                          id="optionB"
                          value={formData.optionB}
                          onChange={(e) => setFormData({ ...formData, optionB: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="optionC">Opsi C</Label>
                        <Input
                          id="optionC"
                          value={formData.optionC}
                          onChange={(e) => setFormData({ ...formData, optionC: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="optionD">Opsi D</Label>
                        <Input
                          id="optionD"
                          value={formData.optionD}
                          onChange={(e) => setFormData({ ...formData, optionD: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="optionE">Opsi E</Label>
                        <Input
                          id="optionE"
                          value={formData.optionE}
                          onChange={(e) => setFormData({ ...formData, optionE: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="correctAnswer">Jawaban Benar</Label>
                        <Select
                          value={formData.correctAnswer}
                          onValueChange={(value) => setFormData({ ...formData, correctAnswer: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih jawaban" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="A">A</SelectItem>
                            <SelectItem value="B">B</SelectItem>
                            <SelectItem value="C">C</SelectItem>
                            <SelectItem value="D">D</SelectItem>
                            <SelectItem value="E">E</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="type">Tipe Soal</Label>
                        <Select
                          value={formData.type}
                          onValueChange={(value) => setFormData({ ...formData, type: value as TestType })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih tipe" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={TestType.TKD_BUMN}>TKD BUMN</SelectItem>
                            <SelectItem value={TestType.AKHLAK_BUMN}>AKHLAK BUMN</SelectItem>
                            <SelectItem value={TestType.TWK_BUMN}>TWK BUMN</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="subType">Sub Tipe</Label>
                        <Select
                          value={formData.subType}
                          onValueChange={(value) => setFormData({ ...formData, subType: value as SubType })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih sub tipe" />
                          </SelectTrigger>
                          <SelectContent>
                            {formData.type === TestType.TKD_BUMN && (
                              <>
                                <SelectItem value={SubType.verbal_logical_reasoning}>
                                  Verbal & Logical Reasoning
                                </SelectItem>
                                <SelectItem value={SubType.number_sequence}>
                                  Number Sequence
                                </SelectItem>
                                <SelectItem value={SubType.word_classification}>
                                  Word Classification
                                </SelectItem>
                                <SelectItem value={SubType.diagram_reasoning}>
                                  Diagram Reasoning
                                </SelectItem>
                              </>
                            )}
                            {formData.type === TestType.AKHLAK_BUMN && (
                              <SelectItem value={SubType.penilaian_diri_akhlak}>
                                Penilaian Diri AKHLAK
                              </SelectItem>
                            )}
                            {formData.type === TestType.TWK_BUMN && (
                              <SelectItem value={SubType.wawasan_kebangsaan}>
                                Wawasan Kebangsaan
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          resetForm();
                          setIsDialogOpen(false);
                        }}
                      >
                        Batal
                      </Button>
                      <Button type="submit" disabled={isSaving}>
                        {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        {formData.id ? 'Simpan Perubahan' : 'Tambah Soal'}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
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
                    <TableHead>No.</TableHead>
                    <TableHead>Pertanyaan</TableHead>
                    <TableHead>Tipe</TableHead>
                    <TableHead>Sub Tipe</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tryouts.map((tryout) => (
                    <TableRow key={tryout.id}>
                      <TableCell>{tryout.number}</TableCell>
                      <TableCell>{tryout.question}</TableCell>
                      <TableCell>{tryout.type}</TableCell>
                      <TableCell>{tryout.subType}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setFormData(tryout);
                              setIsDialogOpen(true);
                            }}
                          >
                            <Save className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={async () => {
                              if (window.confirm('Apakah Anda yakin ingin menghapus soal ini?')) {
                                try {
                                  await api.delete(`/questioner/tryouts/${tryout.id}`);
                                  toast.success('Soal berhasil dihapus');
                                  fetchTryouts(selectedTryoutList);
                                } catch (error) {
                                  console.error('Error deleting tryout:', error);
                                  toast.error('Gagal menghapus soal');
                                }
                              }
                            }}
                          >
                            <Trash className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default QuestionerDashboard; 