import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, BookOpen, CheckCircle, GraduationCap, Users, Star, Award, Book, Menu } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function Index() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <img src="/Logo.png" alt="JagoBumn Logo" className="h-10" />
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-yellow-600 transition-colors">Fitur</a>
              <a href="#packages" className="text-gray-600 hover:text-yellow-600 transition-colors">Paket</a>
              <a href="#testimonials" className="text-gray-600 hover:text-yellow-600 transition-colors">Testimoni</a>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden md:block">
                <Button 
                  onClick={() => navigate('/auth')}
                  variant="ghost" 
                  className="text-gray-600 hover:text-gray-900"
                >
                  Login
                </Button>
                <Button 
                  onClick={() => navigate('/auth?mode=register')}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white ml-2"
                >
                  Daftar
                </Button>
              </div>
              
              {/* Mobile Menu */}
              <div className="md:hidden">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Menu className="h-6 w-6" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>Menu</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <a href="#features" className="cursor-pointer">Fitur</a>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <a href="#packages" className="cursor-pointer">Paket</a>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <a href="#testimonials" className="cursor-pointer">Testimoni</a>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate('/auth')}>
                      Login
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/auth?mode=register')}>
                      <span className="text-yellow-500 font-medium">Daftar</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-yellow-50 via-white to-yellow-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="bg-yellow-100 text-yellow-600 text-sm font-medium px-3 py-1 rounded-full">
                Platform Belajar BUMN #1
              </span>
              <h1 className="mt-4 text-4xl sm:text-5xl font-bold text-gray-900 leading-tight">
                Siap Dampingi Langkahmu Menuju <span className="text-yellow-500">BUMN 2024</span>
              </h1>
              <p className="mt-6 text-lg text-gray-600">
                Platform belajar online terlengkap dengan ribuan soal latihan dan materi pembelajaran yang diupdate secara berkala.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Button 
                  onClick={() => navigate('/auth?mode=register')}
                  size="lg"
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 font-medium text-base"
                >
                  Mulai Belajar
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  onClick={() => navigate('/free-tryout')}
                  variant="outline"
                  size="lg"
                  className="border-yellow-500 text-yellow-600 hover:bg-yellow-50 px-6 py-3 font-medium text-base"
                >
                  Coba Gratis
                </Button>
              </div>
              <div className="mt-8 grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-500">50K+</div>
                  <div className="text-sm text-gray-600">Pengguna Aktif</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-500">95%</div>
                  <div className="text-sm text-gray-600">Tingkat Kelulusan</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-500">100+</div>
                  <div className="text-sm text-gray-600">Paket Tryout</div>
                </div>
              </div>
            </div>
            <div className="relative hidden lg:block">
              <img
                src="/Banner.jpg"
                alt="Hero"
                className="rounded-2xl shadow-xl"
              />
              <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-lg">
                <div className="flex items-center space-x-2">
                  <Star className="w-5 h-5 text-yellow-400" />
                  <span className="font-bold text-gray-900">4.9/5.0</span>
                </div>
                <div className="text-sm text-gray-600">Rating Pengguna</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">Fitur Unggulan</h2>
            <p className="mt-4 text-xl text-gray-600">
              Persiapkan dirimu dengan fitur-fitur terbaik dari JagoBumn
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl border border-gray-200 hover:border-yellow-300 hover:shadow-lg transition-all duration-200">
              <div className="w-12 h-12 bg-yellow-100 text-yellow-500 rounded-full flex items-center justify-center mb-4">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Materi Lengkap</h3>
              <p className="text-gray-600">
                Akses materi pembelajaran yang komprehensif dan terstruktur untuk persiapan BUMN 2024
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-200 hover:border-yellow-300 hover:shadow-lg transition-all duration-200">
              <div className="w-12 h-12 bg-yellow-100 text-yellow-500 rounded-full flex items-center justify-center mb-4">
                <Book className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Tryout Berkualitas</h3>
              <p className="text-gray-600">
                Latihan soal dengan standar seleksi BUMN untuk membiasakan diri dengan sistem ujian BUMN
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-200 hover:border-yellow-300 hover:shadow-lg transition-all duration-200">
              <div className="w-12 h-12 bg-yellow-100 text-yellow-500 rounded-full flex items-center justify-center mb-4">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Grup Diskusi</h3>
              <p className="text-gray-600">
                Bergabung dengan komunitas belajar untuk berbagi pengalaman dan tips sukses rekrutmen BUMN
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Packages Section */}
      <section id="packages" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="bg-yellow-100 text-yellow-600 text-sm font-medium px-3 py-1 rounded-full">
              Pilih Paket Terbaikmu
            </span>
            <h2 className="mt-4 text-3xl font-bold text-gray-900">
              Paket Belajar yang Sesuai Kebutuhanmu
            </h2>
            <p className="mt-4 text-xl text-gray-600">
              Kami menyediakan berbagai paket belajar yang dapat disesuaikan dengan kebutuhanmu
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Basic Package */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 hover:border-yellow-300 hover:shadow-lg transition-all duration-200">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Paket Basic</h3>
                <div className="text-sm text-gray-600 mb-4">1 Bulan</div>
                <div className="text-3xl font-bold text-yellow-500 mb-1">Rp99.000</div>
              </div>
              <div className="space-y-3 mb-6">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-yellow-500" />
                  <span className="text-gray-600">10 Paket Tryout</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-yellow-500" />
                  <span className="text-gray-600">Pembahasan Soal</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-yellow-500" />
                  <span className="text-gray-600">Grup Diskusi</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-yellow-500" />
                  <span className="text-gray-600">Materi Dasar</span>
                </div>
              </div>
              <Button
                onClick={() => navigate('/auth?mode=register')}
                variant="outline"
                className="w-full border-yellow-500 text-yellow-600 hover:bg-yellow-50"
              >
                Pilih Paket
              </Button>
            </div>
            
            {/* Premium Package */}
            <div className="relative p-6 bg-white rounded-xl border-2 border-yellow-300 shadow-xl">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-yellow-500 text-white text-sm font-medium px-3 py-1 rounded-full">
                  Paling Populer
                </span>
              </div>
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Paket Premium</h3>
                <div className="text-sm text-gray-600 mb-4">3 Bulan</div>
                <div className="text-3xl font-bold text-yellow-500 mb-1">Rp249.000</div>
              </div>
              <div className="space-y-3 mb-6">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-yellow-500" />
                  <span className="text-gray-600">30 Paket Tryout</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-yellow-500" />
                  <span className="text-gray-600">Pembahasan Video</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-yellow-500" />
                  <span className="text-gray-600">Grup Diskusi Premium</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-yellow-500" />
                  <span className="text-gray-600">Materi Lengkap</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-yellow-500" />
                  <span className="text-gray-600">Konsultasi Pribadi</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-yellow-500" />
                  <span className="text-gray-600">Simulasi Tes BUMN</span>
                </div>
              </div>
              <Button
                onClick={() => navigate('/auth?mode=register')}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-white"
              >
                Pilih Paket
              </Button>
            </div>
            
            {/* Ultimate Package */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 hover:border-yellow-300 hover:shadow-lg transition-all duration-200">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Paket Ultimate</h3>
                <div className="text-sm text-gray-600 mb-4">6 Bulan</div>
                <div className="text-3xl font-bold text-yellow-500 mb-1">Rp399.000</div>
              </div>
              <div className="space-y-3 mb-6">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-yellow-500" />
                  <span className="text-gray-600">60 Paket Tryout</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-yellow-500" />
                  <span className="text-gray-600">Pembahasan Video</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-yellow-500" />
                  <span className="text-gray-600">Grup Diskusi Premium</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-yellow-500" />
                  <span className="text-gray-600">Materi Lengkap</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-yellow-500" />
                  <span className="text-gray-600">Konsultasi Pribadi</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-yellow-500" />
                  <span className="text-gray-600">Simulasi Tes BUMN</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-yellow-500" />
                  <span className="text-gray-600">Garansi Kelulusan</span>
                </div>
              </div>
              <Button
                onClick={() => navigate('/auth?mode=register')}
                variant="outline"
                className="w-full border-yellow-500 text-yellow-600 hover:bg-yellow-50"
              >
                Pilih Paket
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">Testimoni Siswa</h2>
            <p className="mt-4 text-xl text-gray-600">
              Apa kata mereka yang berhasil lolos seleksi BUMN bersama kami
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-200">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600 font-bold">
                  RM
                </div>
                <div>
                  <div className="flex items-center mb-2">
                    <Star className="w-4 h-4 text-yellow-400" />
                    <Star className="w-4 h-4 text-yellow-400" />
                    <Star className="w-4 h-4 text-yellow-400" />
                    <Star className="w-4 h-4 text-yellow-400" />
                    <Star className="w-4 h-4 text-yellow-400" />
                  </div>
                  <p className="text-gray-600 mb-4">
                    "Berkat bimbingan dan metode pembelajaran yang terstruktur dari JagoBumn, saya berhasil lolos seleksi BUMN pada kesempatan pertama. Materi dan soal-soal latihannya sangat membantu!"
                  </p>
                  <div>
                    <p className="font-semibold text-gray-900">Ratna Melani</p>
                    <p className="text-sm text-gray-600">Lolos BUMN 2023 - Telkom Indonesia</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-200">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600 font-bold">
                  AS
                </div>
                <div>
                  <div className="flex items-center mb-2">
                    <Star className="w-4 h-4 text-yellow-400" />
                    <Star className="w-4 h-4 text-yellow-400" />
                    <Star className="w-4 h-4 text-yellow-400" />
                    <Star className="w-4 h-4 text-yellow-400" />
                    <Star className="w-4 h-4 text-yellow-400" />
                  </div>
                  <p className="text-gray-600 mb-4">
                    "Fitur simulasi tes BUMN di JagoBumn sangat membantu saya membiasakan diri dengan sistem seleksi BUMN yang sebenarnya. Hasilnya, saya lolos dengan nilai yang memuaskan!"
                  </p>
                  <div>
                    <p className="font-semibold text-gray-900">Ahmad Saputra</p>
                    <p className="text-sm text-gray-600">Lolos BUMN 2023 - Bank Mandiri</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-16 bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">50K+</div>
              <div className="text-yellow-100">Pengguna Aktif</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">95%</div>
              <div className="text-yellow-100">Tingkat Kelulusan</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">100+</div>
              <div className="text-yellow-100">Paket Tryout</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">4.9</div>
              <div className="text-yellow-100">Rating Pengguna</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-yellow-50 rounded-2xl p-8 md:p-12">
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Siap Bergabung dengan BUMN Tahun Ini?
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Mulai persiapkanmu dari sekarang. Bergabung dengan ribuan siswa lain yang telah sukses menjadi karyawan BUMN bersama JagoBumn.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button 
                  onClick={() => navigate('/auth?mode=register')}
                  size="lg"
                  className="bg-yellow-500 hover:bg-yellow-600 text-white"
                >
                  Daftar Sekarang
                </Button>
                <Button 
                  onClick={() => navigate('/free-tryout')}
                  variant="outline"
                  size="lg"
                  className="border-yellow-500 text-yellow-600 hover:bg-yellow-50"
                >
                  Coba Gratis
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <img src="/Logo.png" alt="JagoBumn Logo" className="h-8" />
              </div>
              <p className="text-gray-400">
                Platform belajar online untuk persiapan BUMN 2024 dengan materi berkualitas dan sistem tryout terstruktur.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Produk</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-400 hover:text-white">
                    Tryout BUMN
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white">
                    Materi Pembelajaran
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white">
                    Grup Diskusi
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Perusahaan</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-400 hover:text-white">
                    Tentang Kami
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white">
                    Kontak
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white">
                    Karir
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Bantuan</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-400 hover:text-white">
                    FAQ
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white">
                    Kebijakan Privasi
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white">
                    Syarat dan Ketentuan
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-700 text-center text-gray-400">
            &copy; 2024 JagoBumn. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
