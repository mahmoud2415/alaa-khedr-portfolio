import React from 'react';
import { Link } from 'react-router-dom';
import { usePortfolio } from '../../context/PortfolioContext';
import { 
  Phone, 
  Mail, 
  MapPin, 
  MessageCircle, 
  Share2, 
  Instagram, 
  Facebook, 
  Youtube, 
  Twitter, 
  Linkedin 
} from 'lucide-react';

export default function Footer() {
  const { craftsmanInfo } = usePortfolio();

  return (
    <footer className="bg-wood-900 border-t border-wood-700/60 pt-12 pb-24 sm:pb-12 text-wood-muted">
      <div className="max-w-6xl mx-auto px-4">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-10 border-b border-wood-700/50">
          
          {/* Col 1: About Craftsman */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img 
                src={craftsmanInfo.avatar} 
                alt={craftsmanInfo.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-wood-amber"
              />
              <div>
                <h3 className="font-alexandria font-bold text-base text-wood-cream">
                  {craftsmanInfo.brandName}
                </h3>
                <p className="text-xs text-wood-amber font-medium">
                  {craftsmanInfo.title}
                </p>
              </div>
            </div>
            <p className="text-xs leading-relaxed text-wood-muted/90">
              {craftsmanInfo.bio}
            </p>
          </div>

          {/* Col 2: Direct Contact Details */}
          <div className="space-y-3">
            <h4 className="font-alexandria font-bold text-sm text-wood-cream">
              معلومات التواصل المباشر
            </h4>
            
            <a 
              href={`tel:${craftsmanInfo.phone}`}
              className="flex items-center gap-3 text-xs hover:text-wood-gold transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-wood-850 flex items-center justify-center text-wood-amber shrink-0 border border-wood-700">
                <Phone className="w-4 h-4" />
              </div>
              <span dir="ltr">{craftsmanInfo.phoneDisplay}</span>
            </a>

            <a 
              href={craftsmanInfo.whatsappDirectUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 text-xs hover:text-emerald-400 transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0 border border-emerald-500/20">
                <MessageCircle className="w-4 h-4" />
              </div>
              <span>محادثة واتساب سريعة</span>
            </a>

            <a 
              href={`mailto:${craftsmanInfo.email}`}
              className="flex items-center gap-3 text-xs hover:text-wood-gold transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-wood-850 flex items-center justify-center text-wood-amber shrink-0 border border-wood-700">
                <Mail className="w-4 h-4" />
              </div>
              <span dir="ltr">{craftsmanInfo.email}</span>
            </a>

            <a 
              href={craftsmanInfo.googleMapsUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-start gap-3 text-xs hover:text-wood-gold transition-colors pt-1"
            >
              <div className="w-8 h-8 rounded-lg bg-wood-850 flex items-center justify-center text-wood-amber shrink-0 border border-wood-700 mt-0.5">
                <MapPin className="w-4 h-4" />
              </div>
              <span className="leading-relaxed">{craftsmanInfo.address}</span>
            </a>
          </div>

          {/* Col 3: Social Networks */}
          <div className="space-y-4">
            <h4 className="font-alexandria font-bold text-sm text-wood-cream">
              تابعنا على شبكات التواصل
            </h4>
            <p className="text-xs text-wood-muted">
              شاهد أحدث فيديوهات وصور التشطيبات الحية من داخل الورشة:
            </p>
            
            <div className="flex flex-wrap gap-2 pt-1">
              {craftsmanInfo.socialLinks?.facebook && (
                <a 
                  href={craftsmanInfo.socialLinks.facebook} 
                  target="_blank" 
                  rel="noreferrer"
                  className="p-2.5 rounded-xl bg-wood-850 hover:bg-[#1877F2] hover:text-white border border-wood-700 text-wood-muted transition-all shadow-sm active:scale-95"
                  title="فيسبوك"
                >
                  <Facebook className="w-4 h-4" />
                </a>
              )}

              {craftsmanInfo.socialLinks?.instagram && (
                <a 
                  href={craftsmanInfo.socialLinks.instagram} 
                  target="_blank" 
                  rel="noreferrer"
                  className="p-2.5 rounded-xl bg-wood-850 hover:bg-[#E4405F] hover:text-white border border-wood-700 text-wood-muted transition-all shadow-sm active:scale-95"
                  title="إنستغرام"
                >
                  <Instagram className="w-4 h-4" />
                </a>
              )}

              {craftsmanInfo.socialLinks?.youtube && (
                <a 
                  href={craftsmanInfo.socialLinks.youtube} 
                  target="_blank" 
                  rel="noreferrer"
                  className="p-2.5 rounded-xl bg-wood-850 hover:bg-[#CD201F] hover:text-white border border-wood-700 text-wood-muted transition-all shadow-sm active:scale-95"
                  title="يوتيوب"
                >
                  <Youtube className="w-4 h-4" />
                </a>
              )}

              {craftsmanInfo.socialLinks?.twitter && (
                <a 
                  href={craftsmanInfo.socialLinks.twitter} 
                  target="_blank" 
                  rel="noreferrer"
                  className="p-2.5 rounded-xl bg-wood-850 hover:bg-black hover:text-white border border-wood-700 text-wood-muted transition-all shadow-sm active:scale-95"
                  title="منصة إكس (تويتر)"
                >
                  <Twitter className="w-4 h-4" />
                </a>
              )}

              {craftsmanInfo.socialLinks?.linkedin && (
                <a 
                  href={craftsmanInfo.socialLinks.linkedin} 
                  target="_blank" 
                  rel="noreferrer"
                  className="p-2.5 rounded-xl bg-wood-850 hover:bg-[#0A66C2] hover:text-white border border-wood-700 text-wood-muted transition-all shadow-sm active:scale-95"
                  title="لينكد إن"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
              )}
            </div>

            {/* Google Maps Button */}
            <div className="pt-2">
              <a 
                href={craftsmanInfo.googleMapsUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-wood-800 hover:bg-wood-700 text-wood-cream text-xs font-bold border border-wood-700 transition-colors"
              >
                <MapPin className="w-3.5 h-3.5 text-wood-amber" />
                <span>فتح موقع الورشة على Google Maps</span>
              </a>
            </div>
          </div>

        </div>

        {/* Bottom Copyright */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-wood-muted/60">
          <p>© {new Date().getFullYear()} {craftsmanInfo.brandName} — جميع الحقوق محفوظة.</p>
          <Link
            to="/admin"
            className="text-[9px] text-wood-muted/30 hover:text-wood-muted/70 transition-colors"
            aria-label="أدمن"
          >
            أدمن
          </Link>
        </div>

      </div>
    </footer>
  );
}
