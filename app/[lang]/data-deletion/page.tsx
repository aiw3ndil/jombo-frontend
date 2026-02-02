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
        <div className="max-w-5xl mx-auto py-12 px-4 sm:px-6 relative">
            <div className="absolute top-0 left-0 -translate-y-1/2 -translate-x-1/4 w-[400px] h-[400px] bg-brand-purple/5 rounded-full blur-[100px] pointer-events-none"></div>
            <div className="absolute bottom-0 right-0 translate-y-1/2 translate-x-1/4 w-[300px] h-[300px] bg-brand-cyan/5 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="mb-12">
                <h1 className="text-4xl md:text-5xl font-black text-white tracking-tightest uppercase italic mb-4">
                    {t("dataDeletion.title")}
                </h1>
                <p className="text-brand-gray/80 font-bold uppercase tracking-[0.2em] text-xs">
                    Instrucciones para el control total de tu identidad digital
                </p>
            </div>

            <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-hacker-dots opacity-5 pointer-events-none"></div>

                <div className="relative space-y-12 text-brand-gray/80 leading-relaxed">
                    <section>
                        <p className="text-lg md:text-xl text-white font-medium italic border-l-4 border-brand-cyan pl-6 py-2">
                            {t("dataDeletion.description")}
                        </p>
                    </section>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <section className="space-y-4">
                            <h2 className="text-xl font-black text-white uppercase tracking-wider flex items-center gap-3">
                                <span className="w-1.5 h-6 bg-brand-purple rounded-full"></span>
                                {t("dataDeletion.section1.title")}
                            </h2>
                            <p className="text-sm md:text-base">{t("dataDeletion.section1.content")}</p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-xl font-black text-white uppercase tracking-wider flex items-center gap-3">
                                <span className="w-1.5 h-6 bg-brand-cyan rounded-full"></span>
                                {t("dataDeletion.section2.title")}
                            </h2>
                            <p className="text-sm md:text-base">{t("dataDeletion.section2.content")}</p>
                            <ul className="space-y-3">
                                {[
                                    t("dataDeletion.section2.list.item1"),
                                    t("dataDeletion.section2.list.item2"),
                                    t("dataDeletion.section2.list.item3")
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-sm md:text-base">
                                        <svg className="w-4 h-4 text-brand-cyan" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </section>
                    </div>

                    <section className="space-y-4">
                        <h2 className="text-xl font-black text-white uppercase tracking-wider flex items-center gap-3">
                            <span className="w-1.5 h-6 bg-brand-purple rounded-full"></span>
                            {t("dataDeletion.section3.title")}
                        </h2>
                        <p className="text-sm md:text-base">{t("dataDeletion.section3.content")}</p>
                    </section>

                    <section className="bg-black/40 border border-white/10 rounded-[2.5rem] p-8 md:p-10 relative group overflow-hidden">
                        <div className="absolute inset-0 bg-brand-cyan/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                        <h2 className="text-2xl font-black text-white uppercase tracking-tightest italic mb-8 relative z-10 flex items-center gap-4">
                            <svg className="w-8 h-8 text-brand-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            {t("dataDeletion.section4.title")}
                        </h2>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 relative z-10">
                            <div className="space-y-6">
                                <h3 className="text-xs font-black text-brand-cyan uppercase tracking-[0.2em] mb-4 bg-brand-cyan/10 px-4 py-1.5 rounded-full inline-block border border-brand-cyan/20">
                                    {t("dataDeletion.section4.subtitle")}
                                </h3>
                                <div className="space-y-4">
                                    {[
                                        t("dataDeletion.section4.step1"),
                                        t("dataDeletion.section4.step2"),
                                        t("dataDeletion.section4.step3"),
                                        t("dataDeletion.section4.step4")
                                    ].map((step, i) => (
                                        <div key={i} className="flex gap-4 items-start">
                                            <span className="flex-shrink-0 w-6 h-6 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-black text-brand-cyan font-mono">
                                                0{i + 1}
                                            </span>
                                            <p className="text-sm leading-relaxed">{step}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-6 p-6 md:p-8 bg-brand-purple/10 border border-brand-purple/20 rounded-3xl">
                                <h3 className="text-xs font-black text-brand-purple uppercase tracking-[0.2em] mb-4 bg-brand-purple/10 px-4 py-1.5 rounded-full inline-block border border-brand-purple/20">
                                    {t("dataDeletion.section5.subtitle")}
                                </h3>
                                <p className="text-sm md:text-base mb-6">{t("dataDeletion.section5.content")}</p>
                                <div className="p-4 bg-black/40 rounded-2xl border border-white/5 text-center">
                                    <p className="text-brand-purple font-black uppercase tracking-widest text-sm mb-1">
                                        Terminal de Soporte
                                    </p>
                                    <p className="text-white font-bold text-lg lowercase">
                                        {t("dataDeletion.section5.email")}
                                    </p>
                                </div>
                                <p className="text-[10px] font-black italic uppercase tracking-widest text-brand-gray/40 text-center">
                                    {t("dataDeletion.section5.note")}
                                </p>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
