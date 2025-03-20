import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Home, Book, Calendar, Users, Settings, ChevronRight, Bell, Search, Gift, FileText, Ticket, Menu, LogOut, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import Carousel from "@/components/Carousel";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ProfileForm } from '@/components/profile/ProfileForm';
import api from "@/lib/supabase";

// Sample data for user's exam history
const mockTestHistory = [
  { name: "Mathematics", score: 85 },
  { name: "English", score: 72 },
  { name: "Science", score: 68 },
  { name: "Computer Science", score: 92 },
];

// Sample recent exams data
const recentExams = [
  { id: 1, title: "Mathematics Tryout Test", date: "2 days ago", score: 85 },
  { id: 2, title: "English Language Proficiency", date: "1 week ago", score: 72 },
];

// Sample upcoming exams
const upcomingExams = [
  { id: 3, title: "Science Fundamentals", deadline: "Tomorrow, 3:00 PM", difficulty: "Hard" },
  { id: 4, title: "Computer Science Basics", deadline: "Aug 15, 10:00 AM", difficulty: "Medium" },
];

const Dashboard = () => {
  const { user, profile, logout, fetchProfile } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
    } else if (!profile) {
      fetchProfile();
    }
  }, [user, profile, navigate, fetchProfile]);

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const handleFreeTryout = () => {
    navigate("/free-tryout");
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen flex bg-[#F8F9FC] relative">
      {/* Mobile Sidebar Toggle */}
      <button 
        onClick={toggleSidebar}
        className="lg:hidden fixed z-50 bottom-4 right-4 bg-yellow-500 text-white p-3 rounded-full shadow-lg"
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
            <img src="/Logo.png" alt="JagoBumn Logo" className="h-10" />
          </div>
        </div>
        
        <div className="p-6">
          <nav className="space-y-1">
            <a href="/dashboard" className="flex items-center justify-between px-4 py-3 rounded-xl bg-yellow-50 text-yellow-600">
              <div className="flex items-center space-x-3">
                <Home className="w-5 h-5" />
                <span className="font-medium">Dashboard</span>
              </div>
              <ChevronRight className="w-5 h-5" />
            </a>
            <a href="/tryout" className="flex items-center justify-between px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50">
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
                  placeholder="Cari materi pembelajaran..."
                  className="pl-10 pr-4 py-2 w-full rounded-xl border-gray-200"
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 hover:bg-gray-100 rounded-xl">
                <Bell className="w-6 h-6 text-gray-600" />
              </button>
              <div className="flex items-center space-x-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src="/avatars/default.png" alt="Profile" />
                  <AvatarFallback>
                    {profile?.name 
                      ? profile.name.split(' ').map((word: string) => word[0]).join('').toUpperCase().substring(0, 2)
                      : user?.name 
                        ? user.name.split(' ').map((word: string) => word[0]).join('').toUpperCase().substring(0, 2)
                        : user?.email?.substring(0, 2).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-gray-900">{profile?.name || user?.name || "Pengguna"}</p>
                  <p className="text-sm text-gray-500">{profile?.instance || "Student"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-4 sm:p-8">
          {/* Carousel Section */}
          <div className="mb-6 sm:mb-8">
            <Carousel />
          </div>

          {/* Quick Action Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <button
              onClick={handleFreeTryout}
              className="bg-white p-6 rounded-2xl border border-gray-200 hover:border-yellow-300 transition-all group"
            >
              <div className="w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-yellow-100">
                <Gift className="w-6 h-6 text-yellow-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Coba Tryout Gratis</h3>
              <p className="text-sm text-gray-600">
                Dapatkan pengalaman tryout lengkap secara gratis untuk latihan
              </p>
            </button>

            <button
              onClick={() => navigate("/profile")}
              className="bg-white p-6 rounded-2xl border border-gray-200 hover:border-blue-300 transition-all group"
            >
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-100">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Edit Profil</h3>
              <p className="text-sm text-gray-600">
                Lengkapi data profil untuk pengalaman belajar yang lebih personal
              </p>
            </button>

            <button 
              onClick={() => navigate("/user-guide")}
              className="bg-white p-6 rounded-2xl border border-gray-200 hover:border-green-300 transition-all group"
            >
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-green-100">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Panduan Pengguna</h3>
              <p className="text-sm text-gray-600">
                Pelajari cara memaksimalkan pengalaman belajar di platform kami
              </p>
            </button>
          </div>

          {/* Recent Activity */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 mb-6 sm:mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Aktivitas Terbaru</h2>
              <Button
                variant="outline"
                size="sm"
                className="text-sm"
                onClick={() => navigate("/history")}
              >
                Lihat Semua
              </Button>
            </div>

            <div className="space-y-4">
              {recentExams.length > 0 ? (
                recentExams.map((exam) => (
                  <div
                    key={exam.id}
                    className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                        <FileText className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{exam.title}</h3>
                        <p className="text-sm text-gray-500">Dikerjakan {exam.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-xl text-gray-900">{exam.score}</span>
                      <p className="text-xs text-gray-500">Nilai</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Anda belum mengerjakan tryout apapun
                </div>
              )}
            </div>
          </div>

          {/* Upcoming Exams */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Ujian Mendatang</h2>
              <Button
                variant="outline"
                size="sm"
                className="text-sm"
                onClick={() => navigate("/tryout")}
              >
                Lihat Semua
              </Button>
            </div>

            <div className="space-y-4">
              {upcomingExams.length > 0 ? (
                upcomingExams.map((exam) => (
                  <div
                    key={exam.id}
                    className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center">
                        <Ticket className="w-6 h-6 text-yellow-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{exam.title}</h3>
                        <p className="text-sm text-gray-500">Tenggat: {exam.deadline}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`
                        px-2 py-1 rounded-full text-xs font-medium
                        ${exam.difficulty === 'Hard' ? 'bg-red-100 text-red-700' : 
                         exam.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 
                         'bg-green-100 text-green-700'}
                      `}>
                        {exam.difficulty}
                      </span>
                      <Button size="sm">Mulai</Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Tidak ada ujian yang akan datang
                </div>
              )}
            </div>
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

      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 fixed w-full z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <img src="/Logo.png" alt="JagoBumn Logo" className="h-10" />
            </div>
            <div className="flex items-center space-x-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/avatars/default.png" alt="Profile" />
                      <AvatarFallback>
                        {profile?.name 
                          ? profile.name.split(' ').map((word: string) => word[0]).join('').toUpperCase().substring(0, 2)
                          : user?.name 
                            ? user.name.split(' ').map((word: string) => word[0]).join('').toUpperCase().substring(0, 2)
                            : user?.email?.substring(0, 2).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64" align="end">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-2">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium leading-none">{profile?.name || user?.name || 'Pengguna'}</p>
                        {profile?.gender && (
                          <span className={`text-xs px-2 py-0.5 rounded-full ${profile.gender === 'male' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'}`}>
                            {profile.gender === 'male' ? 'Laki-laki' : 'Perempuan'}
                          </span>
                        )}
                      </div>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email}
                      </p>
                      {profile && (
                        <div className="mt-1 space-y-1 text-xs text-gray-500">
                          {profile.instance && (
                            <div className="flex items-center gap-1">
                              <span className="font-medium">Instansi:</span> {profile.instance}
                            </div>
                          )}
                          {profile.province && (
                            <div className="flex items-center gap-1">
                              <span className="font-medium">Provinsi:</span> {profile.province}
                            </div>
                          )}
                          {profile.phone && (
                            <div className="flex items-center gap-1">
                              <span className="font-medium">Telepon:</span> {profile.phone}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/profile')} className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profil Saya</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/settings')} className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Pengaturan</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={handleLogout}
                    className="cursor-pointer text-yellow-600 focus:text-yellow-600 focus:bg-yellow-50"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Keluar</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Dashboard;
