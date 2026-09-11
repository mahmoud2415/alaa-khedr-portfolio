import React from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import FolderCard from '../components/portfolio/FolderCard';
import { Folder } from 'lucide-react';

export default function HomePage() {
  const { folders } = usePortfolio();

  return (
    <div className="min-h-screen pb-20">
      
      {/* ── LUXURY FOLDER ALBUMS SECTION ──────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 pt-6 sm:pt-10">
        
        {/* Section Title Header */}
        <div className="flex items-center justify-between mb-8 pb-5 border-b border-wood-700/60">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-wood-amber/20 border border-wood-amber/40 flex items-center justify-center text-wood-amber shadow-sm shrink-0">
              <Folder className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="font-alexandria font-black text-lg sm:text-2xl text-wood-cream tracking-tight">
                معرض الأعمال والتشطيبات
              </h2>
            </div>
          </div>
          
          <span className="text-xs sm:text-sm text-wood-amber bg-wood-850 px-4 py-2 rounded-2xl border border-wood-700/80 font-black shrink-0">
            {folders.length} أقسام
          </span>
        </div>

        {/* Folders Grid / Empty State */}
        {folders.length === 0 ? (
          <div className="text-center py-16 px-6 glass-card rounded-3xl border border-wood-700/50 max-w-lg mx-auto my-8 bg-wood-850/80">
            <div className="w-16 h-16 rounded-3xl bg-wood-amber/15 border border-wood-amber/30 flex items-center justify-center text-wood-amber mx-auto mb-4">
              <Folder className="w-8 h-8 stroke-[2]" />
            </div>
            <h3 className="font-alexandria font-black text-lg text-wood-cream mb-2">
              لا توجد أقسام مضافة حالياً
            </h3>
            <p className="text-xs sm:text-sm text-wood-muted font-bold leading-relaxed mb-6">
              المعرض جاهز للبدء من الصفر. يمكنك إنشاء أقسام جديدة وتحديد أنواع التشطيبات من خلال لوحة التحكم.
            </p>
            <a
              href="/admin"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-wood-amber hover:bg-wood-gold text-white font-black text-xs sm:text-sm shadow-xl shadow-wood-amber/25 transition-all active:scale-95"
            >
              <span>فتح لوحة التحكم لإضافة قسم</span>
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {folders.map((folder) => (
              <FolderCard key={folder.id} folder={folder} />
            ))}
          </div>
        )}

      </section>

    </div>
  );
}


