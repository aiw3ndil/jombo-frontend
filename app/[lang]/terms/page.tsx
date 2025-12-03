"use client";

import { useTranslation } from "@/app/hooks/useTranslation";
import { useParams } from "next/navigation";
import { useEffect } from "react";

export default function TermsPage() {
  const { t } = useTranslation();
  const params = useParams();
  const lang = (params?.lang as string) || "es";

  // Actualizar título y meta description
  useEffect(() => {
    const title = t("terms.title") || "Términos y Condiciones";
    document.title = `${title} | Jombo`;
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 
        'Términos y condiciones de uso de Jombo. Lee sobre nuestras políticas y limitaciones de responsabilidad.'
      );
    }
  }, [t, lang]);

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        {t("terms.title")}
      </h1>

      <div className="prose prose-sm md:prose-base text-gray-700 space-y-6">
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-3">
            {t("terms.section1.title")}
          </h2>
          <p>{t("terms.section1.content")}</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-3">
            {t("terms.section2.title")}
          </h2>
          <p>{t("terms.section2.content")}</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-3">
            {t("terms.section3.title")}
          </h2>
          <p>{t("terms.section3.content")}</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-3">
            {t("terms.section4.title")}
          </h2>
          <p className="font-bold text-red-600">{t("terms.section4.content")}</p>
          <p className="mt-2">{t("terms.section4.details")}</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-3">
            {t("terms.section5.title")}
          </h2>
          <p>{t("terms.section5.content")}</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-3">
            {t("terms.section6.title")}
          </h2>
          <p>{t("terms.section6.content")}</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-3">
            {t("terms.section7.title")}
          </h2>
          <p>{t("terms.section7.content")}</p>
        </section>

        <section className="border-t pt-6 mt-8">
          <p className="text-sm text-gray-600">
            {t("terms.lastUpdate")}: {t("terms.updateDate")}
          </p>
        </section>
      </div>
    </div>
  );
}
