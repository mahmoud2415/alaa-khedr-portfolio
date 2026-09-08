import React from 'react';
import { Link } from 'react-router-dom';
import { usePortfolio } from '../../context/PortfolioContext';
import { Phone, MessageCircle } from 'lucide-react';

export default function Navbar() {
  const { craftsmanInfo } = usePortfolio();

  return (
    <header className="sticky top-0 z-40 bg-[#0F0D0B]/95 backdrop-blur-md border-b border-wood-700/60 transition-all">
      <div className="max-w-6xl mx-auto px-4 py-2 sm:py-2.5 flex items-center justify-between gap-3">
        
        {/* Brand Logo & Name */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden border-2 border-wood-amber/60 group-hover:border-wood-amber transition-colors shrink-0 shadow-md">
            <img 
              src={craftsmanInfo.avatar} 
              alt={craftsmanInfo.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-alexandria font-black text-sm sm:text-base text-wood-cream group-hover:text-wood-gold transition-colors tracking-tight">
                {craftsmanInfo.name}
              </h1>
              <span className="w-1.5 h-1.5 rounded-full bg-wood-amber animate-pulse" title="متاح للعمل"></span>
            </div>
            <p className="text-[10px] sm:text-xs font-bold text-wood-muted line-clamp-1">
              {craftsmanInfo.title}
            </p>
          </div>
        </Link>

        {/* Quick Direct Actions */}
        <div className="flex items-center gap-2">
          
          {/* Direct Phone Call */}
          <a
            href={`tel:${craftsmanInfo.phone}`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-wood-850 hover:bg-wood-800 text-wood-cream border border-wood-700 text-xs font-black transition-all shadow-sm active:scale-95"
            title="اتصال هاتفي"
          >
            <Phone className="w-3.5 h-3.5 text-wood-amber stroke-[2.5]" />
            <span className="hidden xs:inline">اتصال</span>
          </a>

          {/* WhatsApp Direct Chat */}
          <a
            href={craftsmanInfo.whatsappDirectUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-wood-amber hover:bg-wood-gold text-white text-xs font-black transition-all shadow-md shadow-wood-amber/25 active:scale-95"
          >
            <MessageCircle className="w-3.5 h-3.5 fill-white" />
            <span>واتساب</span>
          </a>

        </div>

      </div>
    </header>
  );
}
