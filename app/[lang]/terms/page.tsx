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
    <div className="min-h-screen bg-white text-green-950">
      {/* ── HERO ── */}
      <section className="bg-green-50 border-b-2 border-green-100 py-20 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-green-100 border border-green-300 text-green-800 px-5 py-2 rounded-full text-sm font-bold mb-6 uppercase tracking-wide">
            {t("terms.badge")}
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-green-900 leading-tight mb-4 tracking-tight">
            {t("terms.title")}
          </h1>
          <p className="text-xl text-green-700 max-w-2xl mx-auto font-medium opacity-80 leading-relaxed">
            {t("terms.subtitle")}
          </p>
        </div>
      </section>

      {/* ── CONTENIDO ── */}
      <section className="py-20 px-4 bg-white relative -mt-10">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white border-2 border-green-100 rounded-[3rem] p-8 md:p-16 shadow-[0_32px_64px_-16px_rgba(22,101,52,0.1)] relative overflow-hidden">
            <div className="space-y-12 text-green-800 leading-relaxed">
              
              <section className="space-y-4">
                <h2 className="text-2xl font-black text-green-900 flex items-center gap-4">
                  <span className="w-2 h-8 bg-green-600 rounded-full"></span>
                  {t("terms.section1.title")}
                </h2>
                <div className="pl-6 border-l-2 border-green-50 text-lg opacity-90">
                  {t("terms.section1.content")}
                </div>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-black text-green-900 flex items-center gap-4">
                  <span className="w-2 h-8 bg-green-500 rounded-full"></span>
                  {t("terms.section2.title")}
                </h2>
                <div className="pl-6 border-l-2 border-green-50 text-lg opacity-90">
                  {t("terms.section2.content")}
                </div>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-black text-green-900 flex items-center gap-4">
                  <span className="w-2 h-8 bg-green-400 rounded-full"></span>
                  {t("terms.section3.title")}
                </h2>
                <div className="pl-6 border-l-2 border-green-50 text-lg opacity-90">
                  {t("terms.section3.content")}
                </div>
              </section>

              <section className="bg-green-50 border-2 border-green-200 rounded-[2.5rem] p-8 md:p-10 shadow-inner">
                <h2 className="text-2xl font-black text-green-900 flex items-center gap-4 mb-6">
                  <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  {t("terms.section4.title")}
                </h2>
                <p className="font-black text-green-700 text-xl mb-4 italic leading-snug">
                  {t("terms.section4.content")}
                </p>
                <p className="text-lg text-green-800/80 italic">
                  {t("terms.section4.details")}
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-black text-green-900 flex items-center gap-4">
                  <span className="w-2 h-8 bg-green-300 rounded-full"></span>
                  {t("terms.section5.title")}
                </h2>
                <div className="pl-6 border-l-2 border-green-50 text-lg opacity-90">
                  {t("terms.section5.content")}
                </div>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-black text-green-900 flex items-center gap-4">
                  <span className="w-2 h-8 bg-green-200 rounded-full"></span>
                  {t("terms.section6.title")}
                </h2>
                <div className="pl-6 border-l-2 border-green-50 text-lg opacity-90">
                  {t("terms.section6.content")}
                </div>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-black text-green-900 flex items-center gap-4">
                  <span className="w-2 h-8 bg-green-100 rounded-full"></span>
                  {t("terms.section7.title")}
                </h2>
                <div className="pl-6 border-l-2 border-green-50 text-lg opacity-90">
                  {t("terms.section7.content")}
                </div>
              </section>

              <div className="pt-12 border-t border-green-50 flex flex-col md:flex-row justify-between items-center gap-6">
                <p className="text-xs font-bold uppercase tracking-widest text-green-400">
                  {t("terms.lastUpdate")}: <span className="text-green-600">{t("terms.updateDate")}</span>
                </p>
                <div className="flex items-center gap-3 bg-green-50 px-4 py-2 rounded-full border border-green-100">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span>
                  <span className="text-[10px] font-black text-green-700 uppercase tracking-[0.2em]">{t("terms.documentVigente")}</span>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
