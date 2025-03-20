import React, { useState, useEffect } from 'react';

const Carousel = () => {
  const images = [
    '/placeholder.svg',
    '/Banner 3.jpg',
    '/Banner 4.jpg'
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // Mengatur interval untuk mengganti gambar setiap 4 detik
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 4000);

    // Membersihkan interval saat komponen unmount
    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden shadow-xl">
      {/* Carousel container dengan ukuran gambar asli */}
      <div className="relative w-full">
        {images.map((image, index) => (
          <div
            key={index}
            className={`transition-opacity duration-1000 ${
              index === currentIndex ? 'block opacity-100' : 'hidden opacity-0'
            }`}
          >
            <img
              src={image}
              alt={`Slide ${index + 1}`}
              className="w-full object-contain"
            />
          </div>
        ))}
      </div>

      {/* Indikator slide */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-3 h-3 rounded-full transition-colors ${
              index === currentIndex ? 'bg-yellow-500' : 'bg-white bg-opacity-50'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default Carousel; 