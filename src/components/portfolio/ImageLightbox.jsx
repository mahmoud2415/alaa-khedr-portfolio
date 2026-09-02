import React, { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Download } from 'lucide-react';

export default function ImageLightbox({ images = [], initialIndex = 0, isOpen, onClose }) {
  const [currentIndex, setCurrentIndex] = React.useState(initialIndex);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex, isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
      if (e.key === 'ArrowLeft') setCurrentIndex((prev) => (prev + 1) % images.length);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, images.length, onClose]);

  if (!isOpen || images.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between p-4 select-none">
      
      {/* Top Controls */}
      <div className="flex items-center justify-between z-10">
        <div className="text-xs sm:text-sm font-bold text-white/80 bg-white/10 px-3 py-1.5 rounded-full">
          {currentIndex + 1} / {images.length}
        </div>

        <div className="flex items-center gap-2">
          <a
            href={images[currentIndex]}
            target="_blank"
            rel="noreferrer"
            download
            className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="تحميل الصورة"
          >
            <Download className="w-5 h-5" />
          </a>

          <button
            onClick={onClose}
            className="p-2.5 rounded-full bg-white/10 hover:bg-rose-500 text-white transition-colors"
            title="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Large Image */}
      <div className="relative flex-1 flex items-center justify-center my-4 overflow-hidden">
        <img
          src={images[currentIndex]}
          alt={`تكبير الصورة ${currentIndex + 1}`}
          className="max-h-full max-w-full object-contain rounded-xl shadow-2xl transition-transform duration-300"
        />

        {/* Prev / Next buttons if multiple */}
        {images.length > 1 && (
          <>
            <button
              onClick={() => setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)}
              className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/30 text-white backdrop-blur-md transition-all active:scale-90"
              title="السابق"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            <button
              onClick={() => setCurrentIndex((prev) => (prev + 1) % images.length)}
              className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/30 text-white backdrop-blur-md transition-all active:scale-90"
              title="التالي"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          </>
        )}
      </div>

      {/* Bottom Thumbnail Strip */}
      {images.length > 1 && (
        <div className="flex items-center justify-center gap-2 overflow-x-auto no-scrollbar py-2">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`relative w-14 h-14 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                idx === currentIndex ? 'border-wood-gold scale-105 opacity-100' : 'border-transparent opacity-50 hover:opacity-80'
              }`}
            >
              <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

    </div>
  );
}
