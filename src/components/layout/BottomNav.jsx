import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home } from 'lucide-react';

export default function BottomNav() {
  const location = useLocation();

  const handleClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#0F0D0B]/95 backdrop-blur-md border-t border-wood-700/70 py-2.5 px-4 flex items-center justify-center shadow-2xl shadow-black">
      <Link
        to="/"
        onClick={handleClick}
        className="flex items-center justify-center gap-2 w-full max-w-xs py-2 px-6 rounded-xl bg-wood-850 hover:bg-wood-800 text-wood-cream hover:text-wood-gold border border-wood-amber/40 hover:border-wood-amber shadow-md transition-all active:scale-95 text-xs font-alexandria font-bold group"
      >
        <div className="w-5 h-5 rounded-lg bg-wood-amber/20 group-hover:bg-wood-amber/30 flex items-center justify-center text-wood-amber transition-colors">
          <Home className="w-3.5 h-3.5" />
        </div>
        <span>الرئيسية</span>
      </Link>
    </div>
  );
}
