import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { usePortfolio } from '../../context/PortfolioContext';
import { Home, FolderTree, Phone, MessageCircle, ShieldCheck } from 'lucide-react';

export default function BottomNav() {
  const { craftsmanInfo } = usePortfolio();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-2 sm:hidden pointer-events-none">
      <div className="max-w-md mx-auto glass-wood rounded-2xl border border-wood-700/80 p-2 shadow-2xl pointer-events-auto flex items-center justify-around gap-1">
        
        {/* Home */}
        <Link
          to="/"
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl text-[11px] font-bold transition-all ${
            isActive('/') ? 'text-wood-gold bg-wood-800/80 shadow-inner' : 'text-wood-muted hover:text-wood-cream'
          }`}
        >
          <Home className="w-4 h-4 mb-0.5" />
          <span>الرئيسية</span>
        </Link>

        {/* Folders */}
        <Link
          to="/#folders-section"
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl text-[11px] font-bold transition-all ${
            location.pathname.startsWith('/folder') ? 'text-wood-gold bg-wood-800/80 shadow-inner' : 'text-wood-muted hover:text-wood-cream'
          }`}
        >
          <FolderTree className="w-4 h-4 mb-0.5" />
          <span>الأقسام</span>
        </Link>

        {/* Floating Core WhatsApp Button (Thumb Reach) */}
        <a
          href={craftsmanInfo.whatsappDirectUrl}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 active:bg-emerald-700 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 scale-105 active:scale-95 transition-all"
        >
          <MessageCircle className="w-4 h-4 fill-white" />
          <span>واتساب</span>
        </a>

        {/* Call Button */}
        <a
          href={`tel:${craftsmanInfo.phone}`}
          className="flex flex-col items-center justify-center py-1.5 px-3 rounded-xl text-[11px] font-bold text-wood-cream bg-wood-800/60 active:bg-wood-700 transition-all"
        >
          <Phone className="w-4 h-4 text-wood-amber mb-0.5" />
          <span>اتصال</span>
        </a>

        {/* Admin */}
        <Link
          to="/admin"
          className={`flex flex-col items-center justify-center py-1.5 px-2.5 rounded-xl text-[10px] font-bold transition-all ${
            isActive('/admin') ? 'text-wood-gold bg-wood-800/80' : 'text-wood-muted hover:text-wood-cream'
          }`}
        >
          <ShieldCheck className="w-4 h-4 mb-0.5" />
          <span>الإدارة</span>
        </Link>

      </div>
    </div>
  );
}
