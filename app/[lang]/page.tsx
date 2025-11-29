"use client";
import { useState } from "react";
import { useTranslation } from "@/app/hooks/useTranslation";
import { useRouter, useParams } from "next/navigation";

export default function Home() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useParams();
  const lang = (params?.lang as string) || "es";
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!from) {
      alert(t("page.home.fromRequired") || "Por favor ingresa la ubicación de salida");
      return;
    }
    // Redirigir a la página de búsqueda con los parámetros
    const searchParams = new URLSearchParams();
    searchParams.set("from", from);
    if (to) searchParams.set("to", to);
    router.push(`/${lang}/search?${searchParams.toString()}`);
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-100 mb-6">{t("page.home.welcome")}</h1>

      <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
        <input
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          placeholder={t("page.home.from")}
          className="border border-gray-300 p-2 rounded w-1/3 text-gray-100"
          required
        />
        <input
          value={to}
          onChange={(e) => setTo(e.target.value)}
          placeholder={t("page.home.to")}
          className="border border-gray-300 p-2 rounded w-1/3 text-gray-100"
        />
        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">{t("page.home.search")}</button>
      </form>

      <button className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-900">{t("page.home.publish")}</button>
    </div>
  );
}
