import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Index() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-500 to-blue-700">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-6">
            Selamat Datang di Blue Sky CBT
          </h1>
          <p className="text-xl text-white mb-8">
            Platform Tryout Online untuk Persiapan Ujianmu
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
            <button
              onClick={() => navigate('/auth')}
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              Masuk
            </button>
            <button
              onClick={() => navigate('/free-tryout')}
              className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors"
            >
              Coba Tryout Gratis
            </button>
          </div>
        </div>

        {/* Fitur-fitur */}
        <div className="grid md:grid-cols-3 gap-8 mt-16">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              Tryout Online
            </h3>
            <p className="text-gray-600">
              Latihan ujian dengan soal-soal berkualitas dan terstandar
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              Pembahasan Lengkap
            </h3>
            <p className="text-gray-600">
              Setiap soal dilengkapi dengan pembahasan detail
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              Analisis Hasil
            </h3>
            <p className="text-gray-600">
              Laporan detail hasil tryout dan rekomendasi belajar
            </p>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center text-white">
          <p>© 2024 Blue Sky CBT. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}