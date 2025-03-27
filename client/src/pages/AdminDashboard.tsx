import { useState, useEffect, ChangeEvent } from "react";
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
  DialogFooter,
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
import { 
  LogOut, 
  Plus, 
  Edit, 
  Trash, 
  Loader2, 
  Image as ImageIcon,
  Eye,
  EyeOff,
  PencilLine,
  File,
  User,
  Users,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import api, { adminAPI } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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

interface Question {
  id: string;
  tryoutId: string;
  question: string;
  imageUrl?: string;
  options: Option[];
  correctAnswer: string;
  explanation?: string;
  type: 'multiple_choice' | 'essay';
  subType?: string;
  timeLimit?: number;
  createdAt: string;
  updatedAt: string;
}

interface Option {
  id: string;
  text: string;
  isCorrect: boolean;
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

interface Stats {
  totalUsers: number;
  totalTryouts: number;
  totalQuestions: number;
  totalCompletions: number;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { admin, logout } = useAdminAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isQuestionDialogOpen, setIsQuestionDialogOpen] = useState(false);
  const [isImageUploading, setIsImageUploading] = useState(false);

  // Stats
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalTryouts: 0,
    totalQuestions: 0,
    totalCompletions: 0
  });

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

  // Questions state
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Partial<Question>>({
    question: '',
    options: [
      { id: crypto.randomUUID(), text: '', isCorrect: true },
      { id: crypto.randomUUID(), text: '', isCorrect: false },
      { id: crypto.randomUUID(), text: '', isCorrect: false },
      { id: crypto.randomUUID(), text: '', isCorrect: false },
    ],
    correctAnswer: '',
    explanation: '',
    type: 'multiple_choice',
    subType: 'TKD',
    timeLimit: 60,
  });
  const [selectedTryoutId, setSelectedTryoutId] = useState<string | null>(null);
  const [expandedTryout, setExpandedTryout] = useState<string | null>(null);

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
        adminAPI.getTryoutLists(),
        adminAPI.getProfiles()
      ]);

      setTryoutLists(tryoutListsRes.data);
      setProfiles(profilesRes.data);

      // Set stats
      setStats({
        totalUsers: profilesRes.data.length,
        totalTryouts: tryoutListsRes.data.length,
        totalQuestions: tryoutListsRes.data.reduce((total: number, tryout: any) => 
          total + (tryout.questions?.length || 0), 0),
        totalCompletions: 0 // Placeholder, can be updated with actual data
      });
    } catch (error) {
      toast.error("Gagal memuat data");
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // TryoutList handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCurrentTryout({
      ...currentTryout,
      [name]: name === 'price' || name === 'batch' ? Number(value) : value
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setCurrentTryout({
      ...currentTryout,
      [name]: value === 'true' ? true : value === 'false' ? false : value
    });
  };
  
  const handleSaveTryout = async () => {
    try {
      setIsSaving(true);
      if (currentTryout.id) {
        await adminAPI.updateTryout(currentTryout.id, currentTryout);
        toast.success('Tryout berhasil diperbarui');
      } else {
        await adminAPI.createTryout(currentTryout);
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
      setIsDialogOpen(false);
      loadData();
    } catch (error) {
      console.error('Error saving tryout:', error);
      toast.error('Gagal menyimpan tryout');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteTryout = async (id: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus tryout ini?')) {
      try {
        await adminAPI.deleteTryout(id);
        toast.success('Tryout berhasil dihapus');
        loadData();
      } catch (error) {
        console.error('Error deleting tryout:', error);
        toast.error('Gagal menghapus tryout');
      }
    }
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

  // Question handlers
  const loadQuestions = async (tryoutId: string) => {
    try {
      setIsLoading(true);
      const response = await adminAPI.getTryoutQuestions(tryoutId);
      setQuestions(response.data);
      setSelectedTryoutId(tryoutId);
    } catch (error) {
      console.error('Error loading questions:', error);
      toast.error('Gagal memuat soal-soal');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuestionInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCurrentQuestion({
      ...currentQuestion,
      [name]: name === 'timeLimit' ? Number(value) : value
    });
  };

  const handleQuestionSelectChange = (name: string, value: string) => {
    setCurrentQuestion({
      ...currentQuestion,
      [name]: value
    });
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...(currentQuestion.options || [])];
    newOptions[index] = {
      ...newOptions[index],
      text: value
    };
    setCurrentQuestion({
      ...currentQuestion,
      options: newOptions
    });
  };

  const handleCorrectAnswerChange = (index: number) => {
    const newOptions = [...(currentQuestion.options || [])].map((option, i) => ({
      ...option,
      isCorrect: i === index
    }));
    setCurrentQuestion({
      ...currentQuestion,
      options: newOptions,
      correctAnswer: newOptions[index].text
    });
  };

  const handleAddOption = () => {
    const newOptions = [...(currentQuestion.options || [])];
    newOptions.push({
      id: crypto.randomUUID(),
      text: '',
      isCorrect: false
    });
    setCurrentQuestion({
      ...currentQuestion,
      options: newOptions
    });
  };

  const handleRemoveOption = (index: number) => {
    const newOptions = [...(currentQuestion.options || [])];
    newOptions.splice(index, 1);
    setCurrentQuestion({
      ...currentQuestion,
      options: newOptions
    });
  };

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsImageUploading(true);
      const formData = new FormData();
      formData.append('image', file);

      const response = await adminAPI.uploadImage(formData);
      setCurrentQuestion({
        ...currentQuestion,
        imageUrl: response.data.url
      });
      toast.success('Gambar berhasil diupload');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Gagal mengupload gambar');
    } finally {
      setIsImageUploading(false);
    }
  };

  const handleSaveQuestion = async () => {
    if (!selectedTryoutId) {
      toast.error('Pilih tryout terlebih dahulu');
      return;
    }

    if (!currentQuestion.question) {
      toast.error('Pertanyaan tidak boleh kosong');
      return;
    }

    if (currentQuestion.type === 'multiple_choice' && 
        (!currentQuestion.options || currentQuestion.options.length < 2)) {
      toast.error('Minimal harus ada 2 pilihan jawaban');
      return;
    }

    try {
      setIsSaving(true);
      const questionData = {
        ...currentQuestion,
        tryoutId: selectedTryoutId
      };

      if (currentQuestion.id) {
        await adminAPI.updateTryoutQuestion(
          selectedTryoutId,
          currentQuestion.id,
          questionData
        );
        toast.success('Soal berhasil diperbarui');
      } else {
        await adminAPI.createTryoutQuestion(selectedTryoutId, questionData);
        toast.success('Soal berhasil ditambahkan');
      }

      setCurrentQuestion({
        question: '',
        options: [
          { id: crypto.randomUUID(), text: '', isCorrect: true },
          { id: crypto.randomUUID(), text: '', isCorrect: false },
          { id: crypto.randomUUID(), text: '', isCorrect: false },
          { id: crypto.randomUUID(), text: '', isCorrect: false },
        ],
        correctAnswer: '',
        explanation: '',
        type: 'multiple_choice',
        subType: 'TKD',
        timeLimit: 60,
      });
      setIsQuestionDialogOpen(false);
      loadQuestions(selectedTryoutId);
    } catch (error) {
      console.error('Error saving question:', error);
      toast.error('Gagal menyimpan soal');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditQuestion = (question: Question) => {
    setCurrentQuestion({
      ...question,
      options: question.options || [
        { id: crypto.randomUUID(), text: '', isCorrect: true },
        { id: crypto.randomUUID(), text: '', isCorrect: false },
        { id: crypto.randomUUID(), text: '', isCorrect: false },
        { id: crypto.randomUUID(), text: '', isCorrect: false },
      ]
    });
    setIsQuestionDialogOpen(true);
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!selectedTryoutId) return;
    
    if (window.confirm('Apakah Anda yakin ingin menghapus soal ini?')) {
      try {
        await adminAPI.deleteTryoutQuestion(selectedTryoutId, questionId);
        toast.success('Soal berhasil dihapus');
        loadQuestions(selectedTryoutId);
      } catch (error) {
        console.error('Error deleting question:', error);
        toast.error('Gagal menghapus soal');
      }
    }
  };

  const handleExpandTryout = (tryoutId: string) => {
    if (expandedTryout === tryoutId) {
      setExpandedTryout(null);
    } else {
      setExpandedTryout(tryoutId);
      loadQuestions(tryoutId);
    }
  };

  const resetQuestionForm = () => {
    setCurrentQuestion({
      question: '',
      options: [
        { id: crypto.randomUUID(), text: '', isCorrect: true },
        { id: crypto.randomUUID(), text: '', isCorrect: false },
        { id: crypto.randomUUID(), text: '', isCorrect: false },
        { id: crypto.randomUUID(), text: '', isCorrect: false },
      ],
      correctAnswer: '',
      explanation: '',
      type: 'multiple_choice',
      subType: 'TKD',
      timeLimit: 60,
    });
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const renderDashboard = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total Pengguna
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-gray-500 mt-1">Pengguna terdaftar</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total Tryout
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTryouts}</div>
            <p className="text-xs text-gray-500 mt-1">Paket tryout aktif</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total Soal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalQuestions}</div>
            <p className="text-xs text-gray-500 mt-1">Soal dalam database</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total Pengerjaan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCompletions}</div>
            <p className="text-xs text-gray-500 mt-1">Pengerjaan tryout</p>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderTryoutLists = () => {
    return (
      <>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Daftar Tryout</h2>
          <Button onClick={() => setIsDialogOpen(true)} className="bg-yellow-500 hover:bg-yellow-600">
            <Plus className="w-4 h-4 mr-2" />
            Tambah Tryout
          </Button>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center my-10">
            <Loader2 className="w-8 h-8 animate-spin text-yellow-500" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">No</TableHead>
                  <TableHead>Judul</TableHead>
                  <TableHead>Tipe</TableHead>
                  <TableHead>Batch</TableHead>
                  <TableHead>Harga</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tryoutLists.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10 text-gray-500">
                      Belum ada data tryout
                    </TableCell>
                  </TableRow>
                ) : (
                  tryoutLists.map((tryout, index) => (
                    <TableRow key={tryout.id} className="group">
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell>{tryout.title}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={tryout.type === 'TKD_BUMN' ? 'default' : 
                                  tryout.type === 'AKHLAK_BUMN' ? 'outline' : 'secondary'}
                        >
                          {tryout.type}
                        </Badge>
                      </TableCell>
                      <TableCell>{tryout.batch}</TableCell>
                      <TableCell>Rp {tryout.price.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={tryout.status ? 'default' : 'destructive'}
                          className={tryout.status ? 'bg-green-500' : ''}
                        >
                          {tryout.status ? 'Aktif' : 'Nonaktif'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 mr-1"
                          onClick={() => handleExpandTryout(tryout.id)}
                        >
                          {expandedTryout === tryout.id ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleEditTryout(tryout)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 text-red-500 hover:text-red-700"
                          onClick={() => handleDeleteTryout(tryout.id)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </>
    );
  };

  const renderQuestions = () => {
    return (
      <>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Daftar Soal</h2>
          <div className="flex space-x-4">
            <Select value={selectedTryoutId || ''} onValueChange={(value) => {
              setSelectedTryoutId(value);
              loadQuestions(value);
            }}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Pilih Tryout" />
              </SelectTrigger>
              <SelectContent>
                {tryoutLists.map((tryout) => (
                  <SelectItem key={tryout.id} value={tryout.id}>
                    {tryout.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
              onClick={() => {
                resetQuestionForm();
                setIsQuestionDialogOpen(true);
              }} 
              className="bg-yellow-500 hover:bg-yellow-600"
              disabled={!selectedTryoutId}
            >
              <Plus className="w-4 h-4 mr-2" />
              Tambah Soal
            </Button>
          </div>
        </div>
        
        {!selectedTryoutId ? (
          <div className="text-center py-10 text-gray-500">
            Pilih tryout untuk melihat soal
          </div>
        ) : isLoading ? (
          <div className="flex justify-center my-10">
            <Loader2 className="w-8 h-8 animate-spin text-yellow-500" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">No</TableHead>
                  <TableHead>Pertanyaan</TableHead>
                  <TableHead>Tipe</TableHead>
                  <TableHead>Subtipe</TableHead>
                  <TableHead>Gambar</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {questions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-gray-500">
                      Belum ada soal untuk tryout ini
                    </TableCell>
                  </TableRow>
                ) : (
                  questions.map((question, index) => (
                    <TableRow key={question.id}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell className="max-w-[300px] truncate">{question.question}</TableCell>
                      <TableCell>
                        <Badge variant={question.type === 'multiple_choice' ? 'default' : 'secondary'}>
                          {question.type === 'multiple_choice' ? 'Pilihan Ganda' : 'Essay'}
                        </Badge>
                      </TableCell>
                      <TableCell>{question.subType}</TableCell>
                      <TableCell>
                        {question.imageUrl ? (
                          <Badge variant="outline" className="bg-green-50">
                            <ImageIcon className="w-3 h-3 mr-1" />
                            Ada
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-gray-50 text-gray-500">
                            Tidak ada
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleEditQuestion(question)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 text-red-500 hover:text-red-700"
                          onClick={() => handleDeleteQuestion(question.id)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </>
    );
  };

  const renderUsers = () => {
    return (
      <>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Daftar Pengguna</h2>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center my-10">
            <Loader2 className="w-8 h-8 animate-spin text-yellow-500" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">No</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Provinsi</TableHead>
                  <TableHead>No. Telepon</TableHead>
                  <TableHead>Instansi</TableHead>
                  <TableHead>Terdaftar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {profiles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10 text-gray-500">
                      Belum ada data pengguna
                    </TableCell>
                  </TableRow>
                ) : (
                  profiles.map((profile, index) => (
                    <TableRow key={profile.id}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell>{profile.name}</TableCell>
                      <TableCell>{profile.user.email}</TableCell>
                      <TableCell>{profile.province}</TableCell>
                      <TableCell>{profile.phone}</TableCell>
                      <TableCell>{profile.instance}</TableCell>
                      <TableCell>{new Date(profile.createdAt).toLocaleDateString('id-ID')}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">Admin Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {admin?.name}
              </span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleLogout}
                className="text-gray-600 hover:text-gray-900"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="w-full grid grid-cols-3 mx-auto max-w-md mb-4">
            <TabsTrigger value="dashboard" className="text-center">
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="exams" className="text-center">
              Tryout
            </TabsTrigger>
            <TabsTrigger value="users" className="text-center">
              Pengguna
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard" className="space-y-6">
            {renderDashboard()}
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Tryout Terbaru</h2>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">No</TableHead>
                      <TableHead>Judul</TableHead>
                      <TableHead>Tipe</TableHead>
                      <TableHead>Batch</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tryoutLists.slice(0, 5).map((tryout, index) => (
                      <TableRow key={tryout.id}>
                        <TableCell className="font-medium">{index + 1}</TableCell>
                        <TableCell>{tryout.title}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{tryout.type}</Badge>
                        </TableCell>
                        <TableCell>{tryout.batch}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={tryout.status ? 'default' : 'destructive'}
                            className={tryout.status ? 'bg-green-500' : ''}
                          >
                            {tryout.status ? 'Aktif' : 'Nonaktif'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="exams" className="bg-white p-6 rounded-lg shadow-sm">
            {renderTryoutLists()}
          </TabsContent>
          
          <TabsContent value="users" className="bg-white p-6 rounded-lg shadow-sm">
            {renderUsers()}
          </TabsContent>
        </Tabs>
      </main>

      {/* Dialog untuk tambah/edit tryout */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{currentTryout.id ? 'Edit Tryout' : 'Tambah Tryout Baru'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Judul Tryout</Label>
              <Input
                id="title"
                name="title"
                value={currentTryout.title}
                onChange={handleInputChange}
                placeholder="Masukkan judul tryout"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Deskripsi</Label>
              <Textarea
                id="description"
                name="description"
                value={currentTryout.description || ''}
                onChange={handleInputChange}
                placeholder="Masukkan deskripsi tryout"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Harga (Rp)</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  value={currentTryout.price}
                  onChange={handleInputChange}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="batch">Batch</Label>
                <Input
                  id="batch"
                  name="batch"
                  type="number"
                  value={currentTryout.batch}
                  onChange={handleInputChange}
                  placeholder="1"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Tipe Tryout</Label>
              <Select
                value={currentTryout.type}
                onValueChange={(value) => handleSelectChange('type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih tipe tryout" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TKD_BUMN">TKD BUMN</SelectItem>
                  <SelectItem value="AKHLAK_BUMN">AKHLAK BUMN</SelectItem>
                  <SelectItem value="TWK_BUMN">TWK BUMN</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={currentTryout.status ? 'true' : 'false'}
                onValueChange={(value) => handleSelectChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih status tryout" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Aktif</SelectItem>
                  <SelectItem value="false">Nonaktif</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="isOnline">Mode Tryout</Label>
              <Select
                value={currentTryout.isOnline ? 'true' : 'false'}
                onValueChange={(value) => handleSelectChange('isOnline', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih mode tryout" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Online</SelectItem>
                  <SelectItem value="false">Offline</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleDialogClose}>
              Batal
            </Button>
            <Button onClick={handleSaveTryout} disabled={isSaving} className="bg-yellow-500 hover:bg-yellow-600">
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                'Simpan'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog untuk tambah/edit soal */}
      <Dialog open={isQuestionDialogOpen} onOpenChange={setIsQuestionDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{currentQuestion.id ? 'Edit Soal' : 'Tambah Soal Baru'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="question">Pertanyaan</Label>
              <Textarea
                id="question"
                name="question"
                value={currentQuestion.question || ''}
                onChange={handleQuestionInputChange}
                placeholder="Masukkan pertanyaan"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Tipe Soal</Label>
              <Select
                value={currentQuestion.type}
                onValueChange={(value) => handleQuestionSelectChange('type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih tipe soal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="multiple_choice">Pilihan Ganda</SelectItem>
                  <SelectItem value="essay">Essay</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="subType">Subtipe</Label>
              <Select
                value={currentQuestion.subType || 'TKD'}
                onValueChange={(value) => handleQuestionSelectChange('subType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih subtipe soal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TKD">TKD</SelectItem>
                  <SelectItem value="TWK">TWK</SelectItem>
                  <SelectItem value="TIU">TIU</SelectItem>
                  <SelectItem value="AKHLAK">AKHLAK</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="timeLimit">Batas Waktu (detik)</Label>
              <Input
                id="timeLimit"
                name="timeLimit"
                type="number"
                value={currentQuestion.timeLimit || 60}
                onChange={handleQuestionInputChange}
                placeholder="60"
              />
            </div>
            <div className="space-y-2">
              <Label>Gambar Soal</Label>
              <div className="flex items-center space-x-4">
                <Input
                  id="questionImage"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isImageUploading}
                  className="w-full"
                />
                {isImageUploading && (
                  <Loader2 className="h-4 w-4 animate-spin text-yellow-500" />
                )}
              </div>
              {currentQuestion.imageUrl && (
                <div className="mt-2 border rounded-md overflow-hidden">
                  <img 
                    src={currentQuestion.imageUrl} 
                    alt="Preview" 
                    className="max-h-[100px] object-contain mx-auto"
                  />
                </div>
              )}
            </div>
            
            {currentQuestion.type === 'multiple_choice' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Pilihan Jawaban</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddOption}
                    type="button"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Tambah Pilihan
                  </Button>
                </div>
                {currentQuestion.options?.map((option, index) => (
                  <div key={option.id} className="flex items-center space-x-2">
                    <Input
                      value={option.text}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      placeholder={`Pilihan ${index + 1}`}
                      className="flex-1"
                    />
                    <Button
                      variant={option.isCorrect ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleCorrectAnswerChange(index)}
                      type="button"
                      className={option.isCorrect ? 'bg-green-500 hover:bg-green-600' : ''}
                    >
                      {option.isCorrect ? 'Benar' : 'Tandai Benar'}
                    </Button>
                    {currentQuestion.options && currentQuestion.options.length > 2 && (
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleRemoveOption(index)}
                        type="button"
                        className="h-8 w-8 text-red-500 hover:text-red-700"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="explanation">Penjelasan Jawaban</Label>
              <Textarea
                id="explanation"
                name="explanation"
                value={currentQuestion.explanation || ''}
                onChange={handleQuestionInputChange}
                placeholder="Masukkan penjelasan jawaban (opsional)"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsQuestionDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleSaveQuestion} disabled={isSaving} className="bg-yellow-500 hover:bg-yellow-600">
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                'Simpan'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard; 