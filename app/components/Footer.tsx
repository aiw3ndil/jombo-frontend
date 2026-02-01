"use client";

import Link from "next/link";
import { useTranslation } from "@/app/hooks/useTranslation";

interface FooterProps {
  lang: string;
}

export default function Footer({ lang }: FooterProps) {
  const { t } = useTranslation();

  const supportEmail = lang === "fi" ? "tuki@jombo.fi" : "soporte@jombo.es";

  return (
    <footer className="bg-brand-dark text-white mt-auto py-16 relative overflow-hidden border-t border-white/5">
      <div className="absolute inset-0 bg-hacker-dots opacity-20 pointer-events-none"></div>
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand Column */}
          <div className="md:col-span-1">
            <Link href={`/${lang}`} className="inline-block hover:opacity-90 transition-opacity mb-8">
              <img
                src="/images/jombo-logo.svg"
                alt="Jombo"
                className="h-10 w-auto brightness-0 invert"
              />
            </Link>
            <p className="text-brand-gray text-sm leading-relaxed max-w-xs font-medium">
              {t("footer.description") || "Comparte tu viaje de forma gratuita y segura."}
            </p>
          </div>

          {/* About Column */}
          <div>
            <h3 className="text-white font-black mb-8 text-xs uppercase tracking-[0.2em]">{t("footer.about")}</h3>
            <p className="text-brand-gray text-sm leading-relaxed font-medium">
              {t("footer.description")}
            </p>
          </div>

          {/* Links Column */}
          <div>
            <h3 className="text-white font-black mb-8 text-xs uppercase tracking-[0.2em]">{t("footer.links")}</h3>
            <ul className="space-y-4">
              <li>
                <Link href={`/${lang}/terms`} className="text-brand-gray hover:text-brand-cyan text-sm transition-colors font-medium">
                  {t("footer.terms")}
                </Link>
              </li>
              <li>
                <Link href={`/${lang}/data-deletion`} className="text-brand-gray hover:text-brand-cyan text-sm transition-colors font-medium">
                  {t("footer.dataDeletion")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Column */}
          <div>
            <h3 className="text-white font-black mb-8 text-xs uppercase tracking-[0.2em]">{t("footer.contact")}</h3>
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-widest font-black text-brand-gray/80">{t("footer.supportEmail") || "Email de soporte"}</p>
              <a
                href={`mailto:${supportEmail}`}
                className="text-white hover:text-brand-cyan text-sm font-bold transition-colors inline-block pb-1 border-b border-white/10"
              >
                {supportEmail}
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/5 mt-20 pt-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-brand-gray/70 text-xs font-bold tracking-tight">
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
