import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { usePortfolio } from '../context/PortfolioContext';
import ProjectCard from '../components/portfolio/ProjectCard';
import ImageLightbox from '../components/portfolio/ImageLightbox';
import { ArrowRight, Share2, Check, Sparkles, Folder } from 'lucide-react';

export default function FolderDetailsPage() {
  const { folderId } = useParams();
  const { getFolderById, getProjectsByFolder } = usePortfolio();

  const folder = getFolderById(folderId);
  const [copied, setCopied] = useState(false);

  // Lightbox State
  const [lightboxData, setLightboxData] = useState({ isOpen: false, images: [], index: 0, title: '' });

  const openLightbox = (images, index = 0, title = '') => {
    setLightboxData({ isOpen: true, images, index, title });
  };

  const closeLightbox = () => {
    setLightboxData({ isOpen: false, images: [], index: 0, title: '' });
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/folder/${folderId}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: folder?.name || 'معرض الأعمال',
          text: `شاهد تشطيبات وموديلات ${folder?.name} - ورشة علاء خضر`,
          url: shareUrl
        });
      } catch (err) {}
    } else {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!folder) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
        <Folder className="w-12 h-12 text-wood-muted/40 mb-3" />
        <h2 className="font-alexandria font-black text-lg text-wood-cream">القسم غير موجود</h2>
        <Link to="/" className="mt-4 px-5 py-2.5 rounded-xl bg-wood-amber text-white text-xs font-black">
          العودة للرئيسية
        </Link>
      </div>
    );
  }

  const projects = getProjectsByFolder(folder.id);

  return (
    <div className="min-h-screen pb-20">
      
      {/* ── 1. COMPACT STICKY TOP BAR ──────── */}
      <div className="sticky top-0 z-30 bg-[#0F0D0B]/95 backdrop-blur-xl border-b border-wood-700/60 shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-2.5 sm:py-3 flex items-center justify-between">
          
          {/* Back Button */}
          <Link 
            to="/" 
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-wood-850 hover:bg-wood-800 text-wood-cream border border-wood-700 text-xs sm:text-sm font-black transition-all active:scale-95 shrink-0"
          >
            <ArrowRight className="w-4 h-4 text-wood-amber stroke-[2.5]" />
            <span>رجوع للرئيسية</span>
          </Link>

          {/* Share Button */}
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-wood-850 hover:bg-wood-amber text-wood-cream hover:text-white border border-wood-700 text-xs font-black transition-all active:scale-95 shrink-0"
            title="مشاركة هذا القسم"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />
                <span className="text-[11px] text-emerald-400">تم النسخ</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-wood-amber stroke-[2.5]" />
                <span>مشاركة</span>
              </>
            )}
          </button>

        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 pt-6">

        {/* ── 2. FOLDER HEADER ────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-6 pb-3.5 border-b border-wood-700/60">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-wood-amber stroke-[2.5]" />
            <h1 className="font-alexandria font-black text-lg sm:text-2xl text-wood-cream">
              {folder.name}
            </h1>
          </div>
          <span className="px-3 py-1 rounded-xl bg-wood-850 border border-wood-700 text-xs font-black text-wood-gold">
            {projects.length} {projects.length === 1 ? 'عمل' : 'أعمال'}
          </span>
        </div>

        {/* ── 3. PROJECTS GALLERY ──────────────────────────────────── */}
        <section>
          {projects.length === 0 ? (
            <div className="text-center py-16 glass-card rounded-3xl p-8 border border-wood-700/50">
              <Folder className="w-10 h-10 text-wood-muted/40 mx-auto mb-2" />
              <h3 className="font-alexandria font-black text-sm text-wood-cream">لا توجد أعمال مضافة في هذا القسم حالياً</h3>
              <p className="text-xs font-bold text-wood-muted mt-1">سيتم إضافة وتصوير تشطيبات جديدة قريباً من داخل الورشة.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onOpenLightbox={openLightbox}
                />
              ))}
            </div>
          )}
        </section>

      </div>

      {/* ── 4. LIGHTBOX ─────────────────────────────────────────────── */}
      <ImageLightbox
        isOpen={lightboxData.isOpen}
        images={lightboxData.images}
        initialIndex={lightboxData.index}
        projectTitle={lightboxData.title}
        onClose={closeLightbox}
      />

    </div>
  );
}
