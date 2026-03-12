"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "@/app/hooks/useTranslation";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const { t } = useTranslation();
  const params = useParams();
  const lang = (params?.lang as string) || "es";

  useEffect(() => {
    // Check if user has already given consent
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      // Small delay for better UX
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookie-consent", "true");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 md:p-6 animate-in fade-in slide-in-from-bottom-10 duration-700">
      <div className="max-w-7xl mx-auto">
        <div className="bg-brand-dark/80 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-6 md:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden group">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-64 h-64 bg-brand-cyan/10 rounded-full blur-[60px] pointer-events-none group-hover:bg-brand-cyan/20 transition-colors duration-500"></div>
          <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-48 h-48 bg-brand-purple/10 rounded-full blur-[50px] pointer-events-none group-hover:bg-brand-purple/20 transition-colors duration-500"></div>
          
          <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-lg md:text-xl font-black text-white uppercase tracking-wider mb-2 flex items-center justify-center md:justify-start gap-3">
                <span className="w-1.5 h-6 bg-brand-cyan rounded-full animate-pulse"></span>
                {t("cookies.title")}
              </h3>
              <p className="text-brand-gray/90 text-sm md:text-base leading-relaxed max-w-3xl">
                {t("cookies.description")}
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0 w-full sm:w-auto">
              <Link
                href={`/${lang}/terms`}
                className="text-xs font-black text-brand-gray/60 uppercase tracking-[0.2em] hover:text-white transition-colors py-2 px-4 italic"
              >
                {t("cookies.learnMore")}
              </Link>
              <button
                onClick={handleAccept}
                className="w-full sm:w-auto bg-brand-gradient text-white font-black uppercase tracking-widest text-xs py-4 px-10 rounded-full hover:scale-105 active:scale-95 transition-all shadow-lg shadow-brand-cyan/20 cursor-pointer"
              >
                {t("cookies.accept")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
