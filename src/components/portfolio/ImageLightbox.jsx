import React, { useEffect, useState } from 'react';
import { X, ChevronLeft, ChevronRight, MessageCircle } from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext';

export default function ImageLightbox({ images = [], initialIndex = 0, projectTitle = "", isOpen, onClose }) {
  const { craftsmanInfo } = usePortfolio();
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

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

  const handleTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > 45) {
      // In RTL swipe next
      setCurrentIndex((prev) => (prev + 1) % images.length);
    } else if (distance < -45) {
      // Swipe prev
      setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    }
  };

  if (!isOpen || images.length === 0) return null;

  const currentImg = images[currentIndex] || images[0] || "";
  const waMessage = `${projectTitle || 'عمل من المعرض'}\n${window.location.href}`;
  const waUrl = `https://wa.me/${craftsmanInfo.whatsappNumber}?text=${encodeURIComponent(waMessage)}`;

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between p-3 sm:p-5 select-none"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      
      {/* Top Controls */}
      <div className="flex items-center justify-between z-20">
        <div className="text-xs font-bold text-white/80 bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm">
          {currentIndex + 1} / {images.length}
        </div>

        {projectTitle && (
          <div className="hidden sm:block text-xs font-bold text-wood-cream/90 truncate max-w-md">
            {projectTitle}
          </div>
        )}

        <button
          onClick={onClose}
          className="p-2.5 rounded-full bg-white/10 hover:bg-rose-600 text-white transition-colors"
          title="إغلاق"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Large Image */}
      <div className="relative flex-1 flex items-center justify-center my-2 overflow-hidden">
        <img
          src={currentImg}
          alt={projectTitle || `صورة ${currentIndex + 1}`}
          className="max-h-full max-w-full object-contain rounded-2xl shadow-2xl transition-all duration-300"
        />

        {/* Prev / Next buttons if multiple */}
        {images.length > 1 && (
          <>
            <button
              onClick={() => setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)}
              className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md border border-white/10 transition-all active:scale-90"
              title="السابق"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            <button
              onClick={() => setCurrentIndex((prev) => (prev + 1) % images.length)}
              className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md border border-white/10 transition-all active:scale-90"
              title="التالي"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          </>
        )}
      </div>

      {/* Bottom Floating Action Bar */}
      <div className="flex flex-col items-center gap-3 z-20 pt-2">
        
        {/* WhatsApp Inquiry Button */}
        <a
          href={waUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-wood-amber hover:bg-wood-gold active:bg-amber-600 text-white font-bold text-sm shadow-xl shadow-wood-amber/30 active:scale-95 transition-all"
        >
          <MessageCircle className="w-4 h-4 fill-white" />
          <span>استفسر عن هذا الشغل</span>
        </a>

        {/* Thumbnails Strip if multiple */}
        {images.length > 1 && (
          <div className="flex items-center justify-center gap-2 overflow-x-auto no-scrollbar max-w-full pb-1">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`relative w-12 h-12 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                  idx === currentIndex ? 'border-wood-gold scale-105 opacity-100 ring-2 ring-wood-gold/40' : 'border-transparent opacity-40 hover:opacity-80'
                }`}
              >
                <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

      </div>

    </div>
  );
}

