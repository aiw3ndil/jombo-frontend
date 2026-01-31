"use client";

import { useTranslation } from "@/app/hooks/useTranslation";
import { useParams } from "next/navigation";
import { useEffect } from "react";

export default function DataDeletionPage() {
    const { t } = useTranslation();
    const params = useParams();
    const lang = (params?.lang as string) || "es";

    // Actualizar título y meta description
    useEffect(() => {
        const title = t("dataDeletion.title") || "Instrucciones de Eliminación de Datos";
        document.title = `${title} | Jombo`;

        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription) {
            metaDescription.setAttribute('content',
                'Instrucciones sobre cómo eliminar tus datos en Jombo. Aprende cómo borrar tu cuenta y qué datos se eliminan.'
            );
        }
    }, [t, lang]);

    return (
        <div className="max-w-4xl mx-auto py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">
                {t("dataDeletion.title")}
            </h1>

            <div className="prose prose-sm md:prose-base text-gray-700 space-y-8">
                <section>
                    <p className="lead text-lg">
                        {t("dataDeletion.description")}
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-gray-900 mb-3">
                        {t("dataDeletion.section1.title")}
                    </h2>
                    <p>{t("dataDeletion.section1.content")}</p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-gray-900 mb-3">
                        {t("dataDeletion.section2.title")}
                    </h2>
                    <p>{t("dataDeletion.section2.content")}</p>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                        <li>{t("dataDeletion.section2.list.item1")}</li>
                        <li>{t("dataDeletion.section2.list.item2")}</li>
                        <li>{t("dataDeletion.section2.list.item3")}</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-gray-900 mb-3">
                        {t("dataDeletion.section3.title")}
                    </h2>
                    <p>{t("dataDeletion.section3.content")}</p>
                </section>

                <section className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                        {t("dataDeletion.section4.title")}
                    </h2>

                    <div className="mb-6">
                        <h3 className="text-xl font-medium text-gray-800 mb-2">
                            {t("dataDeletion.section4.subtitle")}
                        </h3>
                        <ol className="list-decimal pl-5 space-y-2">
                            <li>{t("dataDeletion.section4.step1")}</li>
                            <li>{t("dataDeletion.section4.step2")}</li>
                            <li>{t("dataDeletion.section4.step3")}</li>
                            <li>{t("dataDeletion.section4.step4")}</li>
                        </ol>
                    </div>

                    <div>
                        <h3 className="text-xl font-medium text-gray-800 mb-2">
                            {t("dataDeletion.section5.subtitle")}
                        </h3>
                        <p>{t("dataDeletion.section5.content")}</p>
                        <p className="mt-2 font-semibold text-blue-600">
                            {t("dataDeletion.section5.email")}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                            {t("dataDeletion.section5.note")}
                        </p>
                    </div>
                </section>
            </div>
        </div>
    );
}
