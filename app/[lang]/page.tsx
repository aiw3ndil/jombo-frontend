"use client";
import { useState } from "react";
import { useTranslation } from "@/app/hooks/useTranslation";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import LocationInput from "@/app/components/LocationInput";

export default function Home() {
  const { t, loading } = useTranslation();
  const router = useRouter();
  const params = useParams();
  const lang = (params?.lang as string) || "es";
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mb-6"></div>
        <p className="text-green-700 text-base font-semibold">Cargando...</p>
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
    <div className="min-h-screen bg-white">

      {/* ── HERO ── */}
      <section className="bg-green-50 border-b-2 border-green-100 py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge gratuito */}
          <div className="inline-flex items-center gap-2 bg-green-100 border border-green-300 text-green-800 px-5 py-2 rounded-full text-sm font-bold mb-8 uppercase tracking-wide">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            {t("page.home.hero.free") || "100% GRATIS — Sin comisiones"}
          </div>

          {/* Título */}
          <h1 className="text-5xl md:text-6xl font-bold text-green-900 leading-tight mb-6">
            {t("page.home.hero.title") || "Comparte tu viaje, ahorra dinero"}
          </h1>

          {/* Subtítulo */}
          <p className="text-xl md:text-2xl text-green-700 max-w-2xl mx-auto mb-12 leading-relaxed font-normal">
            {t("page.home.hero.subtitle") || "Conecta con personas que van a tu mismo destino de forma segura y gratuita."}
          </p>

          {/* Formulario de búsqueda */}
          <form
            onSubmit={handleSubmit}
            className="bg-white border-2 border-green-300 rounded-2xl shadow-lg p-4 flex flex-col lg:flex-row gap-3 max-w-3xl mx-auto"
          >
            {/* Campo DESDE */}
            <div className="flex-1 flex items-center gap-3 border-2 border-green-200 rounded-xl px-4 py-3 bg-white focus-within:border-green-500 transition-colors">
              <svg className="w-6 h-6 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <LocationInput
                value={from}
                onChange={(val: string) => setFrom(val)}
                placeholder={t("page.home.from") || "Ciudad de salida"}
                className="w-full bg-transparent border-none text-xl text-green-900 placeholder:text-green-400 focus:ring-0 outline-none font-medium py-1"
                required
              />
            </div>

            {/* Campo HASTA */}
            <div className="flex-1 flex items-center gap-3 border-2 border-green-200 rounded-xl px-4 py-3 bg-white focus-within:border-green-500 transition-colors">
              <svg className="w-6 h-6 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <LocationInput
                value={to}
                onChange={(val: string) => setTo(val)}
                placeholder={t("page.home.to") || "Ciudad de destino (opcional)"}
                className="w-full bg-transparent border-none text-xl text-green-900 placeholder:text-green-400 focus:ring-0 outline-none font-medium py-1"
              />
            </div>

            {/* Botón buscar */}
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 active:bg-green-800 text-white px-10 py-4 rounded-xl font-bold text-lg transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {t("page.home.search") || "Buscar"}
            </button>
          </form>

          {/* Botón publicar viaje */}
          <div className="mt-8">
            <button
              onClick={() => router.push(`/${lang}/create-trip`)}
              className="inline-flex items-center gap-3 bg-white border-2 border-green-400 text-green-700 hover:bg-green-50 font-bold text-lg px-8 py-4 rounded-xl transition-colors shadow-sm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {t("page.home.publish") || "Publicar un viaje"}
            </button>
          </div>
        </div>
      </section>

      {/* ── CÓMO FUNCIONA ── */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold text-green-900 mb-3">
              {t("page.home.howItWorks.title") || "¿Cómo funciona?"}
            </h2>
            <div className="w-16 h-1 bg-green-500 mx-auto rounded-full"></div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Paso 1 */}
            <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-8 text-center hover:border-green-400 transition-colors">
              <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-md">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <div className="text-green-500 font-bold text-sm uppercase tracking-wider mb-2">Paso 1</div>
              <h3 className="text-xl font-bold text-green-900 mb-3">
                {t("page.home.howItWorks.step1.title") || "Encuentra o publica tu ruta"}
              </h3>
              <p className="text-green-700 text-base leading-relaxed">
                {t("page.home.howItWorks.step1.description") || "Busca viajes disponibles o publica el tuyo en pocos segundos. Sin comisiones."}
              </p>
            </div>

            {/* Paso 2 */}
            <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-8 text-center hover:border-green-400 transition-colors">
              <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-md">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div className="text-green-500 font-bold text-sm uppercase tracking-wider mb-2">Paso 2</div>
              <h3 className="text-xl font-bold text-green-900 mb-3">
                {t("page.home.howItWorks.step2.title") || "Contacta directamente"}
              </h3>
              <p className="text-green-700 text-base leading-relaxed">
                {t("page.home.howItWorks.step2.description") || "Habla con el conductor o pasajero sin intermediarios. Tú tienes el control."}
              </p>
            </div>

            {/* Paso 3 */}
            <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-8 text-center hover:border-green-400 transition-colors">
              <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-md">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-green-500 font-bold text-sm uppercase tracking-wider mb-2">Paso 3</div>
              <h3 className="text-xl font-bold text-green-900 mb-3">
                {t("page.home.howItWorks.step3.title") || "Viaja y ahorra"}
              </h3>
              <p className="text-green-700 text-base leading-relaxed">
                {t("page.home.howItWorks.step3.description") || "Comparte gastos y llega a tu destino gastando mucho menos."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── VENTAJAS ── */}
      <section className="py-20 px-4 bg-green-50 border-t-2 border-green-100">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold text-green-900 mb-3">
              {t("page.home.benefits.title") || "¿Por qué elegir Jombo?"}
            </h2>
            <div className="w-16 h-1 bg-green-500 mx-auto rounded-full"></div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Gratis */}
            <div className="bg-white border-2 border-green-200 rounded-2xl p-8 flex gap-6 items-start hover:border-green-400 transition-colors">
              <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-green-900 mb-2">
                  {t("page.home.benefits.free.title") || "Completamente Gratis"}
                </h3>
                <p className="text-green-700 text-base leading-relaxed">
                  {t("page.home.benefits.free.description") || "Cero comisiones. Nuestra misión es facilitar la movilidad compartida sin barreras económicas."}
                </p>
              </div>
            </div>

            {/* Seguro */}
            <div className="bg-white border-2 border-green-200 rounded-2xl p-8 flex gap-6 items-start hover:border-green-400 transition-colors">
              <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-green-900 mb-2">
                  {t("page.home.benefits.safe.title") || "Viajes Seguros"}
                </h3>
                <p className="text-green-700 text-base leading-relaxed">
                  {t("page.home.benefits.safe.description") || "Perfiles verificados y sistema de valoraciones para garantizar la confianza en cada trayecto."}
                </p>
              </div>
            </div>

            {/* Ecológico */}
            <div className="bg-white border-2 border-green-200 rounded-2xl p-8 flex gap-6 items-start hover:border-green-400 transition-colors">
              <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-green-900 mb-2">
                  {t("page.home.benefits.eco.title") || "Más Sostenible"}
                </h3>
                <p className="text-green-700 text-base leading-relaxed">
                  {t("page.home.benefits.eco.description") || "Menos coches en la carretera, menos contaminación. Compartir es cuidar el planeta."}
                </p>
              </div>
            </div>

            {/* Comunidad */}
            <div className="bg-white border-2 border-green-200 rounded-2xl p-8 flex gap-6 items-start hover:border-green-400 transition-colors">
              <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-green-900 mb-2">
                  {t("page.home.benefits.community.title") || "Comunidad de Confianza"}
                </h3>
                <p className="text-green-700 text-base leading-relaxed">
                  {t("page.home.benefits.community.description") || "Forma parte de una red de personas que quieren moverse de forma inteligente y solidaria."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
