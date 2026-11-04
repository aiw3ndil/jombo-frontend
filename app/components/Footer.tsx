"use client";

import Link from "next/link";
import { localePath, langPrefix } from "@/app/lib/i18n/config";
import { useTranslation } from "@/app/hooks/useTranslation";
import { TOP_FINNISH_ROUTES } from "@/app/lib/constants/routes";

interface FooterProps {
  lang: string;
}

export default function Footer({ lang }: FooterProps) {
  const { t } = useTranslation();

  const supportEmail = "tuki@jombo.fi";

  const featuredRoutes = TOP_FINNISH_ROUTES.slice(0, 6);
  const routePrefix = "kimppakyyti";

  return (
    <footer className="bg-[var(--brand-dark)] text-white mt-auto py-12 relative overflow-hidden">
      {/* Sutil gradiente de fondo */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[var(--brand-accent-1)] to-transparent"></div>
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-1 space-y-8">
            <Link href={localePath(lang)} className="inline-block hover:opacity-80 transition-all hover:scale-105 transform">
              <img
                src="/JOMBO_LOGO_Princpal_RGB.png"
                alt="Jombo"
                className="h-12 w-auto brightness-0 invert"
              />
            </Link>
            <p className="text-[var(--brand-neutral)] text-lg leading-relaxed font-light opacity-90">
              {t("footer.description")}
            </p>
          </div>

          {/* Top Routes Column */}
          <div>
            <h3 className="text-white font-bold mb-8 text-sm uppercase tracking-[0.2em] opacity-60">
              {lang === "fi" ? "Suosituimmat reitit" : "Popular routes"}
            </h3>
            <ul className="space-y-4">
              {featuredRoutes.map((route) => (
                <li key={route.slug}>
                  <Link
                    href={`${langPrefix(lang)}/${routePrefix}/${route.slug}`}
                    className="text-white hover:text-[var(--brand-accent-1)] text-base transition-all font-medium flex items-center gap-3 group"
                  >
                    <span className="w-1.5 h-1.5 bg-[var(--brand-accent-1)] rounded-full group-hover:bg-white transition-colors"></span>
                    <span className="group-hover:translate-x-1 transition-transform inline-block">
                      {route.from} <span className="text-[var(--brand-neutral)] mx-1">→</span> {route.to}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* About Column */}
          <div>
            <h3 className="text-white font-bold mb-8 text-sm uppercase tracking-[0.2em] opacity-60">
              {t("footer.about")}
            </h3>
            <p className="text-[var(--brand-neutral)] text-base leading-relaxed font-light opacity-90">
              {t("footer.aboutDescription")}
            </p>
          </div>

          {/* Links Column */}
          <div>
            <h3 className="text-white font-bold mb-8 text-sm uppercase tracking-[0.2em] opacity-60">
              {t("footer.links")}
            </h3>
            <ul className="space-y-4">
              <li>
                <Link href={`${langPrefix(lang)}/how-it-works`} className="text-white hover:text-[var(--brand-accent-1)] text-base transition-all font-medium">
                  {t("footer.howItWorks", "How it works")}
                </Link>
              </li>
              <li>
                <Link href={`${langPrefix(lang)}/safety`} className="text-white hover:text-[var(--brand-accent-1)] text-base transition-all font-medium">
                  {t("footer.safety", "Safety")}
                </Link>
              </li>
              <li>
                <Link href={`${langPrefix(lang)}/ride-requests`} className="text-white hover:text-[var(--brand-accent-1)] text-base transition-all font-medium">
                  {t("menu.rideRequests", "Looking for a ride")}
                </Link>
              </li>
              <li>
                <Link href={`${langPrefix(lang)}/kimppakyyti`} className="text-white hover:text-[var(--brand-accent-1)] text-base transition-all font-medium">
                  {t("footer.allRoutes", "All routes")}
                </Link>
              </li>
              <li>
                <Link href={`${langPrefix(lang)}/terms`} className="text-white hover:text-[var(--brand-accent-1)] text-base transition-all font-medium">
                  {t("footer.terms")}
                </Link>
              </li>
              <li>
                <Link href={`${langPrefix(lang)}/data-deletion`} className="text-white hover:text-[var(--brand-accent-1)] text-base transition-all font-medium">
                  {t("footer.dataDeletion")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Column */}
          <div className="bg-[#2c4c37] rounded-[2rem] p-8 border border-white/5 backdrop-blur-sm self-start">
            <h3 className="text-white font-bold mb-6 text-sm uppercase tracking-[0.2em] opacity-60">
              {t("footer.contact")}
            </h3>
            <div className="space-y-6">
              <div>
                <p className="text-[10px] font-bold text-[var(--brand-accent-1)] uppercase tracking-widest mb-2">
                  {t("footer.supportEmail")}
                </p>
                <a
                  href={`mailto:${supportEmail}`}
                  className="text-white hover:text-[var(--brand-accent-1)] text-lg font-bold transition-all block break-all"
                >
                  {supportEmail}
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-24 pt-12 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="text-[var(--brand-neutral)] text-sm font-light">
            © {new Date().getFullYear()} Jombo.
          </p>
        </div>
      </div>
    </footer>
  );
}
