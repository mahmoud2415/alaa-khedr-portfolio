import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { usePortfolio } from '../context/PortfolioContext';
import ProjectCard from '../components/portfolio/ProjectCard';
import ImageLightbox from '../components/portfolio/ImageLightbox';
import { ChevronRight, Folder, Layers, Filter } from 'lucide-react';

export default function FolderDetailsPage() {
  const { folderId } = useParams();
  const { getFolderById, getProjectsByFolder } = usePortfolio();

  const folder = getFolderById(folderId);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);

  // Lightbox State
  const [lightboxData, setLightboxData] = useState({ isOpen: false, images: [], index: 0 });

  const openLightbox = (images, index = 0) => {
    setLightboxData({ isOpen: true, images, index });
  };

  const closeLightbox = () => {
    setLightboxData({ isOpen: false, images: [], index: 0 });
  };

  if (!folder) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
        <Folder className="w-12 h-12 text-wood-muted/40 mb-3" />
        <h2 className="font-alexandria font-bold text-lg text-wood-cream">الفولدر غير موجود</h2>
        <Link to="/" className="mt-4 px-4 py-2 rounded-xl bg-wood-amber text-white text-xs font-bold">
          العودة للرئيسية
        </Link>
      </div>
    );
  }

  const projects = getProjectsByFolder(folder.id, selectedSubcategory);

  return (
    <div className="min-h-screen pb-16">
      
      {/* ── 1. FOLDER HEADER & BREADCRUMB ───────────────────────────── */}
      <div className="relative overflow-hidden bg-wood-850 border-b border-wood-700/60 py-8">
        
        {/* Background Image with blur */}
        {folder.image && (
          <div 
            className="absolute inset-0 opacity-15 bg-cover bg-center blur-sm pointer-events-none"
            style={{ backgroundImage: `url(${folder.image})` }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-wood-900 via-wood-900/80 to-transparent"></div>

        <div className="relative max-w-6xl mx-auto px-4">
          
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-wood-muted mb-4">
            <Link to="/" className="hover:text-wood-gold transition-colors">
              الرئيسية
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-wood-cream font-bold">{folder.name}</span>
          </nav>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-wood-amber/20 border border-wood-amber/40 flex items-center justify-center text-wood-amber">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-black font-alexandria text-wood-cream">
                    {folder.name}
                  </h1>
                  <p className="text-xs text-wood-muted mt-0.5">
                    {folder.desc}
                  </p>
                </div>
              </div>
            </div>

            <div className="text-xs text-wood-amber font-bold bg-wood-900/90 px-3.5 py-2 rounded-xl border border-wood-700/80 shrink-0 self-start sm:self-auto">
              {projects.length} أعمال متوفرة
            </div>
          </div>

        </div>
      </div>

      {/* ── 2. SUBCATEGORIES FILTER PILLS (HORIZONTAL SCROLL) ───────── */}
      {folder.subcategories && folder.subcategories.length > 0 && (
        <div className="sticky top-16 z-30 bg-[#0F0D0B]/95 backdrop-blur-md border-b border-wood-700/50 py-3">
          <div className="max-w-6xl mx-auto px-4 flex items-center gap-2 overflow-x-auto no-scrollbar">
            
            <button
              onClick={() => setSelectedSubcategory(null)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedSubcategory === null
                  ? 'bg-wood-amber text-white shadow-lg shadow-wood-amber/20 scale-105'
                  : 'bg-wood-850 text-wood-muted hover:text-wood-cream border border-wood-700'
              }`}
            >
              جميع تشطيبات {folder.name}
            </button>

            {folder.subcategories.map((sub) => (
              <button
                key={sub.id}
                onClick={() => setSelectedSubcategory(sub.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedSubcategory === sub.id
                    ? 'bg-wood-amber text-white shadow-lg shadow-wood-amber/20 scale-105'
                    : 'bg-wood-850 text-wood-muted hover:text-wood-cream border border-wood-700'
                }`}
              >
                {sub.name}
              </button>
            ))}

          </div>
        </div>
      )}

      {/* ── 3. PROJECTS GRID ────────────────────────────────────────── */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {projects.length === 0 ? (
          <div className="text-center py-16 glass-card rounded-2xl p-6">
            <Folder className="w-12 h-12 text-wood-muted/30 mx-auto mb-3" />
            <h3 className="font-alexandria font-bold text-sm text-wood-cream">لا توجد أعمال مضافة في هذا القسم حالياً</h3>
            <p className="text-xs text-wood-muted mt-1">سيتم إضافة وتصوير تشطيبات جديدة قريباً من داخل الورشة.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onOpenLightbox={openLightbox}
              />
            ))}
          </div>
        )}
      </main>

      {/* ── 4. LIGHTBOX ─────────────────────────────────────────────── */}
      <ImageLightbox
        isOpen={lightboxData.isOpen}
        images={lightboxData.images}
        initialIndex={lightboxData.index}
        onClose={closeLightbox}
      />

    </div>
  );
}
