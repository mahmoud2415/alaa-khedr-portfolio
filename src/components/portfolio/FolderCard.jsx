import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { usePortfolio } from '../../context/PortfolioContext';
import { ArrowLeft, Share2, Check } from 'lucide-react';

export default function FolderCard({ folder }) {
  const { getProjectsByFolder } = usePortfolio();
  const folderProjects = getProjectsByFolder(folder.id);
  const [copied, setCopied] = useState(false);

  const handleShare = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/folder/${folder.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: folder.name,
          text: `شاهد أعمال وتشطيبات ${folder.name} - ورشة علاء خضر`,
          url: shareUrl
        });
      } catch (err) {}
    } else {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Link
      to={`/folder/${folder.id}`}
      className="group block relative rounded-3xl overflow-hidden glass-card hover:border-wood-amber/70 transition-all duration-300 transform hover:-translate-y-1.5 shadow-2xl bg-wood-850/90"
    >
      {/* Folder Cover Image */}
      <div className="relative aspect-[16/10] sm:aspect-[4/3] w-full overflow-hidden bg-wood-900">
        <img
          src={folder.image || "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=800&q=80"}
          alt={folder.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          loading="lazy"
        />

        {/* Top Share Button */}
        <button
          onClick={handleShare}
          className="absolute top-4 right-4 p-2.5 rounded-2xl bg-black/70 hover:bg-wood-amber text-white backdrop-blur-md border border-white/15 transition-all shadow-xl active:scale-90 z-10"
          title="مشاركة القسم"
        >
          {copied ? (
            <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
          ) : (
            <Share2 className="w-4 h-4 stroke-[2.5]" />
          )}
        </button>

        {/* Top Count Tag */}
        <div className="absolute top-4 left-4 px-3.5 py-1.5 rounded-2xl bg-black/70 backdrop-blur-md border border-white/15 text-xs sm:text-sm font-black text-wood-gold shadow-xl">
          <span>{folderProjects.length} أعمال</span>
        </div>

        {/* Bottom Title Bar */}
        <div className="absolute bottom-0 right-0 left-0 p-5 sm:p-6 flex items-center justify-between gap-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
          <h3 className="font-alexandria font-black text-lg sm:text-xl text-wood-cream group-hover:text-wood-gold transition-colors">
            {folder.name}
          </h3>

          <div className="p-3 rounded-2xl bg-wood-amber group-hover:bg-wood-gold text-white transition-colors shadow-lg shadow-wood-amber/30 shrink-0">
            <ArrowLeft className="w-5 h-5 stroke-[2.5] group-hover:-translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </Link>
  );
}


