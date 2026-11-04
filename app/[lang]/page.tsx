"use client";
import { useState } from "react";
import { langPrefix } from "@/app/lib/i18n/config";
import { useTranslation } from "@/app/hooks/useTranslation";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import LocationInput from "@/app/components/LocationInput";
import Landscape from "@/app/components/Landscape";
import Link from "next/link";
import { TOP_FINNISH_ROUTES } from "@/app/lib/constants/routes";

export default function Home() {
  const { t, loading } = useTranslation();
  const router = useRouter();
  const params = useParams();
  const lang = (params?.lang as string) || "fi";
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--page-bg)] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#c4d8b4] border-t-[var(--brand-blue)] rounded-full animate-spin mb-6"></div>
        <p className="text-[var(--brand-neutral)] text-base font-semibold">…</p>
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
    <div className="min-h-screen bg-[var(--page-bg)]">

      {/* ── HERO: paisaje ── */}
      <section className="relative overflow-hidden px-6 pt-16 pb-56 md:pb-72 text-center min-h-[640px] md:min-h-[720px]">
        <Landscape className="absolute inset-0 w-full h-full" />
        <div className="relative max-w-4xl mx-auto">
          {/* Badge gratuito */}
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur text-[var(--brand-blue)] px-5 py-2 rounded-full text-sm font-bold mb-6 uppercase tracking-widest shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[var(--brand-accent-1)]"></span>
            {t("page.home.hero.free") || "0 COMMISSIONS"}
          </div>

          {/* Título */}
          <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-4 tracking-tight text-[var(--brand-dark)] [text-shadow:0_1px_12px_rgba(255,255,255,0.7)]">
            {t("page.home.hero.title") || "Share your ride, save money"}
          </h1>

          {/* Subtítulo */}
          <p className="text-lg md:text-lg text-[var(--brand-dark)]/80 max-w-2xl mx-auto mb-10 leading-relaxed font-medium [text-shadow:0_1px_10px_rgba(255,255,255,0.8)]">
            {t("page.home.hero.subtitle") || "Connect with people going to the same destination"}
          </p>

          {/* Formulario de búsqueda */}
          <form
            onSubmit={handleSubmit}
            className="bg-white/95 backdrop-blur rounded-[2rem] shadow-xl shadow-green-900/15 p-3 flex flex-col lg:flex-row gap-3 max-w-4xl mx-auto border border-white"
          >
            {/* Campo DESDE */}
            <div className="flex-1 flex items-center gap-3 border-2 border-[#c4d8b4] rounded-full px-6 py-3 bg-[#fafcf6] focus-within:border-[var(--brand-accent-1)] transition-colors">
              <span className="w-3 h-3 rounded-full border-[3px] border-[var(--brand-blue)] flex-shrink-0" aria-hidden="true"></span>
              <LocationInput
                value={from}
                onChange={(val: string) => setFrom(val)}
                placeholder={t("page.home.from") || "From"}
                className="w-full bg-transparent border-none text-lg text-[var(--brand-dark)] placeholder:text-[var(--brand-neutral)] focus:ring-0 outline-none font-medium"
                required
              />
            </div>

            {/* Campo HASTA */}
            <div className="flex-1 flex items-center gap-3 border-2 border-[#c4d8b4] rounded-full px-6 py-3 bg-[#fafcf6] focus-within:border-[var(--brand-accent-1)] transition-colors">
              <span className="w-3 h-3 rounded-full bg-[var(--brand-accent-1)] flex-shrink-0" aria-hidden="true"></span>
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
              className="btn-primary px-7 py-4 cursor-pointer"
            >
              {t("page.home.search") || "Search trip"}
            </button>
          </form>
        </div>
      </section>

      {/* ── CÓMO FUNCIONA ── */}
      <section className="py-12 px-6 bg-gradient-to-b from-[#eef6e4] to-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-[var(--brand-dark)] text-center mb-10 tracking-tight">
            {t("page.home.howItWorks.title") || "How does it work?"}
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: t("page.home.howItWorks.step1.title") || "1. Search or Publish", desc: t("page.home.howItWorks.step1.description") || "Search available trips or publish yours. Completely free, no hidden costs.", icon: "🗺️" },
              { title: t("page.home.howItWorks.step2.title") || "2. Connect", desc: t("page.home.howItWorks.step2.description") || "Contact other users directly. No intermediaries or commissions.", icon: "💬" },
              { title: t("page.home.howItWorks.step3.title") || "3. Share and Save", desc: t("page.home.howItWorks.step3.description") || "Split travel costs among passengers. Save money and help the environment.", icon: "🌱" },
            ].map((step, i) => (
              <div key={i} className="bg-white p-6 rounded-[1.5rem] text-center hover:border-[var(--brand-accent-1)] hover:-translate-y-1 border-2 border-[#c4d8b4] shadow-sm shadow-green-900/5 transition-all">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#eef6e4] border-2 border-[#c4d8b4] flex items-center justify-center text-3xl">{step.icon}</div>
                <h3 className="text-2xl font-medium text-[var(--brand-dark)] mb-4">{step.title}</h3>
                <p className="text-[var(--brand-neutral)] leading-relaxed font-light">{step.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link href={`${langPrefix(lang)}/how-it-works`} className="font-bold text-[var(--brand-blue)] underline">
              {t("home.moreHowItWorks", "Read more about how Jombo works")} →
            </Link>
          </div>
        </div>
      </section>

      {/* ── FUNCIONES ── */}
      <section className="py-12 px-6 bg-white">
        <div className="max-w-6xl mx-auto grid gap-4 md:grid-cols-4">
          {[
            { icon: "📍", title: t("home.features.stops.title", "Rides with stops"), text: t("home.features.stops.text", "Hop on or off along the way and pay only for your part.") },
            { icon: "⚡", title: t("home.features.instant.title", "Instant booking"), text: t("home.features.instant.text", "Many drivers confirm seats automatically.") },
            { icon: "✅", title: t("home.features.verified.title", "Verified members"), text: t("home.features.verified.text", "Email and phone badges, reviews and experience levels.") },
            { icon: "🔔", title: t("home.features.alerts.title", "Ride alerts"), text: t("home.features.alerts.text", "Get an email when a ride for your route is published.") },
          ].map((f) => (
            <div key={f.title} className="rounded-2xl border-2 border-[#c4d8b4] bg-[#f7fbf3] p-5">
              <div className="mb-2 text-2xl" aria-hidden="true">{f.icon}</div>
              <h3 className="font-bold text-[var(--brand-dark)]">{f.title}</h3>
              <p className="text-sm text-[var(--brand-neutral)]">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── RUTAS POPULARES ── */}
      <section className="py-12 px-6 bg-gradient-to-b from-white to-[#eef6e4]">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <h2 className="text-2xl font-bold text-[var(--brand-dark)]">{t("home.popularRoutes", "Popular routes")}</h2>
            <Link href={`${langPrefix(lang)}/kimppakyyti`} className="font-bold text-[var(--brand-blue)] underline">
              {t("footer.allRoutes", "All routes")} →
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {TOP_FINNISH_ROUTES.filter((_, i) => i % 2 === 0).slice(0, 8).map((r) => (
              <Link key={r.slug} href={`${langPrefix(lang)}/kimppakyyti/${r.slug}`} className="rounded-xl border-2 border-[#c4d8b4] bg-white px-4 py-3 hover:border-[var(--brand-blue)]">
                <span className="block font-semibold text-[var(--brand-dark)]">{r.from} → {r.to}</span>
                <span className="text-sm text-[var(--brand-neutral)]">{r.distance} · {r.duration}</span>
              </Link>
            ))}
          </div>
          <div className="mt-8 flex flex-col items-center gap-3 rounded-2xl border-2 border-[#c4d8b4] bg-white p-6 text-center md:flex-row md:text-left">
            <div className="flex-1">
              <p className="font-bold text-[var(--brand-dark)]">🙋 {t("home.requestsTitle", "Can't find your route?")}</p>
              <p className="text-sm text-[var(--brand-neutral)]">{t("home.requestsText", "Post a ride request and let drivers come to you.")}</p>
            </div>
            <Link href={`${langPrefix(lang)}/ride-requests`} className="btn-primary px-5 py-2.5">{t("menu.rideRequests", "Looking for a ride")}</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
