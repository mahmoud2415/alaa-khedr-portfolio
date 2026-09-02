import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { usePortfolio } from '../../context/PortfolioContext';
import { MessageCircle, Eye, Share2, ChevronLeft, ChevronRight, Tag, Sparkles } from 'lucide-react';

export default function ProjectCard({ project, onOpenLightbox }) {
  const { craftsmanInfo } = usePortfolio();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const images = project.images && project.images.length > 0 
    ? project.images 
    : ["https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=800&q=80"];

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

  // WhatsApp Inquiry URL with pre-filled custom message for this exact project
  const waMessage = `السلام عليكم يا أسطى علاء،
عاجبني الشغل ده وعايز استفسر عن تفاصيل دهانه وتكلفته:
📌 *كود الشغل:* #${project.code || project.id}
🛋️ *الاسم:* ${project.title}
🎨 *نوع الدهان:* ${project.paintType || "دوكو / إستر"}
${project.woodType ? `🪵 *نوع الخشب:* ${project.woodType}\n` : ""}
رابط الصور على الموقع: ${window.location.origin}/project/${project.id}`;

  const waUrl = `https://wa.me/${craftsmanInfo.whatsappNumber}?text=${encodeURIComponent(waMessage)}`;

  // Share action
  const handleShare = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/project/${project.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: project.title,
          text: `شاهد تشطيب ${project.title} - ورشة علاء خضر (كود #${project.code})`,
          url: shareUrl
        });
      } catch (err) {}
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert("تم نسخ رابط هذا الشغل بنجاح!");
    }
  };

  return (
    <div className="group rounded-2xl overflow-hidden glass-card hover:border-wood-amber/50 transition-all duration-300 shadow-xl flex flex-col justify-between bg-wood-850/90">
      
      {/* Image Carousel / Viewer */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-wood-900 group">
        
        {/* Main Current Image */}
        <img
          src={images[currentImageIndex]}
          alt={project.title}
          onClick={() => onOpenLightbox && onOpenLightbox(images, currentImageIndex)}
          className="w-full h-full object-cover cursor-pointer group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Gradient Shadow */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none"></div>

        {/* Code Badge (Top Right) */}
        <div className="absolute top-3 right-3 flex items-center gap-1 px-3 py-1 rounded-xl bg-wood-amber text-white font-alexandria font-black text-xs shadow-lg shadow-wood-amber/30">
          <Tag className="w-3.5 h-3.5" />
          <span>#{project.code || project.id}</span>
        </div>

        {/* Featured Badge (Top Left) */}
        {project.isFeatured && (
          <div className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-xl bg-wood-900/90 backdrop-blur-md border border-wood-gold/40 text-wood-gold text-[10px] font-bold">
            <Sparkles className="w-3 h-3 text-wood-gold" />
            <span>مميز</span>
          </div>
        )}

        {/* Image Controls if multiple images */}
        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/60 text-white/90 hover:bg-black/90 transition-all opacity-80 group-hover:opacity-100"
              title="الصورة السابقة"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={nextImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/60 text-white/90 hover:bg-black/90 transition-all opacity-80 group-hover:opacity-100"
              title="الصورة التالية"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Dots indicator */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/50 px-2.5 py-1 rounded-full backdrop-blur-sm">
              {images.map((_, idx) => (
                <span
                  key={idx}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    idx === currentImageIndex ? 'bg-wood-gold w-3' : 'bg-white/40'
                  }`}
                />
              ))}
            </div>
          </>
        )}

        {/* Quick View Button */}
        <button
          onClick={() => onOpenLightbox && onOpenLightbox(images, currentImageIndex)}
          className="absolute bottom-3 right-3 p-2 rounded-xl bg-black/60 hover:bg-black/90 text-white text-xs backdrop-blur-sm transition-all"
          title="تكبير الصورة"
        >
          <Eye className="w-4 h-4" />
        </button>

        {/* Share Button */}
        <button
          onClick={handleShare}
          className="absolute bottom-3 left-3 p-2 rounded-xl bg-black/60 hover:bg-black/90 text-white text-xs backdrop-blur-sm transition-all"
          title="مشاركة العمل"
        >
          <Share2 className="w-4 h-4" />
        </button>
      </div>

      {/* Card Content & Details */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Title with link to details */}
          <Link to={`/project/${project.id}`}>
            <h3 className="font-alexandria font-bold text-sm sm:text-base text-wood-cream hover:text-wood-gold transition-colors line-clamp-2">
              {project.title}
            </h3>
          </Link>

          {/* Description */}
          {project.desc && (
            <p className="text-xs text-wood-muted/90 mt-1.5 line-clamp-2 leading-relaxed">
              {project.desc}
            </p>
          )}

          {/* Specifications Chips */}
          <div className="flex flex-wrap gap-1.5 mt-3">
            {project.paintType && (
              <span className="px-2 py-0.5 rounded-lg bg-wood-800 text-[11px] text-wood-amber font-medium border border-wood-700/60">
                🎨 {project.paintType}
              </span>
            )}
            {project.woodType && (
              <span className="px-2 py-0.5 rounded-lg bg-wood-800 text-[11px] text-wood-muted border border-wood-700/60">
                🪵 {project.woodType}
              </span>
            )}
          </div>
        </div>

        {/* Bottom Actions: WhatsApp Direct Code Inquiry */}
        <div className="mt-4 pt-3 border-t border-wood-700/60 flex items-center gap-2">
          
          <a
            href={waUrl}
            target="_blank"
            rel="noreferrer"
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all active:scale-95"
          >
            <MessageCircle className="w-4 h-4 fill-white" />
            <span>استفسر عن هذا الشغل</span>
          </a>

          <Link
            to={`/project/${project.id}`}
            className="p-2.5 rounded-xl bg-wood-800 hover:bg-wood-700 text-wood-cream border border-wood-700 transition-colors"
            title="عرض التفاصيل"
          >
            <ChevronLeft className="w-4 h-4" />
          </Link>

        </div>

      </div>

    </div>
  );
}
