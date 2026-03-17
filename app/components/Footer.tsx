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
    <footer className="bg-green-900 text-white mt-auto py-16 relative overflow-hidden border-t-4 border-green-700">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-12">
          {/* Brand Column */}
          <div className="md:col-span-1">
            <Link href={`/${lang}`} className="inline-block hover:opacity-90 transition-opacity mb-8">
              <img
                src="/images/jombo-logo.svg"
                alt="Jombo"
                className="h-10 w-auto brightness-0 invert"
              />
            </Link>
            <p className="text-green-200 text-base leading-relaxed max-w-xs font-medium">
              {t("footer.description") || "Comparte tu viaje de forma gratuita y segura."}
            </p>
          </div>

          {/* Top Routes Column (SEO Booster) */}
          <div>
            <h3 className="text-white font-bold mb-6 text-base uppercase tracking-wide border-b border-green-700 pb-2">
              {isFinnish ? "Suosituimmat reitit" : "Rutas populares"}
            </h3>
            <ul className="space-y-3">
              {featuredRoutes.map((route) => (
                <li key={route.slug}>
                  <Link
                    href={`/${lang}/${routePrefix}/${route.slug}`}
                    className="text-green-200 hover:text-white text-base transition-colors font-medium flex items-center gap-2 group"
                  >
                    <span className="group-hover:translate-x-1 transition-transform inline-block">
                      {route.from} → {route.to}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* About Column */}
          <div>
            <h3 className="text-white font-bold mb-6 text-base uppercase tracking-wide border-b border-green-700 pb-2">{t("footer.about")}</h3>
            <p className="text-green-200 text-base leading-relaxed font-medium">
              {t("footer.description")}
            </p>
          </div>

          {/* Links Column */}
          <div>
            <h3 className="text-white font-bold mb-6 text-base uppercase tracking-wide border-b border-green-700 pb-2">{t("footer.links")}</h3>
            <ul className="space-y-3">
              <li>
                <Link href={`/${lang}/terms`} className="text-green-200 hover:text-white text-base transition-colors font-medium">
                  {t("footer.terms")}
                </Link>
              </li>
              <li>
                <Link href={`/${lang}/data-deletion`} className="text-green-200 hover:text-white text-base transition-colors font-medium">
                  {t("footer.dataDeletion")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Column */}
          <div>
            <h3 className="text-white font-bold mb-6 text-base uppercase tracking-wide border-b border-green-700 pb-2">{t("footer.contact")}</h3>
            <div className="space-y-3">
              <p className="text-sm font-semibold text-green-300 uppercase tracking-wider">{t("footer.supportEmail") || "Email de soporte"}</p>
              <a
                href={`mailto:${supportEmail}`}
                className="text-white hover:text-green-300 text-base font-bold transition-colors inline-block"
              >
                {supportEmail}
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-green-700 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-green-300 text-sm font-medium">
            © {new Date().getFullYear()} Jombo. {t("footer.rights")}
          </p>
          <div className="flex gap-8">
            {/* Social or additional links could go here */}
          </div>
        </div>
      </div>
    </footer>
  );
}
