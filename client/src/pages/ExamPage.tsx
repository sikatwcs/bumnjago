import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/utils/auth";
import { Home, Book, Calendar, ChevronRight, Bell, Search, Menu, Timer } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
}

const mockQuestions: Question[] = [
  {
    id: 1,
    question: "Berapakah hasil dari 15 + 25 × 3?",
    options: ["90", "120", "75", "105"],
    correctAnswer: 0,
  },
  {
    id: 2,
    question: "Manakah yang merupakan bilangan prima?",
    options: ["15", "21", "23", "25"],
    correctAnswer: 2,
  },
  // ... tambahkan pertanyaan lainnya
];

const ExamPage = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [timeLeft, setTimeLeft] = useState(3600); // 60 menit dalam detik
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleAnswer = (value: string) => {
    setAnswers({
      ...answers,
      [currentQuestion]: parseInt(value),
    });
  };

  const handleNext = () => {
    if (currentQuestion < mockQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = () => {
    // Implementasi submit jawaban
    navigate("/pusat-langganan");
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
            <a href="/pusat-langganan" className="flex items-center justify-between px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50">
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
          <div className="flex justify-between items-center px-4 sm:px-8 py-4">
            <div className="flex items-center space-x-4">
              <h2 className="text-xl font-semibold text-gray-900">Tryout Matematika #{examId}</h2>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-red-50 text-red-600 px-4 py-2 rounded-xl">
                <Timer className="w-5 h-5" />
                <span className="font-medium">{formatTime(timeLeft)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-8">
          <Card className="mb-6">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Progress</h3>
                <span className="text-sm text-gray-600">
                  {Object.keys(answers).length} dari {mockQuestions.length} soal dijawab
                </span>
              </div>
              <Progress 
                value={(Object.keys(answers).length / mockQuestions.length) * 100} 
                className="h-2 bg-gray-100"
              />
            </div>
          </Card>

          <Card className="mb-6">
            <div className="p-6">
              <div className="mb-6">
                <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm mb-4">
                  Soal {currentQuestion + 1} dari {mockQuestions.length}
                </span>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {mockQuestions[currentQuestion].question}
                </h3>
                <RadioGroup
                  value={answers[currentQuestion]?.toString()}
                  onValueChange={handleAnswer}
                  className="space-y-4"
                >
                  {mockQuestions[currentQuestion].options.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                      <Label htmlFor={`option-${index}`} className="text-gray-700">
                        {option}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentQuestion === 0}
                >
                  Sebelumnya
                </Button>
                {currentQuestion === mockQuestions.length - 1 ? (
                  <Button
                    className="bg-red-600 hover:bg-red-700 text-white"
                    onClick={handleSubmit}
                  >
                    Selesai
                  </Button>
                ) : (
                  <Button
                    className="bg-red-600 hover:bg-red-700 text-white"
                    onClick={handleNext}
                  >
                    Selanjutnya
                  </Button>
                )}
              </div>
            </div>
          </Card>
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

export default ExamPage;
