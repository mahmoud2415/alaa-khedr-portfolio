import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { usePortfolio } from '../../context/PortfolioContext';
import { Phone, MessageCircle, MapPin, Search, Folder, ShieldCheck } from 'lucide-react';

export default function Navbar() {
  const { craftsmanInfo, searchQuery, setSearchQuery } = usePortfolio();
  const location = useLocation();

  return (
    <header className="sticky top-0 z-40 bg-[#0F0D0B]/90 backdrop-blur-md border-b border-wood-700/60 transition-all">
      {/* Top Banner with direct quick actions */}
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        
        {/* Brand Logo & Name */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden border-2 border-wood-amber/50 group-hover:border-wood-amber transition-colors shrink-0 shadow-lg shadow-wood-amber/10">
            <img 
              src={craftsmanInfo.avatar} 
              alt={craftsmanInfo.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-alexandria font-bold text-sm sm:text-base text-wood-cream group-hover:text-wood-gold transition-colors">
                {craftsmanInfo.name}
              </h1>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" title="متاح للعمل"></span>
            </div>
            <p className="text-[11px] sm:text-xs text-wood-muted line-clamp-1">
              {craftsmanInfo.title}
            </p>
          </div>
        </Link>

        {/* Desktop / Tablet Nav Links & Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Direct Phone Call Button */}
          <a
            href={`tel:${craftsmanInfo.phone}`}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl bg-wood-850 hover:bg-wood-800 text-wood-cream border border-wood-700 text-xs font-bold transition-all shadow-sm active:scale-95"
            title="اتصال هاتفي"
          >
            <Phone className="w-3.5 h-3.5 text-wood-amber" />
            <span className="hidden sm:inline">اتصال</span>
          </a>

          {/* WhatsApp Direct Chat */}
          <a
            href={craftsmanInfo.whatsappDirectUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-lg shadow-emerald-600/20 active:scale-95"
          >
            <MessageCircle className="w-4 h-4 fill-white" />
            <span>واتساب</span>
          </a>

          {/* Admin Link */}
          <Link
            to="/admin"
            className="p-2 rounded-xl bg-wood-850 hover:bg-wood-800 text-wood-muted hover:text-wood-cream border border-wood-700/60 transition-colors"
            title="لوحة الإدارة"
          >
            <ShieldCheck className="w-4 h-4" />
          </Link>
        </div>

      </div>

      {/* Quick Search Bar */}
      <div className="max-w-6xl mx-auto px-4 pb-2.5">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث بكود الشغل (مثل #BED-101) أو نوع الدهان..."
            className="w-full bg-wood-850/80 border border-wood-700/70 rounded-xl px-4 py-2 pr-10 text-xs sm:text-sm text-wood-cream placeholder:text-wood-muted/60 outline-none focus:border-wood-amber focus:ring-1 focus:ring-wood-amber transition-all"
          />
          <Search className="w-4 h-4 text-wood-muted absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-wood-muted hover:text-wood-cream"
            >
              مسح
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
