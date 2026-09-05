import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { usePortfolio } from '../context/PortfolioContext';
import FolderCard from '../components/portfolio/FolderCard';
import ProjectCard from '../components/portfolio/ProjectCard';
import ImageLightbox from '../components/portfolio/ImageLightbox';
import { 
  Layers, 
  Search,
  ChevronLeft,
  ChevronRight,
  Tag,
  ArrowLeft,
  Eye
} from 'lucide-react';

export default function HomePage() {
  const { folders, projects, craftsmanInfo, searchQuery, setSearchQuery, loading, getBannerProjects } = usePortfolio();
  const navigate = useNavigate();

  // Hero Slider State
  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  // Lightbox State
  const [lightboxData, setLightboxData] = useState({ isOpen: false, images: [], index: 0 });
  const [bannerIndex, setBannerIndex] = useState(0);
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
  const bannerProjects = getBannerProjects();
  const sliderProjects = bannerProjects.length > 0
    ? bannerProjects
    : (featuredProjects.length > 0 ? featuredProjects : projects.slice(0, 5));

  // Auto slide effect
  useEffect(() => {
    if (sliderProjects.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sliderProjects.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [sliderProjects.length]);

  // Touch Swipe for Mobile
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
    const isLeftSwipe = distance > 40;
    const isRightSwipe = distance < -40;

    if (isLeftSwipe) {
      // In RTL next slide
      setCurrentSlide((prev) => (prev + 1) % sliderProjects.length);
    } else if (isRightSwipe) {
      setCurrentSlide((prev) => (prev - 1 + sliderProjects.length) % sliderProjects.length);
    }
  };

  const prevSlide = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentSlide((prev) => (prev - 1 + sliderProjects.length) % sliderProjects.length);
  };

  const nextSlide = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentSlide((prev) => (prev + 1) % sliderProjects.length);
  };

  const currentProj = sliderProjects[currentSlide];
  const slideImage = currentProj?.images?.[0] || craftsmanInfo.coverImage || "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1600&q=80";

  return (
    <div className="min-h-screen pb-16">
      
      {/* ── 1. LUXURY EDITORIAL HERO SLIDER BANNER ────────────────────── */}
      {!searchQuery && sliderProjects.length > 0 && (
        <section className="relative w-full max-w-6xl mx-auto px-4 pt-6 sm:pt-8 pb-6 sm:pb-10">
          <div 
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="relative w-full aspect-[16/10] sm:aspect-[21/9] lg:aspect-[24/9] min-h-[280px] sm:min-h-[360px] rounded-3xl overflow-hidden shadow-2xl border border-wood-700/60 bg-wood-900 group"
          >
            {/* The Entire Banner is Clickable Link */}
            <Link 
              to={`/project/${currentProj.id}`}
              className="block absolute inset-0 w-full h-full cursor-pointer"
            >
              {/* Slide Background Image with Smooth Fade Transition */}
              <img
                key={currentProj.id}
                src={slideImage}
                alt={currentProj.title}
                className="w-full h-full object-cover transform scale-105 group-hover:scale-100 transition-transform duration-700 ease-out animate-fadeIn"
              />

              {/* High-End Dark Vignette & Gradient Overlays */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0F0D0B] via-[#0F0D0B]/40 to-transparent"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-[#0F0D0B]/70 via-transparent to-transparent"></div>

              {/* Corner Minimalist Content (Title & "اتفرج" Button Only) */}
              <div className="absolute bottom-0 right-0 left-0 p-5 sm:p-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                
                <div className="max-w-xl text-right">
                  {/* Title Only */}
                  <h2 className="text-lg sm:text-2xl lg:text-3xl font-black font-alexandria text-wood-cream drop-shadow-md line-clamp-2">
                    {currentProj.title}
                  </h2>
                </div>

                {/* "اتفرج" Action Button */}
                <div className="shrink-0 self-start sm:self-end">
                  <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-wood-amber hover:bg-wood-gold text-white font-alexandria font-bold text-xs sm:text-sm shadow-xl shadow-wood-amber/30 group-hover:scale-105 active:scale-95 transition-all">
                    <span>اتفرج</span>
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  </div>
                </div>

              </div>
            </Link>

            {/* Slider Navigation Arrows */}
            {sliderProjects.length > 1 && (
              <>
                <button
                  onClick={prevSlide}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 sm:p-2.5 rounded-full bg-black/50 hover:bg-black/80 text-white/90 backdrop-blur-sm border border-white/10 shadow-lg opacity-0 group-hover:opacity-100 transition-all z-20"
                  title="العمل السابق"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>

                <button
                  onClick={nextSlide}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2 sm:p-2.5 rounded-full bg-black/50 hover:bg-black/80 text-white/90 backdrop-blur-sm border border-white/10 shadow-lg opacity-0 group-hover:opacity-100 transition-all z-20"
                  title="العمل التالي"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                {/* Slider Dot Indicators */}
                <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 bg-black/60 px-3 py-1.5 rounded-full backdrop-blur-md border border-white/10">
                  {sliderProjects.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setCurrentSlide(idx);
                      }}
                      className={`h-1.5 rounded-full transition-all ${
                        idx === currentSlide ? 'bg-wood-amber w-6' : 'bg-white/40 hover:bg-white/70 w-2'
                      }`}
                      title={`انتقل للشريحة ${idx + 1}`}
                    />
                  ))}
                </div>
              </>
            )}

          </div>
        </section>
      )}

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
        <section id="folders-section" className="max-w-6xl mx-auto px-4 py-14 sm:py-20">
          <div className="flex items-center justify-between mb-10">
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

          <div className="grid grid-cols-1 gap-10 sm:gap-12">
            {folders.map((folder) => (
              <FolderCard key={folder.id} folder={folder} />
            ))}
          </div>
        </section>
      )}

      {/* ── 4. LIGHTBOX MODAL ───────────────────────────────────────── */}
      <ImageLightbox
        isOpen={lightboxData.isOpen}
        images={lightboxData.images}
        initialIndex={lightboxData.index}
        onClose={closeLightbox}
      />

    </div>
  );
}
