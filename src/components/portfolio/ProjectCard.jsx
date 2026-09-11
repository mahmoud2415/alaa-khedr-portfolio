import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { usePortfolio } from '../../context/PortfolioContext';
import { MessageCircle, Eye, ChevronLeft, ChevronRight, Share2, Check, ArrowLeft } from 'lucide-react';

export default function ProjectCard({ project, onOpenLightbox }) {
  const { craftsmanInfo } = usePortfolio();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  const images = project.images && project.images.length > 0 
    ? project.images 
    : ["https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=800&q=80"];

  const handleCardClick = () => {
    if (onOpenLightbox) {
      onOpenLightbox(images, currentImageIndex, project.title);
    }
  };

  const nextImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  // WhatsApp Inquiry URL - Project Title then direct work URL
  const projectUrl = `${window.location.origin}/project/${project.id}`;
  const waMessage = `${project.title || 'عمل من المعرض'}\n${projectUrl}`;
  const waUrl = `https://wa.me/${craftsmanInfo.whatsappNumber}?text=${encodeURIComponent(waMessage)}`;

  return (
    <div 
      onClick={handleCardClick}
      className="group rounded-3xl overflow-hidden glass-card hover:border-wood-amber/50 transition-all duration-300 shadow-xl flex flex-col justify-between bg-wood-850/90 cursor-pointer"
    >
      
      {/* Image Carousel / Viewer */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-wood-900 group">
        
        {/* Main Current Image */}
        <img
          src={images[currentImageIndex]}
          alt={project.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Clean Natural Image without dark gradient */}

        {/* Image Controls if multiple images */}
        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/50 text-white/90 hover:bg-black/80 transition-all opacity-80 group-hover:opacity-100 z-10"
              title="الصورة السابقة"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={nextImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/50 text-white/90 hover:bg-black/80 transition-all opacity-80 group-hover:opacity-100 z-10"
              title="الصورة التالية"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Dots indicator */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/60 px-2.5 py-1 rounded-full backdrop-blur-sm z-10">
              {images.map((_, idx) => (
                <span
                  key={idx}
                  className={`h-1.5 rounded-full transition-all ${
                    idx === currentImageIndex ? 'bg-wood-amber w-3.5' : 'bg-white/40 w-1.5'
                  }`}
                />
              ))}
            </div>
          </>
        )}

        {/* Quick Zoom Icon */}
        <div className="absolute top-3 left-3 p-2 rounded-xl bg-black/60 text-white/90 backdrop-blur-sm group-hover:bg-wood-amber group-hover:text-white transition-colors pointer-events-none z-10">
          <Eye className="w-4 h-4" />
        </div>

        {/* Share Button */}
        <button
          onClick={async (e) => {
            e.preventDefault();
            e.stopPropagation();
            const shareUrl = `${window.location.origin}/project/${project.id}`;
            if (navigator.share) {
              try {
                await navigator.share({
                  title: project.title,
                  text: `شاهد ${project.title} - ورشة علاء خضر`,
                  url: shareUrl
                });
              } catch (err) {}
            } else {
              navigator.clipboard.writeText(shareUrl);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }
          }}
          className="absolute top-3 right-3 p-2 rounded-xl bg-black/60 hover:bg-wood-amber text-white/90 backdrop-blur-sm transition-all shadow-md active:scale-90 z-10"
          title="مشاركة العمل"
        >
          {copied ? (
            <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
          ) : (
            <Share2 className="w-4 h-4" />
          )}
        </button>

      </div>

      {/* Card Content & Details */}
      <div className="p-3.5 sm:p-4 flex flex-col gap-2">
        {/* Title */}
        <h3 className="font-alexandria font-black text-sm sm:text-base text-wood-cream group-hover:text-wood-gold transition-colors line-clamp-2 leading-snug">
          {project.title}
        </h3>

        {/* Inline Finish Badge & Action Buttons */}
        <div className="flex items-center justify-between gap-2 pt-1 border-t border-wood-700/40 mt-1">
          {project.paintType ? (
            <span className="inline-block px-2.5 py-1 rounded-xl bg-wood-800 text-[11px] text-wood-amber font-black border border-wood-700/60 truncate max-w-[130px]">
              ✨ {project.paintType}
            </span>
          ) : <span />}

          <div className="flex items-center gap-1.5 shrink-0">
            <Link
              to={`/project/${project.id}`}
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-wood-800 hover:bg-wood-750 text-wood-cream hover:text-wood-amber text-[11px] font-black border border-wood-700/70 transition-all active:scale-95"
              title="صفحة تفاصيل الشغل"
            >
              <span>التفاصيل</span>
              <ArrowLeft className="w-3 h-3 stroke-[2.5]" />
            </Link>

            <a
              href={waUrl}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-wood-amber hover:bg-wood-gold text-white font-black text-[11px] shadow-sm shadow-wood-amber/20 transition-all active:scale-95"
              title="استفسار عبر واتساب"
            >
              <MessageCircle className="w-3.5 h-3.5 fill-white" />
              <span>واتساب</span>
            </a>
          </div>
        </div>
      </div>

    </div>
  );
}

