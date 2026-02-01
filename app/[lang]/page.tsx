"use client";
import { useState } from "react";
import { useTranslation } from "@/app/hooks/useTranslation";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import LocationInput from "@/app/components/LocationInput";

export default function Home() {
  const { t, loading } = useTranslation();
  const router = useRouter();
  const params = useParams();
  const lang = (params?.lang as string) || "es";
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  // Wait for translations to load
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!from) {
      toast.error(t("page.home.fromRequired") || "Por favor ingresa la ubicación de salida");
      return;
    }
    const searchParams = new URLSearchParams();
    searchParams.set("from", from);
    if (to) searchParams.set("to", to);
    router.push(`/${lang}/search?${searchParams.toString()}`);
  }

  return (
    <div className="min-h-screen bg-brand-dark overflow-hidden selection:bg-brand-cyan/30">
      {/* Hero Section */}
      <div className="relative min-h-[90vh] flex items-center pt-20 pb-32 px-4 sm:px-6 lg:px-8">
        {/* Hacker Aesthetic Background Elements */}
        <div className="absolute inset-0 bg-hacker-dots opacity-40 pointer-events-none"></div>
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[600px] h-[600px] bg-brand-cyan/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-[500px] h-[500px] bg-brand-purple/10 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="relative max-w-7xl mx-auto w-full">
          <div className="flex flex-col items-center text-center space-y-16">
            {/* Main Content - Text & Search */}
            <div className="space-y-12 w-full max-w-5xl">
              <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-xl text-brand-cyan border border-white/10 px-6 py-2.5 rounded-full text-xs font-black tracking-[0.3em] uppercase mx-auto">
                <span className="w-2.5 h-2.5 rounded-full bg-brand-cyan animate-pulse"></span>
                {t("page.home.hero.free") || "100% GRATIS - Sin comisiones"}
              </div>

              <div className="space-y-8">
                <h1 className="text-6xl md:text-8xl font-black text-white leading-[1.05] tracking-tightest">
                  {t("page.home.hero.title") || "Comparte tu viaje, ahorra dinero"}
                </h1>
                <p className="text-xl md:text-2xl text-brand-gray max-w-3xl mx-auto font-medium leading-relaxed">
                  {t("page.home.hero.subtitle") || "Conecta con personas que van a tu mismo destino de forma SEGURA y TECNOLÓGICA."}
                </p>
              </div>

              {/* Ultra Sleek Large Search Form */}
              <div className="bg-white/5 backdrop-blur-3xl p-3 rounded-[3rem] border border-white/5 shadow-2xl w-full relative group">
                <div className="absolute -inset-1.5 bg-brand-gradient rounded-[3.2rem] opacity-20 blur-2xl group-focus-within:opacity-40 transition-opacity"></div>
                <form onSubmit={handleSubmit} className="relative flex flex-col lg:flex-row gap-3">
                  <div className="flex-1 flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-white/10 items-center bg-black/20 rounded-[2.5rem]">
                    <div className="w-full relative group/input">
                      <div className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-gray group-focus-within/input:text-brand-cyan transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <LocationInput
                        value={from}
                        onChange={(val: string) => setFrom(val)}
                        placeholder={t("page.home.from") || "Desde"}
                        className="w-full bg-transparent border-none pl-16 pr-6 py-7 text-2xl text-white placeholder:text-brand-gray/30 focus:ring-0 outline-none font-bold"
                        required
                      />
                    </div>
                    <div className="w-full relative group/input">
                      <div className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-gray group-focus-within/input:text-brand-purple transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <LocationInput
                        value={to}
                        onChange={(val: string) => setTo(val)}
                        placeholder={t("page.home.to") || "Hasta"}
                        className="w-full bg-transparent border-none pl-16 pr-6 py-7 text-2xl text-white placeholder:text-brand-gray/30 focus:ring-0 outline-none font-bold"
                      />
                    </div>
                  </div>
                  <button className="bg-brand-gradient text-white px-12 py-7 rounded-[2.5rem] font-black uppercase tracking-[0.2em] text-base transition-all hover:scale-[1.03] active:scale-95 shadow-2xl shadow-brand-cyan/20 flex items-center justify-center gap-4">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    {t("page.home.search") || "Buscar"}
                  </button>
                </form>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-12 pt-8">
                <button
                  onClick={() => router.push(`/${lang}/create-trip`)}
                  className="group flex items-center gap-5 text-white font-black uppercase tracking-[0.2em] text-sm hover:text-brand-cyan transition-colors"
                >
                  <span className="w-16 h-16 rounded-[1.5rem] bg-white/5 border border-white/5 flex items-center justify-center group-hover:border-brand-cyan/30 group-hover:bg-brand-cyan/10 transition-all shadow-xl">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </span>
                  {t("page.home.publish") || "Publicar viaje"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="relative py-32 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-purple/5 rounded-full blur-[150px] pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center space-y-4 mb-20">
            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tightest uppercase italic">
              {t("page.home.howItWorks.title") || "¿Cómo funciona el sistema?"}
            </h2>
            <div className="w-24 h-1.5 bg-brand-gradient mx-auto rounded-full"></div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="group relative bg-white/5 backdrop-blur-2xl p-10 rounded-[3rem] border border-white/5 transition-all hover:border-brand-cyan/30 hover:shadow-2xl hover:shadow-brand-cyan/5 overflow-hidden">
              <div className="absolute inset-0 bg-hacker-dots opacity-5 pointer-events-none"></div>
              <div className="relative space-y-8">
                <div className="w-20 h-20 bg-brand-cyan/10 rounded-[2rem] flex items-center justify-center text-brand-cyan border border-brand-cyan/20 group-hover:scale-110 transition-transform">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <div className="space-y-4">
                  <h3 className="text-2xl font-black text-white uppercase italic tracking-tight">
                    {t("page.home.howItWorks.step1.title") || "1. Publica tu ruta"}
                  </h3>
                  <p className="text-brand-gray font-medium leading-relaxed">
                    {t("page.home.howItWorks.step1.description") || "Busca viajes disponibles o publica el tuyo en segundos. El sistema es 100% libre de comisiones."}
                  </p>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="group relative bg-white/5 backdrop-blur-2xl p-10 rounded-[3rem] border border-white/5 transition-all hover:border-brand-purple/30 hover:shadow-2xl hover:shadow-brand-purple/5 overflow-hidden">
              <div className="absolute inset-0 bg-hacker-dots opacity-5 pointer-events-none"></div>
              <div className="relative space-y-8">
                <div className="w-20 h-20 bg-brand-purple/10 rounded-[2rem] flex items-center justify-center text-brand-purple border border-brand-purple/20 group-hover:scale-110 transition-transform">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <div className="space-y-4">
                  <h3 className="text-2xl font-black text-white uppercase italic tracking-tight">
                    {t("page.home.howItWorks.step2.title") || "2. Conecta directo"}
                  </h3>
                  <p className="text-brand-gray font-medium leading-relaxed">
                    {t("page.home.howItWorks.step2.description") || "Gestiona tus pasajeros desde un panel tecnológico avanzado. Sin intermediarios, tú tienes el control."}
                  </p>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="group relative bg-white/5 backdrop-blur-2xl p-10 rounded-[3rem] border border-white/5 transition-all hover:border-brand-cyan/30 hover:shadow-2xl hover:shadow-brand-cyan/5 overflow-hidden">
              <div className="absolute inset-0 bg-hacker-dots opacity-5 pointer-events-none"></div>
              <div className="relative space-y-8">
                <div className="w-20 h-20 bg-brand-gradient rounded-[2rem] flex items-center justify-center text-white shadow-lg shadow-brand-cyan/20 group-hover:scale-110 transition-transform p-0.5">
                  <div className="w-full h-full bg-brand-dark rounded-[1.9rem] flex items-center justify-center">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-2xl font-black text-white uppercase italic tracking-tight">
                    {t("page.home.howItWorks.step3.title") || "3. Viaja y ahorra"}
                  </h3>
                  <p className="text-brand-gray font-medium leading-relaxed">
                    {t("page.home.howItWorks.step3.description") || "Optimiza tus costos compartiendo el trayecto. Aumenta la eficiencia y reduce el impacto ambiental."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="relative py-32">
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-brand-cyan/5 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20 border-b border-white/5 pb-12">
            <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl font-black text-white tracking-tightest uppercase italic">
                {t("page.home.benefits.title") || "¿Por qué elegir Jombo?"}
              </h2>
              <p className="text-brand-gray font-medium uppercase tracking-[0.2em] text-xs">Ventajas de nuestra red distribuida</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="group bg-white/5 backdrop-blur-3xl p-10 rounded-[3rem] border border-white/10 hover:border-brand-cyan/20 transition-all flex flex-col sm:flex-row gap-8 items-start">
              <div className="w-16 h-16 bg-brand-cyan/10 rounded-2xl flex items-center justify-center text-brand-cyan border border-brand-cyan/20 flex-shrink-0">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="space-y-4">
                <h3 className="text-2xl font-black text-white uppercase italic tracking-tight">
                  {t("page.home.benefits.free.title") || "Completamente Gratis"}
                </h3>
                <p className="text-brand-gray font-medium leading-relaxed">
                  {t("page.home.benefits.free.description") || "Cero comisiones. Nuestra misión es potenciar la movilidad compartida sin barreras económicas."}
                </p>
              </div>
            </div>

            <div className="group bg-white/5 backdrop-blur-3xl p-10 rounded-[3rem] border border-white/10 hover:border-brand-purple/20 transition-all flex flex-col sm:flex-row gap-8 items-start">
              <div className="w-16 h-16 bg-brand-purple/10 rounded-2xl flex items-center justify-center text-brand-purple border border-brand-purple/20 flex-shrink-0">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div className="space-y-4">
                <h3 className="text-2xl font-black text-white uppercase italic tracking-tight">
                  {t("page.home.benefits.safe.title") || "Protocolo Seguro"}
                </h3>
                <p className="text-brand-gray font-medium leading-relaxed">
                  {t("page.home.benefits.safe.description") || "Verificación robusta y sistema de reputación para garantizar la máxima confianza en cada trayecto."}
                </p>
              </div>
            </div>

            <div className="group bg-white/5 backdrop-blur-3xl p-10 rounded-[3rem] border border-white/10 hover:border-brand-cyan/20 transition-all flex flex-col sm:flex-row gap-8 items-start">
              <div className="w-16 h-16 bg-brand-cyan/10 rounded-2xl flex items-center justify-center text-brand-cyan border border-brand-cyan/20 flex-shrink-0">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="space-y-4">
                <h3 className="text-2xl font-black text-white uppercase italic tracking-tight">
                  {t("page.home.benefits.eco.title") || "Máxima Eficiencia"}
                </h3>
                <p className="text-brand-gray font-medium leading-relaxed">
                  {t("page.home.benefits.eco.description") || "Optimización de recursos compartidos para minimizar la huella tecnológica y ambiental."}
                </p>
              </div>
            </div>

            <div className="group bg-white/5 backdrop-blur-3xl p-10 rounded-[3rem] border border-white/10 hover:border-brand-purple/20 transition-all flex flex-col sm:flex-row gap-8 items-start">
              <div className="w-16 h-16 bg-brand-purple/10 rounded-2xl flex items-center justify-center text-brand-purple border border-brand-purple/20 flex-shrink-0">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="space-y-4">
                <h3 className="text-2xl font-black text-white uppercase italic tracking-tight">
                  {t("page.home.benefits.community.title") || "Red de Confianza"}
                </h3>
                <p className="text-brand-gray font-medium leading-relaxed">
                  {t("page.home.benefits.community.description") || "Forma parte de una comunidad tecnológica unida por el deseo de compartir y colaborar."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
