"use client";

import { useTranslation } from "@/app/hooks/useTranslation";
import { useParams } from "next/navigation";
import { useEffect } from "react";

export default function TermsPage() {
  const { t } = useTranslation();
  const params = useParams();
  const lang = (params?.lang as string) || "es";

  // Actualizar título y meta description
  useEffect(() => {
    const title = t("terms.title") || "Términos y Condiciones";
    document.title = `${title} | Jombo`;

    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content',
        'Términos y condiciones de uso de Jombo. Lee sobre nuestras políticas y limitaciones de responsabilidad.'
      );
    }
  }, [t, lang]);

  return (
    <div className="max-w-5xl mx-auto py-12 px-4 sm:px-6 relative">
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[400px] h-[400px] bg-brand-cyan/5 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-[300px] h-[300px] bg-brand-purple/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tightest uppercase italic mb-4">
          {t("terms.title")}
        </h1>
        <p className="text-brand-gray/80 font-bold uppercase tracking-[0.2em] text-xs">
          Protocolos de uso y regulaciones de la red
        </p>
      </div>

      <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-hacker-dots opacity-5 pointer-events-none"></div>

        <div className="relative space-y-10 text-brand-gray/80 leading-relaxed">
          <section>
            <h2 className="text-xl font-black text-white uppercase tracking-wider mb-4 flex items-center gap-3">
              <span className="w-1.5 h-6 bg-brand-cyan rounded-full"></span>
              {t("terms.section1.title")}
            </h2>
            <p className="text-sm md:text-base">{t("terms.section1.content")}</p>
          </section>

          <section>
            <h2 className="text-xl font-black text-white uppercase tracking-wider mb-4 flex items-center gap-3">
              <span className="w-1.5 h-6 bg-brand-purple rounded-full"></span>
              {t("terms.section2.title")}
            </h2>
            <p className="text-sm md:text-base">{t("terms.section2.content")}</p>
          </section>

          <section>
            <h2 className="text-xl font-black text-white uppercase tracking-wider mb-4 flex items-center gap-3">
              <span className="w-1.5 h-6 bg-brand-cyan rounded-full"></span>
              {t("terms.section3.title")}
            </h2>
            <p className="text-sm md:text-base">{t("terms.section3.content")}</p>
          </section>

          <section className="bg-brand-pink/5 border border-brand-pink/20 rounded-[2rem] p-6 md:p-8">
            <h2 className="text-xl font-black text-brand-pink uppercase tracking-wider mb-4 flex items-center gap-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              {t("terms.section4.title")}
            </h2>
            <p className="font-bold text-brand-pink text-sm md:text-base mb-4 uppercase italic tracking-wide">{t("terms.section4.content")}</p>
            <p className="text-sm md:text-base opacity-80">{t("terms.section4.details")}</p>
          </section>

          <section>
            <h2 className="text-xl font-black text-white uppercase tracking-wider mb-4 flex items-center gap-3">
              <span className="w-1.5 h-6 bg-brand-purple rounded-full"></span>
              {t("terms.section5.title")}
            </h2>
            <p className="text-sm md:text-base">{t("terms.section5.content")}</p>
          </section>

          <section>
            <h2 className="text-xl font-black text-white uppercase tracking-wider mb-4 flex items-center gap-3">
              <span className="w-1.5 h-6 bg-brand-cyan rounded-full"></span>
              {t("terms.section6.title")}
            </h2>
            <p className="text-sm md:text-base">{t("terms.section6.content")}</p>
          </section>

          <section>
            <h2 className="text-xl font-black text-white uppercase tracking-wider mb-4 flex items-center gap-3">
              <span className="w-1.5 h-6 bg-brand-purple rounded-full"></span>
              {t("terms.section7.title")}
            </h2>
            <p className="text-sm md:text-base">{t("terms.section7.content")}</p>
          </section>

          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs font-black uppercase tracking-widest text-brand-gray/40 italic">
              {t("terms.lastUpdate")}: <span className="text-brand-gray/80">{t("terms.updateDate")}</span>
            </p>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand-cyan animate-pulse"></span>
              <span className="text-[10px] font-black text-brand-cyan uppercase tracking-[0.3em]">Status: Verified</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
