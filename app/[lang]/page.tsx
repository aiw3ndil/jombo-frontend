"use client";
import { useState } from "react";
import { useTranslation } from "@/app/hooks/useTranslation";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";

export default function Home() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useParams();
  const lang = (params?.lang as string) || "es";
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!from) {
      alert(t("page.home.fromRequired") || "Por favor ingresa la ubicación de salida");
      return;
    }
    const searchParams = new URLSearchParams();
    searchParams.set("from", from);
    if (to) searchParams.set("to", to);
    router.push(`/${lang}/search?${searchParams.toString()}`);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Column - Text */}
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
              {t("page.home.hero.title") || "Comparte tu viaje, ahorra dinero"}
            </h1>
            <p className="text-xl text-gray-600">
              {t("page.home.hero.subtitle") || "Conecta con personas que van a tu mismo destino"}
            </p>
            
            {/* Free Badge */}
            <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full font-semibold">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {t("page.home.hero.free") || "100% GRATIS - Sin comisiones"}
            </div>

            {/* Search Form */}
            <form onSubmit={handleSubmit} className="space-y-4 mt-8">
              <div className="space-y-3">
                <input
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  placeholder={t("page.home.from") || "Desde"}
                  className="w-full border border-gray-300 p-4 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <input
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  placeholder={t("page.home.to") || "Hasta"}
                  className="w-full border border-gray-300 p-4 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button className="w-full bg-blue-600 text-white px-6 py-4 rounded-lg hover:bg-blue-700 font-semibold text-lg transition-colors">
                {t("page.home.search") || "Buscar viaje"}
              </button>
            </form>

            <button 
              onClick={() => router.push(`/${lang}/create-trip`)}
              className="w-full bg-gray-800 text-white px-6 py-4 rounded-lg hover:bg-gray-900 font-semibold text-lg transition-colors"
            >
              {t("page.home.publish") || "Publicar un viaje"}
            </button>
          </div>

          {/* Right Column - Image */}
          <div className="relative">
            <Image
              src="/images/carpool-hero.svg"
              alt="Carpooling illustration"
              width={600}
              height={450}
              priority
              className="w-full h-auto"
            />
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            {t("page.home.howItWorks.title") || "¿Cómo funciona?"}
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">
                {t("page.home.howItWorks.step1.title") || "1. Busca o Publica"}
              </h3>
              <p className="text-gray-600">
                {t("page.home.howItWorks.step1.description") || "Busca viajes disponibles o publica el tuyo. Totalmente gratis, sin costes ocultos."}
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">
                {t("page.home.howItWorks.step2.title") || "2. Conecta"}
              </h3>
              <p className="text-gray-600">
                {t("page.home.howItWorks.step2.description") || "Contacta directamente con otros usuarios. Sin intermediarios ni comisiones."}
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">
                {t("page.home.howItWorks.step3.title") || "3. Comparte y Ahorra"}
              </h3>
              <p className="text-gray-600">
                {t("page.home.howItWorks.step3.description") || "Divide los gastos del viaje entre los pasajeros. Ahorra dinero y ayuda al medio ambiente."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="bg-blue-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            {t("page.home.benefits.title") || "¿Por qué Jombo?"}
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm space-y-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">
                {t("page.home.benefits.free.title") || "Completamente Gratis"}
              </h3>
              <p className="text-gray-600">
                {t("page.home.benefits.free.description") || "No cobramos comisiones. Ni al conductor ni al pasajero. Lo que acuerdes es lo que pagas."}
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm space-y-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">
                {t("page.home.benefits.safe.title") || "Seguro y Confiable"}
              </h3>
              <p className="text-gray-600">
                {t("page.home.benefits.safe.description") || "Sistema de valoraciones y verificación de usuarios para tu seguridad."}
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm space-y-3">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">
                {t("page.home.benefits.eco.title") || "Ecológico"}
              </h3>
              <p className="text-gray-600">
                {t("page.home.benefits.eco.description") || "Reduce la huella de carbono compartiendo viajes. Menos coches, menos contaminación."}
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm space-y-3">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">
                {t("page.home.benefits.community.title") || "Comunidad"}
              </h3>
              <p className="text-gray-600">
                {t("page.home.benefits.community.description") || "Conoce gente nueva y haz el viaje más ameno compartiendo experiencias."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
