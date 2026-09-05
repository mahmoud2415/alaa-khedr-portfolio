import React from 'react';
import { Link } from 'react-router-dom';
import { usePortfolio } from '../../context/PortfolioContext';
import { Folder, ChevronLeft, Bed, Utensils, DoorOpen, Layers, Armchair } from 'lucide-react';

const ICON_MAP = {
  Bed,
  Utensils,
  DoorOpen,
  Layers,
  Armchair
};

export default function FolderCard({ folder }) {
  const { getProjectsByFolder } = usePortfolio();
  const folderProjects = getProjectsByFolder(folder.id);
  const IconComponent = ICON_MAP[folder.icon] || Folder;

  return (
    <Link
      to={`/folder/${folder.id}`}
      className="group block relative rounded-2xl overflow-hidden glass-card hover:border-wood-amber/60 transition-all duration-300 transform hover:-translate-y-1 shadow-lg"
    >
      {/* Folder Cover Image */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-wood-850">
        <img
          src={folder.image || "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=800&q=80"}
          alt={folder.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80 group-hover:opacity-100"
          loading="lazy"
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F0D0B] via-[#0F0D0B]/60 to-transparent"></div>

        {/* Top Folder Badge */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-wood-900/90 backdrop-blur-md border border-wood-700/80 text-xs font-bold text-wood-cream shadow-md">
          <IconComponent className="w-3.5 h-3.5 text-wood-amber" />
          <span>{folderProjects.length} أعمال منفذة</span>
        </div>
      </div>

      {/* Folder Content */}
      <div className="p-5 sm:p-6 relative">
        <h3 className="font-alexandria font-bold text-base text-wood-cream group-hover:text-wood-gold transition-colors flex items-center justify-between">
          <span>{folder.name}</span>
          <ChevronLeft className="w-4 h-4 text-wood-muted group-hover:text-wood-amber group-hover:-translate-x-1 transition-all" />
        </h3>
        
        <p className="text-xs sm:text-sm text-wood-muted/80 mt-2 line-clamp-2 leading-6">
          {folder.desc}
        </p>

      </div>
    </Link>
  );
}
