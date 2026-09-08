import React, { useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { usePortfolio } from '../context/PortfolioContext';
import ProjectCard from '../components/portfolio/ProjectCard';
import ImageLightbox from '../components/portfolio/ImageLightbox';
import { ArrowRight, ArrowLeft, Share2, Check, Sparkles, Folder } from 'lucide-react';

export default function FolderDetailsPage() {
  const { folderId } = useParams();
  const { getFolderById, getProjectsByFolder } = usePortfolio();

  const folder = getFolderById(folderId);
  const [selectedSubcategory, setSelectedSubcategory] = useState(
    () => folder?.subcategories?.[0]?.id || null
  );
  const [copied, setCopied] = useState(false);
  const galleryRef = useRef(null);

  // Update selected subcategory when folderId changes
  React.useEffect(() => {
    if (folder?.subcategories?.length > 0) {
      setSelectedSubcategory(folder.subcategories[0].id);
    } else {
      setSelectedSubcategory(null);
    }
  }, [folderId, folder]);

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

  const handleSelectSubcategory = (subId) => {
    setSelectedSubcategory(subId);
    // Smooth scroll to gallery after selecting
    if (galleryRef.current) {
      galleryRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

  const projects = getProjectsByFolder(folder.id, selectedSubcategory);

  // Helper to get concise subcategory display name
  const getCleanSubcategoryName = (name) => {
    return name
      .replace(/^(غرف نوم|غرف السفرة والنيش|سفرة ونيش|أبواب|مطابخ|صالونات)\s*/, '')
      .trim();
  };

  return (
    <div className="min-h-screen pb-20">
      
      {/* ── 1. COMPACT STICKY TOP BAR (فقط زر رجوع وزر مشاركة) ──────── */}
      <div className="sticky top-0 z-30 bg-[#0F0D0B]/95 backdrop-blur-xl border-b border-wood-700/60 shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-2.5 sm:py-3 flex items-center justify-between">
          
          {/* Back Button */}
          <Link 
            to="/" 
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-wood-850 hover:bg-wood-800 text-wood-cream border border-wood-700 text-xs sm:text-sm font-black transition-all active:scale-95 shrink-0"
          >
            <ArrowRight className="w-4 h-4 text-wood-amber stroke-[2.5]" />
            <span>رجوع</span>
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

        {/* ── 2. RECTANGULAR SUB-CATEGORY CARDS GRID (مربعات / مستطيلات الأقسام فقط بدون بطاقة الكل) ── */}
        {folder.subcategories && folder.subcategories.length > 0 && (
          <section className="mb-8">
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {folder.subcategories.map((sub) => {
                const cleanName = getCleanSubcategoryName(sub.name);
                const isSelected = selectedSubcategory === sub.id;

                return (
                  <button
                    key={sub.id}
                    onClick={() => handleSelectSubcategory(sub.id)}
                    className={`p-4 sm:p-5 rounded-2xl flex items-center justify-between text-right transition-all duration-300 transform active:scale-95 shadow-md ${
                      isSelected
                        ? 'bg-wood-amber text-white border-2 border-wood-amber shadow-wood-amber/30 ring-2 ring-wood-amber/40 scale-[1.02]'
                        : 'bg-wood-850/90 hover:bg-wood-800 text-wood-cream border border-wood-700/80 hover:border-wood-amber/50'
                    }`}
                  >
                    <h3 className="font-alexandria font-black text-sm sm:text-base leading-snug">
                      {cleanName}
                    </h3>
                    <ArrowLeft className={`w-4 h-4 stroke-[2.5] shrink-0 mr-2 ${
                      isSelected ? 'text-white -translate-x-1' : 'text-wood-muted'
                    }`} />
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* ── 3. PROJECTS GALLERY ──────────────────────────────────── */}
        <section ref={galleryRef} className="pt-2">
          
          {/* Active subcategory header */}
          <div className="flex items-center justify-between mb-5 pb-3 border-b border-wood-700/60">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-wood-amber stroke-[2.5]" />
              <h2 className="font-alexandria font-black text-sm sm:text-base text-wood-cream">
                {folder.subcategories?.find(s => s.id === selectedSubcategory)?.name || folder.name}
              </h2>
            </div>
          </div>

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


