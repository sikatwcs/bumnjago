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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
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
      fetchTryoutLists();
    }
  }, [questioner, navigate]);

  useEffect(() => {
    if (selectedTryoutList) {
      fetchTryouts(selectedTryoutList);
    }
  }, [selectedTryoutList]);

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
      const response = await api.get('/questioner/tryoutlists');
      setTryoutLists(response.data);
    } catch (error) {
      console.error('Error fetching tryout lists:', error);
      toast.error("Gagal memuat daftar tryout");
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
    logout();
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

  return (
    <div className="min-h-screen bg-[#F8F9FC]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-2xl text-red-600">Jago</span>
              <span className="font-bold text-2xl">CPNS</span>
            </div>
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="text-red-600 hover:text-red-700"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Keluar
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Kelola Soal Tryout
          </h1>

          {/* Pilih Tryout */}
          <div className="mb-8">
            <Label>Pilih Tryout</Label>
            <Select 
              value={selectedTryoutList.toString()} 
              onValueChange={(value) => setSelectedTryoutList(Number(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih tryout untuk dikelola" />
              </SelectTrigger>
              <SelectContent>
                {tryoutLists.map(tryout => (
                  <SelectItem key={tryout.id} value={tryout.id.toString()}>
                    {tryout.title} - Batch {tryout.batch}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedTryoutList > 0 && (
            <div className="flex gap-6">
              {/* Sidebar dengan Nomor Soal */}
              <div className="w-48 shrink-0">
                <h2 className="text-sm font-semibold text-gray-900 mb-3">Nomor Soal</h2>
                <div className="grid grid-cols-3 gap-1.5">
                  {tryouts.map((tryout) => (
                    <button
                      key={tryout.id}
                      onClick={() => {
                        setFormData(tryout);
                        if (tryout.imageUrl) {
                          setImagePreview(tryout.imageUrl);
                        }
                      }}
                      className={`h-10 rounded flex items-center justify-center font-medium text-sm transition-colors
                        ${tryout.id === formData.id 
                          ? 'bg-red-600 text-white' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                    >
                      {tryout.number}
                    </button>
                  ))}
                </div>
              </div>

              {/* Form dan Preview */}
              <div className="flex-1 space-y-6">
                {/* Form Pembuatan Soal */}
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label>Pertanyaan</Label>
                    <Textarea
                      placeholder="Masukkan pertanyaan..."
                      value={formData.question}
                      onChange={(e) => setFormData({...formData, question: e.target.value})}
                      className="min-h-[100px]"
                    />
                  </div>

                  {/* Image Upload Section */}
                  <div className="space-y-2">
                    <Label>Gambar (Opsional)</Label>
                    <div className="flex items-center space-x-4">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                        id="image-upload"
                      />
                      <Label
                        htmlFor="image-upload"
                        className="cursor-pointer flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                      >
                        <ImageIcon className="w-5 h-5 mr-2" />
                        Pilih Gambar
                      </Label>
                      {(imagePreview || formData.imageUrl) && (
                        <Button
                          variant="ghost"
                          onClick={() => {
                            setSelectedImage(null);
                            setImagePreview('');
                            setFormData({ ...formData, imageUrl: undefined });
                          }}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash className="w-4 h-4 mr-2" />
                          Hapus Gambar
                        </Button>
                      )}
                    </div>
                    {(imagePreview || formData.imageUrl) && (
                      <div className="mt-4">
                        <img
                          src={imagePreview || formData.imageUrl}
                          alt="Preview"
                          className="max-w-md rounded-lg shadow-sm"
                        />
                      </div>
                    )}
                  </div>

                  {/* Pilihan Jawaban */}
                  <div className="space-y-4">
                    <Label>Pilihan Jawaban dan Kunci</Label>
                    <div className="grid grid-cols-2 gap-4">
                      {['A', 'B', 'C', 'D', 'E'].map((option) => (
                        <div key={option}>
                          <Label>Opsi {option}</Label>
                          <div className="flex gap-2">
                            <Input
                              type="text"
                              value={formData[`option${option}` as keyof Tryout] || ''}
                              onChange={(e) => setFormData({
                                ...formData,
                                [`option${option}`]: e.target.value
                              })}
                            />
                            <Button
                              type="button"
                              variant={formData.correctAnswer === option ? "default" : "outline"}
                              onClick={() => setFormData({
                                ...formData,
                                correctAnswer: option
                              })}
                              className="w-20"
                            >
                              {formData.correctAnswer === option ? "Benar" : "Pilih"}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tipe Soal */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Tipe Soal</Label>
                      <Select 
                        value={formData.type}
                        onValueChange={(value: TestType) => 
                          setFormData({...formData, type: value})
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih tipe soal" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={TestType.TKD_BUMN}>TKD BUMN</SelectItem>
                          <SelectItem value={TestType.AKHLAK_BUMN}>AKHLAK BUMN</SelectItem>
                          <SelectItem value={TestType.TWK_BUMN}>TWK BUMN</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Sub Tipe</Label>
                      <Select 
                        value={formData.subType}
                        onValueChange={(value: SubType) => 
                          setFormData({...formData, subType: value})
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih sub tipe soal" />
                        </SelectTrigger>
                        <SelectContent>
                          {formData.type === TestType.TKD_BUMN && (
                            <>
                              <SelectItem value={SubType.verbal_logical_reasoning}>Verbal & Logical Reasoning</SelectItem>
                              <SelectItem value={SubType.number_sequence}>Number Sequence</SelectItem>
                              <SelectItem value={SubType.word_classification}>Word Classification</SelectItem>
                              <SelectItem value={SubType.diagram_reasoning}>Diagram Reasoning</SelectItem>
                            </>
                          )}
                          {formData.type === TestType.AKHLAK_BUMN && (
                            <SelectItem value={SubType.penilaian_diri_akhlak}>Penilaian Diri AKHLAK</SelectItem>
                          )}
                          {formData.type === TestType.TWK_BUMN && (
                            <SelectItem value={SubType.wawasan_kebangsaan}>Wawasan Kebangsaan</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Penjelasan Jawaban */}
                  <div className="space-y-2">
                    <Label>Penjelasan Jawaban</Label>
                    <Textarea
                      placeholder="Masukkan penjelasan jawaban..."
                      value={formData.explanation}
                      onChange={(e) => setFormData({...formData, explanation: e.target.value})}
                      className="min-h-[100px]"
                    />
                  </div>

                  {/* Submit dan Next Button */}
                  <div className="flex gap-4">
                    <Button 
                      onClick={handleSubmit}
                      className="flex-1"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Menyimpan...
                        </>
                      ) : formData.id ? (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Update Soal
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4 mr-2" />
                          Tambah Soal
                        </>
                      )}
                    </Button>
                    
                    <Button
                      onClick={handleNextQuestion}
                      variant="outline"
                      className="w-[200px]"
                      disabled={isLoading}
                    >
                      {formData.id ? (
                        tryouts.findIndex(t => t.id === formData.id) < tryouts.length - 1 ? (
                          "Soal Berikutnya"
                        ) : (
                          "Buat Soal Baru"
                        )
                      ) : (
                        "Reset Form"
                      )}
                    </Button>
                  </div>
                </div>

                {/* Preview Soal */}
                {formData.id ? (
                  <div className="mt-8 border-t pt-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                      Preview Soal
                    </h2>
                    <div className="bg-gray-50 rounded-lg p-6">
                      <div className="space-y-6">
                        {/* Info soal */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold text-xl">
                              {formData.number}
                            </div>
                            <div>
                              <span className="font-medium text-gray-600">{formData.type}</span>
                              <span className="mx-2 text-gray-400">•</span>
                              <span className="text-gray-500">{formData.subType?.split('_').join(' ')}</span>
                            </div>
                          </div>
                        </div>

                        {/* Pertanyaan */}
                        <div className="space-y-4">
                          <p className="text-gray-700">{formData.question}</p>
                          {(imagePreview || formData.imageUrl) && (
                            <img
                              src={imagePreview || formData.imageUrl}
                              alt="Question"
                              className="max-w-lg rounded-lg shadow-sm"
                            />
                          )}
                        </div>

                        {/* Opsi jawaban */}
                        <div className="grid grid-cols-1 gap-3">
                          {['A', 'B', 'C', 'D', 'E'].map((option) => (
                            <div
                              key={option}
                              className={`p-4 rounded-lg border ${
                                formData.correctAnswer === option
                                  ? 'border-green-500 bg-green-50'
                                  : 'border-gray-200'
                              }`}
                            >
                              <div className="flex items-center space-x-4">
                                <div
                                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium ${
                                    formData.correctAnswer === option
                                      ? 'bg-green-500 text-white'
                                      : 'bg-gray-100 text-gray-600'
                                  }`}
                                >
                                  {option}
                                </div>
                                <span className={`${
                                  formData.correctAnswer === option
                                    ? 'text-green-700'
                                    : 'text-gray-600'
                                }`}>
                                  {formData[`option${option}` as keyof Tryout]}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Penjelasan */}
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-600" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                            <h3 className="font-medium text-yellow-800">Penjelasan Jawaban</h3>
                          </div>
                          <div className="pl-7">
                            <p className="text-yellow-800">{formData.explanation || 'Tidak ada penjelasan'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuestionerDashboard; 