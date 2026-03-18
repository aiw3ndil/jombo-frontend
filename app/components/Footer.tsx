"use client";

import Link from "next/link";
import { useTranslation } from "@/app/hooks/useTranslation";
import { TOP_FINNISH_ROUTES, TOP_SPANISH_ROUTES } from "@/app/lib/constants/routes";

interface FooterProps {
  lang: string;
}

export default function Footer({ lang }: FooterProps) {
  const { t } = useTranslation();

  const supportEmail = lang === "fi" ? "tuki@jombo.fi" : "soporte@jombo.es";

  // Determinamos qué rutas mostrar y el slug base según el idioma
  const isFinnish = lang === "fi";
  const featuredRoutes = isFinnish ? TOP_FINNISH_ROUTES.slice(0, 6) : TOP_SPANISH_ROUTES.slice(0, 6);
  const routePrefix = isFinnish ? "kimppakyyti" : "viajes-compartidos";

  return (
    <footer className="bg-green-950 text-white mt-auto py-24 relative overflow-hidden">
      {/* Sutil gradiente de fondo */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-green-800 to-transparent"></div>
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-16 lg:gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-1 space-y-8">
            <Link href={`/${lang}`} className="inline-block hover:opacity-80 transition-all hover:scale-105 transform">
              <img
                src="/images/jombo-logo.svg"
                alt="Jombo"
                className="h-12 w-auto brightness-0 invert"
              />
            </Link>
            <p className="text-green-300 text-lg leading-relaxed font-medium opacity-80">
              {t("footer.description")}
            </p>
            <div className="flex gap-4">
              {/* Espacio para redes sociales si se añaden luego */}
            </div>
          </div>

          {/* Top Routes Column */}
          <div>
            <h3 className="text-white font-black mb-8 text-sm uppercase tracking-[0.2em] opacity-50">
              {isFinnish ? "Suosituimmat reitit" : "Rutas populares"}
            </h3>
            <ul className="space-y-4">
              {featuredRoutes.map((route) => (
                <li key={route.slug}>
                  <Link
                    href={`/${lang}/${routePrefix}/${route.slug}`}
                    className="text-green-200 hover:text-white text-base transition-all font-bold flex items-center gap-3 group"
                  >
                    <span className="w-1.5 h-1.5 bg-green-700 rounded-full group-hover:bg-green-400 transition-colors"></span>
                    <span className="group-hover:translate-x-1 transition-transform inline-block">
                      {route.from} <span className="text-green-800 group-hover:text-green-500 mx-1">→</span> {route.to}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* About Column */}
          <div>
            <h3 className="text-white font-black mb-8 text-sm uppercase tracking-[0.2em] opacity-50">
              {t("footer.about")}
            </h3>
            <p className="text-green-200 text-base leading-relaxed font-medium opacity-90">
              {t("footer.aboutDescription")}
            </p>
          </div>

          {/* Links Column */}
          <div>
            <h3 className="text-white font-black mb-8 text-sm uppercase tracking-[0.2em] opacity-50">
              {t("footer.links")}
            </h3>
            <ul className="space-y-4">
              <li>
                <Link href={`/${lang}/terms`} className="text-green-200 hover:text-white text-base transition-all font-bold hover:underline decoration-green-800 underline-offset-8">
                  {t("footer.terms")}
                </Link>
              </li>
              <li>
                <Link href={`/${lang}/data-deletion`} className="text-green-200 hover:text-white text-base transition-all font-bold hover:underline decoration-green-800 underline-offset-8">
                  {t("footer.dataDeletion")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Column */}
          <div className="bg-green-900/40 rounded-[2rem] p-8 border border-green-800/50 backdrop-blur-sm self-start">
            <h3 className="text-white font-black mb-6 text-sm uppercase tracking-[0.2em] opacity-50">
              {t("footer.contact")}
            </h3>
            <div className="space-y-6">
              <div>
                <p className="text-[10px] font-black text-green-500 uppercase tracking-widest mb-2">
                  {t("footer.supportEmail")}
                </p>
                <a
                  href={`mailto:${supportEmail}`}
                  className="text-white hover:text-green-400 text-lg font-black transition-all block break-all"
                >
                  {supportEmail}
                </a>
              </div>
              <div className="pt-4 border-t border-green-800/50">
                <p className="text-[10px] font-black text-green-700 uppercase tracking-widest">{t("footer.status")}</p>
                <p className="text-green-400 text-xs font-bold flex items-center gap-2 mt-1">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                  {t("footer.supportStatus")}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-24 pt-12 border-t border-green-900 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
            <p className="text-green-500 text-sm font-bold tracking-tight">
              © {new Date().getFullYear()} Jombo. {t("footer.rights")}
            </p>
            <div className="flex gap-6 text-green-700 text-xs font-black uppercase tracking-widest">
              <span>{t("footer.madeWith")}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex -space-x-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className={`w-8 h-8 rounded-full border-2 border-green-950 bg-green-900 flex items-center justify-center text-[10px] font-black text-green-500`}>
                  {i}
                </div>
              ))}
            </div>
            <p className="text-green-600 text-[10px] font-black uppercase tracking-[0.2em]">
              {t("footer.trustedBy")}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
