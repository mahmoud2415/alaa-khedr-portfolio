import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { usePortfolio } from '../context/PortfolioContext';
import ImageLightbox from '../components/portfolio/ImageLightbox';
import ProjectCard from '../components/portfolio/ProjectCard';
import { 
  ChevronRight, 
  Tag, 
  MessageCircle, 
  Phone, 
  Share2, 
  Palette, 
  TreePine, 
  Sparkles,
  ArrowRight,
  Eye,
  CheckCircle2
} from 'lucide-react';

export default function ProjectDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getProjectByIdOrCode, getFolderById, getProjectsByFolder, craftsmanInfo } = usePortfolio();

  const project = getProjectByIdOrCode(id);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Lightbox State
  const [lightboxOpen, setLightboxOpen] = useState(false);

  if (!project) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
        <Tag className="w-12 h-12 text-wood-muted/40 mb-3" />
        <h2 className="font-alexandria font-bold text-lg text-wood-cream">العمل المطلوب غير موجود</h2>
        <p className="text-xs text-wood-muted mt-1">تأكد من كود الشغل أو تصفح المعرض</p>
        <Link to="/" className="mt-4 px-4 py-2 rounded-xl bg-wood-amber text-white text-xs font-bold">
          العودة للرئيسية
        </Link>
      </div>
    );
  }

  const folder = getFolderById(project.folderId);
  const relatedProjects = folder 
    ? getProjectsByFolder(folder.id).filter(p => p.id !== project.id).slice(0, 3)
    : [];

  const images = project.images && project.images.length > 0 
    ? project.images 
    : ["https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=800&q=80"];

  // WhatsApp Inquiry Message with exact requested opening
  const waMessage = `السلام عليكم، عايز استفسر عن تفاصيل وسعر الشغل ده:

📋 *بيانات الشغل:*
▪️ كود الشغل: #${project.code || project.id}
▪️ اسم الموديل: ${project.title}
${project.paintType ? `▪️ نوع الدهان والتشطيب: ${project.paintType}\n` : ""}${project.woodType ? `▪️ نوع الخشب: ${project.woodType}\n` : ""}${project.color ? `▪️ اللون واللمعان: ${project.color}\n` : ""}
🔗 رابط الشغل:
${window.location.href}`;

  const waUrl = `https://wa.me/${craftsmanInfo.whatsappNumber}?text=${encodeURIComponent(waMessage)}`;

  // Share
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: project.title,
          text: `شاهد تشطيب ${project.title} - ورشة علاء خضر (كود #${project.code})`,
          url: window.location.href
        });
      } catch (e) {}
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("تم نسخ رابط هذا الشغل بنجاح!");
    }
  };

  return (
    <div className="min-h-screen pb-24">
      
      {/* ── 1. BREADCRUMB & TOP NAV ─────────────────────────────────── */}
      <div className="bg-wood-850 border-b border-wood-700/60 py-3 px-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <nav className="flex items-center gap-2 text-xs text-wood-muted">
            <Link to="/" className="hover:text-wood-gold">الرئيسية</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            {folder && (
              <>
                <Link to={`/folder/${folder.id}`} className="hover:text-wood-gold line-clamp-1 max-w-[120px]">
                  {folder.name}
                </Link>
                <ChevronRight className="w-3.5 h-3.5" />
              </>
            )}
            <span className="text-wood-cream font-bold line-clamp-1">
              #{project.code || project.id}
            </span>
          </nav>

          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 text-xs text-wood-muted hover:text-wood-cream"
          >
            <span>رجوع</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* ── 2. GALLERY COLUMN (7 COLS) ───────────────────────────── */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* Main Hero Image */}
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden glass-card border border-wood-700/80 bg-wood-900 group">
              <img
                src={images[selectedImageIndex]}
                alt={project.title}
                onClick={() => setLightboxOpen(true)}
                className="w-full h-full object-cover cursor-pointer group-hover:scale-105 transition-transform duration-500"
              />

              {/* Code Badge */}
              <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-wood-amber text-white font-alexandria font-black text-sm shadow-xl shadow-wood-amber/30">
                <Tag className="w-4 h-4" />
                <span>#{project.code || project.id}</span>
              </div>

              {/* Zoom Trigger Button */}
              <button
                onClick={() => setLightboxOpen(true)}
                className="absolute bottom-4 right-4 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-black/70 hover:bg-black/90 text-white text-xs font-bold backdrop-blur-md transition-all shadow-lg"
              >
                <Eye className="w-4 h-4" />
                <span>تكبير الصورة</span>
              </button>

              {/* Share */}
              <button
                onClick={handleShare}
                className="absolute bottom-4 left-4 p-2.5 rounded-xl bg-black/70 hover:bg-black/90 text-white backdrop-blur-md transition-all shadow-lg"
                title="مشاركة"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>

            {/* Thumbnail Strip */}
            {images.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                      idx === selectedImageIndex ? 'border-wood-amber scale-105 shadow-md shadow-wood-amber/20' : 'border-wood-700/60 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="thumb" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

          </div>

          {/* ── 3. PROJECT DETAILS & SPECIFICATIONS (5 COLS) ──────────── */}
          <div className="lg:col-span-5 space-y-6">
            
            <div>
              {/* Category tag */}
              {folder && (
                <Link
                  to={`/folder/${folder.id}`}
                  className="inline-block text-xs text-wood-amber hover:underline font-bold mb-2"
                >
                  📁 {folder.name}
                </Link>
              )}

              <h1 className="text-xl sm:text-2xl font-black font-alexandria text-wood-cream leading-snug">
                {project.title}
              </h1>

              {/* Code Bar */}
              <div className="mt-3 inline-flex items-center gap-2 p-2 px-3 rounded-xl bg-wood-850 border border-wood-700 text-xs">
                <span className="text-wood-muted">كود العمل:</span>
                <strong className="text-wood-gold font-alexandria font-bold text-sm tracking-wide">
                  #{project.code || project.id}
                </strong>
              </div>
            </div>

            {/* Description */}
            {project.desc && (
              <div className="p-4 rounded-2xl glass-card border border-wood-700/60">
                <h3 className="font-alexandria font-bold text-xs text-wood-amber mb-1.5">
                  تفاصيل ووصف التشطيب
                </h3>
                <p className="text-xs sm:text-sm text-wood-muted leading-relaxed">
                  {project.desc}
                </p>
              </div>
            )}

            {/* Specifications Grid */}
            <div className="grid grid-cols-2 gap-3">
              
              {project.paintType && (
                <div className="p-3 rounded-xl bg-wood-850 border border-wood-700/60">
                  <div className="flex items-center gap-1.5 text-wood-amber text-xs font-bold mb-1">
                    <Palette className="w-3.5 h-3.5" />
                    <span>نوع الدهان</span>
                  </div>
                  <p className="text-xs text-wood-cream font-medium">
                    {project.paintType}
                  </p>
                </div>
              )}

              {project.woodType && (
                <div className="p-3 rounded-xl bg-wood-850 border border-wood-700/60">
                  <div className="flex items-center gap-1.5 text-wood-amber text-xs font-bold mb-1">
                    <TreePine className="w-3.5 h-3.5" />
                    <span>نوع الخشب</span>
                  </div>
                  <p className="text-xs text-wood-cream font-medium">
                    {project.woodType}
                  </p>
                </div>
              )}

              {project.color && (
                <div className="p-3 rounded-xl bg-wood-850 border border-wood-700/60">
                  <div className="flex items-center gap-1.5 text-wood-amber text-xs font-bold mb-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>درجة اللون واللمعان</span>
                  </div>
                  <p className="text-xs text-wood-cream font-medium">
                    {project.color}
                  </p>
                </div>
              )}

            </div>

            {/* Primary Action Buttons (WhatsApp & Call) */}
            <div className="space-y-3 pt-2">
              
              <a
                href={waUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-sm shadow-xl shadow-emerald-600/30 transition-all active:scale-95"
              >
                <MessageCircle className="w-5 h-5 fill-white" />
                <span>استفسر عن سعر وتفاصيل هذا الشغل عبر واتساب</span>
              </a>

              <a
                href={`tel:${craftsmanInfo.phone}`}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-wood-850 hover:bg-wood-800 text-wood-cream border border-wood-700 font-bold text-xs transition-colors"
              >
                <Phone className="w-4 h-4 text-wood-amber" />
                <span>اتصال مباشر: {craftsmanInfo.phoneDisplay}</span>
              </a>

            </div>

          </div>

        </div>

        {/* ── 4. RELATED WORKS IN SAME FOLDER ───────────────────────── */}
        {relatedProjects.length > 0 && (
          <section className="mt-16 pt-10 border-t border-wood-700/60">
            <h2 className="font-alexandria font-bold text-base sm:text-lg text-wood-cream mb-6">
              أعمال وتشطيبات أخرى من قسم {folder?.name}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedProjects.map((p) => (
                <ProjectCard key={p.id} project={p} onOpenLightbox={() => {}} />
              ))}
            </div>
          </section>
        )}

      </main>

      {/* Lightbox */}
      <ImageLightbox
        isOpen={lightboxOpen}
        images={images}
        initialIndex={selectedImageIndex}
        onClose={() => setLightboxOpen(false)}
      />

    </div>
  );
}
