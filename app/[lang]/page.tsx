"use client";
import { useState } from "react";
import { langPrefix } from "@/app/lib/i18n/config";
import { useTranslation } from "@/app/hooks/useTranslation";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import LocationInput from "@/app/components/LocationInput";

export default function Home() {
  const { t, loading } = useTranslation();
  const router = useRouter();
  const params = useParams();
  const lang = (params?.lang as string) || "fi";
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#e2e8f0] border-t-[var(--brand-blue)] rounded-full animate-spin mb-6"></div>
        <p className="text-[var(--brand-neutral)] text-base font-semibold">Loading...</p>
      </div>
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!from) {
      toast.error(t("page.home.fromRequired") || "Please enter the departure location");
      return;
    }
    const searchParams = new URLSearchParams();
    searchParams.set("from", from);
    if (to) searchParams.set("to", to);
    router.push(`${langPrefix(lang)}/search?${searchParams.toString()}`);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#f0f4f8] to-[#e2e8f0]">

      {/* ── HERO ── */}
      <section className="bg-[var(--brand-gradient)] py-24 px-6 text-white text-center">
        <div className="max-w-4xl mx-auto">
          {/* Badge gratuito */}
          <div className="inline-flex items-center gap-2 bg-[var(--brand-blue)] text-white px-6 py-2 rounded-full text-sm font-bold mb-8 uppercase tracking-widest">
            <span className="w-2 h-2 rounded-full bg-[var(--brand-accent-2)]"></span>
            {t("page.home.hero.free") || "0 COMMISSIONS"}
          </div>

          {/* Título */}
          <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6 tracking-tight">
            {t("page.home.hero.title") || "Share your ride, save money"}
          </h1>

          {/* Subtítulo */}
          <p className="text-xl md:text-2xl opacity-90 max-w-2xl mx-auto mb-12 leading-relaxed font-light">
            {t("page.home.hero.subtitle") || "Connect with people going to the same destination"}
          </p>

          {/* Formulario de búsqueda */}
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-[2.5rem] shadow-xl p-4 flex flex-col lg:flex-row gap-3 max-w-4xl mx-auto"
          >
            {/* Campo DESDE */}
            <div className="flex-1 flex items-center gap-3 border-2 border-[#e2e8f0] rounded-2xl px-6 py-4 bg-[#f8fafc] focus-within:border-[var(--brand-accent-1)] transition-colors">
              <LocationInput
                value={from}
                onChange={(val: string) => setFrom(val)}
                placeholder={t("page.home.from") || "From"}
                className="w-full bg-transparent border-none text-lg text-[var(--brand-dark)] placeholder:text-[var(--brand-neutral)] focus:ring-0 outline-none font-medium"
                required
              />
            </div>

            {/* Campo HASTA */}
            <div className="flex-1 flex items-center gap-3 border-2 border-[#e2e8f0] rounded-2xl px-6 py-4 bg-[#f8fafc] focus-within:border-[var(--brand-accent-1)] transition-colors">
              <LocationInput
                value={to}
                onChange={(val: string) => setTo(val)}
                placeholder={t("page.home.to") || "To"}
                className="w-full bg-transparent border-none text-lg text-[var(--brand-dark)] placeholder:text-[var(--brand-neutral)] focus:ring-0 outline-none font-medium"
              />
            </div>

            {/* Botón buscar */}
            <button
              type="submit"
              className="bg-[var(--brand-blue)] hover:bg-[#003d85] text-white px-10 py-4 rounded-2xl font-bold text-lg transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              {t("page.home.search") || "Search trip"}
            </button>
          </form>
        </div>
      </section>

      {/* ── CÓMO FUNCIONA ── */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-[var(--brand-dark)] text-center mb-16 tracking-tight">
            {t("page.home.howItWorks.title") || "How does it work?"}
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: t("page.home.howItWorks.step1.title") || "1. Search or Publish", desc: t("page.home.howItWorks.step1.description") || "Search available trips or publish yours. Completely free, no hidden costs.", icon: "🔍" },
              { title: t("page.home.howItWorks.step2.title") || "2. Connect", desc: t("page.home.howItWorks.step2.description") || "Contact other users directly. No intermediaries or commissions.", icon: "💬" },
              { title: t("page.home.howItWorks.step3.title") || "3. Share and Save", desc: t("page.home.howItWorks.step3.description") || "Split travel costs among passengers. Save money and help the environment.", icon: "🚀" },
            ].map((step, i) => (
              <div key={i} className="bg-[#f0f4f8] p-10 rounded-[2.5rem] text-center hover:border-[var(--brand-accent-1)] border-2 border-[#e2e8f0] transition-all">
                <div className="text-5xl mb-6">{step.icon}</div>
                <h3 className="text-2xl font-medium text-[var(--brand-dark)] mb-4">{step.title}</h3>
                <p className="text-[var(--brand-neutral)] leading-relaxed font-light">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
