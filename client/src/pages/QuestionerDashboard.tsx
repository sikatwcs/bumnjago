import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuestionerAuth } from "@/contexts/QuestionerAuthContext";
import { Button } from "@/components/ui/button";
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
import { questionerAPI } from '../lib/api';

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
  description: string;
  price: string;
  batch: number;
  type: string;
  status: boolean;
  isOnline: boolean;
  createdAt: string;
  updatedAt: string;
}

interface QuestionerProfile {
  id: number;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

const QuestionerDashboard = () => {
  const navigate = useNavigate();
  const { questioner, logout } = useQuestionerAuth();
  const [tryouts, setTryouts] = useState<Tryout[]>([]);
  const [tryoutLists, setTryoutLists] = useState<TryoutList[]>([]);
  const [selectedTryoutList, setSelectedTryoutList] = useState<number>(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState<QuestionerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  
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
    const token = localStorage.getItem('questioner-token');
    if (!token) {
      console.log('Redirecting to: /questioner/login');
      navigate('/questioner/login');
      return;
    }

    // Fetch data
    fetchData();
  }, [navigate]);

  useEffect(() => {
    if (selectedTryoutList) {
      fetchTryouts(selectedTryoutList);
    }
  }, [selectedTryoutList]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch tryout lists dan profile secara parallel
      const [tryoutResponse, profileResponse] = await Promise.all([
        questionerAPI.getTryoutLists(),
        questionerAPI.getProfile()
      ]);

      console.log('Tryout response:', tryoutResponse.data);
      console.log('Profile response:', profileResponse.data);

      // Pastikan data yang diterima adalah array dan object
      if (Array.isArray(tryoutResponse.data)) {
        setTryoutLists(tryoutResponse.data);
      } else {
        console.error('Tryout lists data is not an array:', tryoutResponse.data);
        toast.error('Format data tryout tidak valid');
      }

      if (typeof profileResponse.data === 'object' && profileResponse.data !== null) {
        setProfile(profileResponse.data);
      } else {
        console.error('Profile data is not an object:', profileResponse.data);
        toast.error('Format data profile tidak valid');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Gagal memuat data dashboard');
    } finally {
      setLoading(false);
    }
  };

  const fetchTryouts = async (tryoutListId: number) => {
    try {
      setIsLoading(true);
      const response = await questionerAPI.getTryoutDetails(tryoutListId);
      
      console.log('Tryouts response:', response.data);
      
      if (Array.isArray(response.data)) {
        setTryouts(response.data);
      } else {
        console.error('Tryouts data is not an array:', response.data);
        toast.error('Format data soal tidak valid');
      }
    } catch (error) {
      console.error('Error fetching tryouts:', error);
      toast.error("Gagal memuat soal-soal");
    } finally {
      setIsLoading(false);
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
      setIsLoading(true);
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

      // Set imageUrl dari response
      if (response?.data?.imageUrl) {
        setFormData(prev => ({
          ...prev,
          imageUrl: response.data.imageUrl
        }));
      }

      // Reset form dan refresh data
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
      setIsModalOpen(false);
      
      // Refresh tryouts list
      fetchTryouts(selectedTryoutList);
    } catch (error) {
      console.error('Error submitting tryout:', error);
      toast.error("Gagal menyimpan soal");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      id: 0,
      tryoutListId: selectedTryoutList,
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
    setSelectedImage(null);
    setImagePreview('');
  };

  const handleLogout = () => {
    localStorage.removeItem('questioner-token');
    navigate('/questioner/login');
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/admin-tryout/tryouts/${id}`);
      toast.success('Soal berhasil dihapus');
      fetchTryouts(selectedTryoutList);
    } catch (error) {
      toast.error('Gagal menghapus soal');
    }
  };

  const handleNextQuestion = () => {
    // Cari soal berikutnya berdasarkan nomor urut
    const currentIndex = tryouts.findIndex(t => t.id === formData.id);
    if (currentIndex < tryouts.length - 1) {
      const nextQuestion = tryouts[currentIndex + 1];
      setFormData(nextQuestion);
      if (nextQuestion.imageUrl) {
        setImagePreview(nextQuestion.imageUrl);
      } else {
        setImagePreview('');
      }
    } else {
      // Jika sudah di soal terakhir, reset form untuk membuat soal baru
      resetForm();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4">Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Questioner</h1>
          <div className="flex items-center space-x-4">
            {profile && (
              <span className="text-gray-600">
                Selamat datang, {profile.name}
              </span>
            )}
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
            >
              Keluar
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Tryout Lists */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Daftar Tryout</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tryoutLists.map((tryout) => (
              <div
                key={tryout.id}
                className="border rounded-lg p-4 hover:shadow-lg transition-shadow"
              >
                <h3 className="text-lg font-semibold mb-2">{tryout.title}</h3>
                <p className="text-gray-600 mb-2">{tryout.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    Batch {tryout.batch}
                  </span>
                  <span className={`px-2 py-1 rounded text-sm ${
                    tryout.status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {tryout.status ? 'Aktif' : 'Nonaktif'}
                  </span>
                </div>
                <div className="mt-4">
                  <button
                    onClick={() => navigate(`/questioner/tryout/${tryout.id}`)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                  >
                    Lihat Detail
                  </button>
                </div>
              </div>
            ))}
          </div>
          {tryoutLists.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              Belum ada tryout yang tersedia
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default QuestionerDashboard; 