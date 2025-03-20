import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/utils/auth";
import { Home, Book, Calendar, ChevronRight, Bell, Search, Menu, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Mock data for exams
const mockExams = [
  {
    id: 1,
    title: "Tryout Matematika",
    description: "Uji kemampuan matematika Anda dengan ujian tryout yang mencakup aljabar, geometri, dan kalkulus.",
    duration: 60,
    questionsCount: 5,
    category: "Matematika",
    difficulty: "Sedang",
  },
  {
    id: 2,
    title: "Tryout Bahasa Inggris",
    description: "Evaluasi kemampuan bahasa Inggris Anda dengan soal pemahaman bacaan, tata bahasa, dan kosakata.",
    duration: 45,
    questionsCount: 3,
    category: "Bahasa Inggris",
    difficulty: "Mudah",
  },
  {
    id: 3,
    title: "Tryout IPA",
    description: "Uji pengetahuan Anda tentang konsep dasar IPA termasuk fisika, kimia, dan biologi.",
    duration: 90,
    questionsCount: 2,
    category: "IPA",
    difficulty: "Sulit",
  },
  {
    id: 4,
    title: "Tryout Komputer",
    description: "Evaluasi pemahaman Anda tentang konsep ilmu komputer, algoritma, dan logika pemrograman.",
    duration: 60,
    questionsCount: 2,
    category: "Komputer",
    difficulty: "Sedang",
  },
];

const ExamList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [exams] = useState(mockExams);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "mudah":
        return "bg-green-100 text-green-800";
      case "sedang":
        return "bg-yellow-100 text-yellow-800";
      case "sulit":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen flex bg-[#F8F9FC] relative">
      {/* Mobile Sidebar Toggle */}
      <button 
        onClick={toggleSidebar}
        className="lg:hidden fixed z-50 bottom-4 right-4 bg-red-600 text-white p-3 rounded-full shadow-lg"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Sidebar */}
      <div className={`
        fixed lg:static lg:translate-x-0 z-40
        w-[280px] bg-white min-h-screen border-r border-gray-200
        transition-transform duration-300
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-2xl text-red-600">Jago</span>
            <span className="font-bold text-2xl">CPNS</span>
          </div>
        </div>
        
        <div className="p-6">
          <nav className="space-y-1">
            <a href="/dashboard" className="flex items-center justify-between px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50">
              <div className="flex items-center space-x-3">
                <Home className="w-5 h-5" />
                <span className="font-medium">Dashboard</span>
              </div>
              <ChevronRight className="w-5 h-5" />
            </a>
            <a href="/pusat-langganan" className="flex items-center justify-between px-4 py-3 rounded-xl bg-red-50 text-red-600">
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5" />
                <span className="font-medium">TryOut Saya</span>
              </div>
              <ChevronRight className="w-5 h-5" />
            </a>
            <div className="pt-4 pb-2">
              <div className="px-4 text-sm font-semibold text-gray-900">
                Fokus CPNS 2024
              </div>
            </div>
            <a href="/materi" className="flex items-center justify-between px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50">
              <div className="flex items-center space-x-3">
                <Book className="w-5 h-5" />
                <span className="font-medium">Materi</span>
              </div>
              <ChevronRight className="w-5 h-5" />
            </a>
            <a href="/tryout" className="flex items-center justify-between px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50">
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5" />
                <span className="font-medium">Tryout</span>
              </div>
              <ChevronRight className="w-5 h-5" />
            </a>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 w-full">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-center px-4 sm:px-8 py-4 space-y-4 sm:space-y-0">
            <div className="w-full sm:flex-1 sm:max-w-xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input 
                  type="search"
                  placeholder="Cari tryout..."
                  className="pl-10 pr-4 py-2 w-full rounded-xl border-gray-200"
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 hover:bg-gray-100 rounded-xl">
                <Bell className="w-6 h-6 text-gray-600" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                <div>
                  <p className="font-medium text-gray-900">{user?.name}</p>
                  <p className="text-sm text-gray-500">Student</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-8">
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">TryOut Saya</h1>
            <p className="mt-2 text-gray-600">
              Pilih tryout di bawah ini untuk memulai ujian Anda
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {exams.map((exam) => (
              <Card key={exam.id} className="bg-white overflow-hidden hover:border-red-300 transition-all duration-200">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl font-bold">{exam.title}</CardTitle>
                    <Badge className={getDifficultyColor(exam.difficulty)}>
                      {exam.difficulty}
                    </Badge>
                  </div>
                  <CardDescription className="text-gray-600 mt-2">
                    {exam.category}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{exam.description}</p>
                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-500">
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{exam.duration} menit</span>
                    </div>
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{exam.questionsCount} soal</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-0">
                  <Link to={`/exam/${exam.id}`} className="w-full">
                    <Button variant="default" className="w-full bg-red-600 hover:bg-red-700 text-white">
                      Mulai Tryout
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default ExamList;
