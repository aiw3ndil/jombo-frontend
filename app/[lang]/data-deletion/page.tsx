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
        <div className="min-h-screen bg-white text-green-950">
            {/* ── HERO ── */}
            <section className="bg-green-50 border-b-2 border-green-100 py-20 px-4">
                <div className="max-w-5xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 bg-green-100 border border-green-300 text-green-800 px-5 py-2 rounded-full text-sm font-bold mb-6 uppercase tracking-wide">
                        {t("dataDeletion.badge")}
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black text-green-900 leading-tight mb-4 tracking-tight">
                        {t("dataDeletion.title")}
                    </h1>
                    <p className="text-xl text-green-700 max-w-2xl mx-auto font-medium opacity-80 leading-relaxed">
                        {t("dataDeletion.description")}
                    </p>
                </div>
            </section>

            {/* ── CONTENIDO ── */}
            <section className="py-20 px-4 bg-white relative -mt-10">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white border-2 border-green-100 rounded-[3rem] p-8 md:p-16 shadow-[0_32px_64px_-16px_rgba(22,101,52,0.1)] relative overflow-hidden">
                        <div className="space-y-16 text-green-800 leading-relaxed">
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                <section className="space-y-6">
                                    <h2 className="text-2xl font-black text-green-900 flex items-center gap-4">
                                        <span className="w-2 h-8 bg-green-600 rounded-full"></span>
                                        {t("dataDeletion.section1.title")}
                                    </h2>
                                    <p className="text-lg opacity-90 pl-6 border-l-2 border-green-50">
                                        {t("dataDeletion.section1.content")}
                                    </p>
                                </section>

                                <section className="space-y-6">
                                    <h2 className="text-2xl font-black text-green-900 flex items-center gap-4">
                                        <span className="w-2 h-8 bg-green-400 rounded-full"></span>
                                        {t("dataDeletion.section2.title")}
                                    </h2>
                                    <div className="space-y-4 pl-6 border-l-2 border-green-50">
                                        <p className="text-lg opacity-90">{t("dataDeletion.section2.content")}</p>
                                        <ul className="space-y-3">
                                            {[
                                                t("dataDeletion.section2.list.item1"),
                                                t("dataDeletion.section2.list.item2"),
                                                t("dataDeletion.section2.list.item3")
                                            ].map((item, i) => (
                                                <li key={i} className="flex items-center gap-3 text-base font-medium text-green-700">
                                                    <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                        <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                    </div>
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </section>
                            </div>

                            <section className="space-y-6">
                                <h2 className="text-2xl font-black text-green-900 flex items-center gap-4">
                                    <span className="w-2 h-8 bg-green-200 rounded-full"></span>
                                    {t("dataDeletion.section3.title")}
                                </h2>
                                <p className="text-lg opacity-90 pl-6 border-l-2 border-green-50">
                                    {t("dataDeletion.section3.content")}
                                </p>
                            </section>

                            {/* Proceso de eliminación */}
                            <section className="bg-green-50 border-2 border-green-200 rounded-[3rem] p-8 md:p-12 shadow-inner relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-green-100/50 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-500"></div>
                                
                                <h2 className="text-3xl font-black text-green-900 mb-10 flex items-center gap-4 relative z-10">
                                    <div className="w-12 h-12 bg-green-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-green-200">
                                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </div>
                                    {t("dataDeletion.section4.title")}
                                </h2>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 relative z-10">
                                    <div className="space-y-8">
                                        <div className="inline-block bg-white px-4 py-1.5 rounded-full border border-green-200 shadow-sm text-xs font-black text-green-600 uppercase tracking-widest">
                                            {t("dataDeletion.section4.subtitle")}
                                        </div>
                                        <div className="space-y-6">
                                            {[
                                                t("dataDeletion.section4.step1"),
                                                t("dataDeletion.section4.step2"),
                                                t("dataDeletion.section4.step3"),
                                                t("dataDeletion.section4.step4")
                                            ].map((step, i) => (
                                                <div key={i} className="flex gap-6 items-start group/step">
                                                    <span className="flex-shrink-0 w-8 h-8 rounded-xl bg-white border-2 border-green-200 flex items-center justify-center text-sm font-black text-green-600 shadow-sm group-hover/step:border-green-600 group-hover/step:bg-green-600 group-hover/step:text-white transition-all">
                                                        {i + 1}
                                                    </span>
                                                    <p className="text-lg font-medium text-green-800 leading-snug group-hover/step:text-green-950 transition-colors pt-0.5">
                                                        {step}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="bg-white p-8 md:p-10 rounded-[2.5rem] border-2 border-green-100 shadow-xl space-y-8">
                                        <div className="inline-block bg-green-600 px-4 py-1.5 rounded-full text-[10px] font-black text-white uppercase tracking-widest">
                                            {t("dataDeletion.section5.subtitle")}
                                        </div>
                                        <p className="text-lg font-medium text-green-700">
                                            {t("dataDeletion.section5.content")}
                                        </p>
                                        <div className="p-6 bg-green-50 rounded-2xl border-2 border-green-100 text-center hover:border-green-300 transition-colors group/email">
                                            <p className="text-green-500 font-bold uppercase tracking-widest text-[10px] mb-2 group-hover/email:text-green-700 transition-colors">
                                                {t("footer.supportEmail")}
                                            </p>
                                            <p className="text-green-900 font-black text-xl hover:text-green-600 transition-colors">
                                                {t("dataDeletion.section5.email")}
                                            </p>
                                        </div>
                                        <p className="text-xs font-bold italic text-green-400 text-center px-4 leading-relaxed">
                                            {t("dataDeletion.section5.note")}
                                        </p>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
