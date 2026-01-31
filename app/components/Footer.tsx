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
    <footer className="bg-gray-800 text-white mt-auto">
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Columna 1: Información */}
          <div>
            <h3 className="text-lg font-bold mb-4">{t("footer.about")}</h3>
            <p className="text-gray-300 text-sm">
              {t("footer.description")}
            </p>
          </div>

          {/* Columna 2: Enlaces */}
          <div>
            <h3 className="text-lg font-bold mb-4">{t("footer.links")}</h3>
            <ul className="space-y-2">
              <li>
                <Link href={`/${lang}/terms`} className="text-gray-300 hover:text-white text-sm">
                  {t("footer.terms")}
                </Link>
              </li>

              <li>
                <Link href={`/${lang}/data-deletion`} className="text-gray-300 hover:text-white text-sm">
                  {t("footer.dataDeletion")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Columna 3: Contacto */}
          <div>
            <h3 className="text-lg font-bold mb-4">{t("footer.contact")}</h3>
            <a
              href={`mailto:${supportEmail}`}
              className="text-gray-300 hover:text-white text-sm"
            >
              {supportEmail}
            </a>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-6 text-center">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} Jombo. {t("footer.rights")}
          </p>
        </div>
      </div>
    </footer>
  );
}
