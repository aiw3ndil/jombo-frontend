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
    <div className="min-h-screen bg-white text-[var(--brand-dark)]">
      {/* ── HERO ── */}
      <section className="bg-[#f0f4f8] border-b-2 border-[#e2e8f0] py-8 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-[#e2e8f0] border border-[#e2e8f0] text-[var(--brand-dark)] px-4 py-1.5 rounded-full text-xs font-bold mb-3 uppercase tracking-wide">
            {t("terms.badge")}
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-[var(--brand-dark)] leading-tight mb-2 tracking-tight">
            {t("terms.title")}
          </h1>
          <p className="text-sm md:text-base text-[var(--brand-neutral)] max-w-2xl mx-auto font-medium opacity-80 leading-relaxed">
            {t("terms.subtitle")}
          </p>
        </div>
      </section>

      {/* ── CONTENIDO ── */}
      <section className="py-20 px-4 bg-white relative -mt-5">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white border-2 border-[#e2e8f0] rounded-[3rem] p-8 md:p-16 shadow-[0_32px_64px_-16px_rgba(22,101,52,0.1)] relative overflow-hidden">
            <div className="space-y-12 text-[var(--brand-dark)] leading-relaxed">
              
              <section className="space-y-4">
                <h2 className="text-2xl font-black text-[var(--brand-dark)] flex items-center gap-4">
                  <span className="w-2 h-8 bg-[var(--brand-blue)] rounded-full"></span>
                  {t("terms.section1.title")}
                </h2>
                <div className="pl-6 border-l-2 border-green-50 text-lg opacity-90">
                  {t("terms.section1.content")}
                </div>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-black text-[var(--brand-dark)] flex items-center gap-4">
                  <span className="w-2 h-8 bg-green-500 rounded-full"></span>
                  {t("terms.section2.title")}
                </h2>
                <div className="pl-6 border-l-2 border-green-50 text-lg opacity-90">
                  {t("terms.section2.content")}
                </div>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-black text-[var(--brand-dark)] flex items-center gap-4">
                  <span className="w-2 h-8 bg-green-400 rounded-full"></span>
                  {t("terms.section3.title")}
                </h2>
                <div className="pl-6 border-l-2 border-green-50 text-lg opacity-90">
                  {t("terms.section3.content")}
                </div>
              </section>

              <section className="bg-[#f0f4f8] border-2 border-[#e2e8f0] rounded-[2.5rem] p-8 md:p-10 shadow-inner">
                <h2 className="text-2xl font-black text-[var(--brand-dark)] flex items-center gap-4 mb-6">
                  <div className="w-10 h-10 bg-[var(--brand-blue)] rounded-full flex items-center justify-center text-white">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  {t("terms.section4.title")}
                </h2>
                <p className="font-black text-[var(--brand-neutral)] text-xl mb-4 italic leading-snug">
                  {t("terms.section4.content")}
                </p>
                <p className="text-lg text-[var(--brand-dark)]/80 italic">
                  {t("terms.section4.details")}
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-black text-[var(--brand-dark)] flex items-center gap-4">
                  <span className="w-2 h-8 bg-green-300 rounded-full"></span>
                  {t("terms.section5.title")}
                </h2>
                <div className="pl-6 border-l-2 border-green-50 text-lg opacity-90">
                  {t("terms.section5.content")}
                </div>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-black text-[var(--brand-dark)] flex items-center gap-4">
                  <span className="w-2 h-8 bg-green-200 rounded-full"></span>
                  {t("terms.section6.title")}
                </h2>
                <div className="pl-6 border-l-2 border-green-50 text-lg opacity-90">
                  {t("terms.section6.content")}
                </div>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-black text-[var(--brand-dark)] flex items-center gap-4">
                  <span className="w-2 h-8 bg-[#e2e8f0] rounded-full"></span>
                  {t("terms.section7.title")}
                </h2>
                <div className="pl-6 border-l-2 border-green-50 text-lg opacity-90">
                  {t("terms.section7.content")}
                </div>
              </section>

              <div className="pt-12 border-t border-green-50 flex flex-col md:flex-row justify-between items-center gap-6">
                <p className="text-xs font-bold uppercase tracking-widest text-[var(--brand-neutral)]">
                  {t("terms.lastUpdate")}: <span className="text-[var(--brand-blue)]">{t("terms.updateDate")}</span>
                </p>
                <div className="flex items-center gap-3 bg-[#f0f4f8] px-4 py-2 rounded-full border border-[#e2e8f0]">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span>
                  <span className="text-[10px] font-black text-[var(--brand-neutral)] uppercase tracking-[0.2em]">{t("terms.documentVigente")}</span>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
