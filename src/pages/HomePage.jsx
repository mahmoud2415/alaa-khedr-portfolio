import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { usePortfolio } from '../context/PortfolioContext';
import FolderCard from '../components/portfolio/FolderCard';
import ProjectCard from '../components/portfolio/ProjectCard';
import ImageLightbox from '../components/portfolio/ImageLightbox';
import { 
  Phone, 
  MessageCircle, 
  MapPin, 
  Sparkles, 
  Layers, 
  CheckCircle2, 
  ShieldCheck, 
  Share2, 
  ArrowLeft,
  Search,
  Paintbrush
} from 'lucide-react';

export default function HomePage() {
  const { folders, projects, craftsmanInfo, searchQuery, setSearchQuery, loading } = usePortfolio();
  
  // Lightbox State
  const [lightboxData, setLightboxData] = useState({ isOpen: false, images: [], index: 0 });

  const openLightbox = (images, index = 0) => {
    setLightboxData({ isOpen: true, images, index });
  };

  const closeLightbox = () => {
    setLightboxData({ isOpen: false, images: [], index: 0 });
  };

  // Filter projects based on search query
  const filteredProjects = searchQuery
    ? projects.filter(p => 
        p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.desc?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.paintType?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.woodType?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const featuredProjects = projects.filter(p => p.isFeatured);

  return (
    <div className="min-h-screen pb-16">
      
      {/* ── 1. HERO & CRAFTSMAN IDENTITY BANNER ────────────────────── */}
      <section className="relative overflow-hidden border-b border-wood-700/60 bg-gradient-to-b from-wood-850 via-[#0F0D0B] to-[#0F0D0B]">
        
        {/* Background Cover Image */}
        <div className="absolute inset-0 opacity-20 bg-cover bg-center mix-blend-overlay pointer-events-none"
             style={{ backgroundImage: `url(${craftsmanInfo.coverImage || craftsmanInfo.avatar})` }}>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F0D0B] via-[#0F0D0B]/80 to-transparent"></div>

        <div className="relative max-w-6xl mx-auto px-4 pt-8 pb-10">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-right">
            
            {/* Craftsman Avatar */}
            <div className="relative shrink-0">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-4 border-wood-amber shadow-2xl shadow-wood-amber/20">
                <img 
                  src={craftsmanInfo.avatar} 
                  alt={craftsmanInfo.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1.5 rounded-full shadow-lg border-2 border-wood-900" title="موثق ومتاح للعمل">
                <CheckCircle2 className="w-4 h-4 fill-emerald-500 text-wood-900" />
              </div>
            </div>

            {/* Craftsman Bio & Title */}
            <div className="flex-1 space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-wood-amber/15 border border-wood-amber/30 text-wood-amber text-xs font-bold">
                <Paintbrush className="w-3.5 h-3.5" />
                <span>{craftsmanInfo.brandName}</span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black font-alexandria text-wood-cream">
                {craftsmanInfo.name}
              </h1>

              <p className="text-xs sm:text-sm font-medium text-wood-amber">
                {craftsmanInfo.title}
              </p>

              <p className="text-xs sm:text-sm text-wood-muted max-w-2xl leading-relaxed mx-auto md:mx-0">
                {craftsmanInfo.bio}
              </p>

              {/* Quick Action Badges (Phone, WhatsApp, Maps) */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 pt-3">
                
                {/* Call */}
                <a
                  href={`tel:${craftsmanInfo.phone}`}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-wood-850 hover:bg-wood-800 text-wood-cream border border-wood-700 font-bold text-xs shadow-md active:scale-95 transition-all"
                >
                  <Phone className="w-4 h-4 text-wood-amber" />
                  <span dir="ltr">{craftsmanInfo.phoneDisplay}</span>
                </a>

                {/* WhatsApp */}
                <a
                  href={craftsmanInfo.whatsappDirectUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/25 active:scale-95 transition-all"
                >
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>تواصل عبر واتساب</span>
                </a>

                {/* Location */}
                <a
                  href={craftsmanInfo.googleMapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-wood-850 hover:bg-wood-800 text-wood-muted hover:text-wood-cream border border-wood-700 text-xs font-medium transition-all"
                >
                  <MapPin className="w-4 h-4 text-wood-amber" />
                  <span>فاقوس — الشرقية</span>
                </a>

              </div>

            </div>

          </div>
        </div>
      </section>

      {/* ── 2. SEARCH RESULTS (IF SEARCHING) ────────────────────────── */}
      {searchQuery && (
        <section className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between pb-4 border-b border-wood-700/60 mb-6">
            <h2 className="font-alexandria font-bold text-lg text-wood-cream flex items-center gap-2">
              <Search className="w-5 h-5 text-wood-amber" />
              <span>نتائج البحث عن: "{searchQuery}"</span>
              <span className="text-xs text-wood-amber bg-wood-850 px-2.5 py-1 rounded-full border border-wood-700">
                {filteredProjects.length} نتيجة
              </span>
            </h2>
            <button
              onClick={() => setSearchQuery("")}
              className="text-xs text-wood-muted hover:text-wood-cream underline"
            >
              إلغاء البحث
            </button>
          </div>

          {filteredProjects.length === 0 ? (
            <div className="text-center py-12 glass-card rounded-2xl p-6">
              <Search className="w-10 h-10 text-wood-muted/40 mx-auto mb-2" />
              <p className="text-sm text-wood-muted">لم يتم العثور على أعمال مطابقة لبحثك.</p>
              <p className="text-xs text-wood-muted/60 mt-1">جرب البحث بكود الشغل (مثل #BED-101) أو نوع الدهان (دوكو، إستر).</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => (
                <ProjectCard key={project.id} project={project} onOpenLightbox={openLightbox} />
              ))}
            </div>
          )}
        </section>
      )}

      {/* ── 3. HIERARCHICAL FOLDERS SECTION ─────────────────────────── */}
      {!searchQuery && (
        <section id="folders-section" className="max-w-6xl mx-auto px-4 py-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-wood-amber" />
                <h2 className="font-alexandria font-bold text-lg sm:text-xl text-wood-cream">
                  فولدرات ومعرض الأعمال
                </h2>
              </div>
              <p className="text-xs text-wood-muted mt-1">
                اختر نوع الأثاث لتصفح أقسام الدهان والتشطيبات المختلفة
              </p>
            </div>
            <span className="text-xs text-wood-amber font-bold bg-wood-850 px-3 py-1.5 rounded-xl border border-wood-700">
              {folders.length} فولدرات
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {folders.map((folder) => (
              <FolderCard key={folder.id} folder={folder} />
            ))}
          </div>
        </section>
      )}

      {/* ── 4. FEATURED WORKS (أعمال مميزة مختارة) ──────────────────── */}
      {!searchQuery && featuredProjects.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 py-8 border-t border-wood-700/50">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-wood-gold" />
                <h2 className="font-alexandria font-bold text-lg sm:text-xl text-wood-cream">
                  أحدث وأبرز التشطيبات المنفذة
                </h2>
              </div>
              <p className="text-xs text-wood-muted mt-1">
                أحدث أعمال الورشة بأكوادها المميزة لطلب نفس الموديل عبر الواتساب
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} onOpenLightbox={openLightbox} />
            ))}
          </div>
        </section>
      )}

      {/* ── 5. LIGHTBOX MODAL ───────────────────────────────────────── */}
      <ImageLightbox
        isOpen={lightboxData.isOpen}
        images={lightboxData.images}
        initialIndex={lightboxData.index}
        onClose={closeLightbox}
      />

    </div>
  );
}
