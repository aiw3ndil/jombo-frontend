"use client";
import { useState } from "react";
import { useTranslation } from "@/src/app/hooks/useTranslation";

export default function Home({ params }: { params: { lang: string } }) {
  const { t } = useTranslation();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    alert(`${t("page.home.search")} ${from} → ${to}`);
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-black mb-6">{t("page.home.welcome")}</h1>

      <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
        <input
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          placeholder={t("page.home.from")}
          className="border p-2 rounded w-1/3"
        />
        <input
          value={to}
          onChange={(e) => setTo(e.target.value)}
          placeholder={t("page.home.to")}
          className="border p-2 rounded w-1/3"
        />
        <button className="bg-blue-600 text-white px-4 py-2 rounded">{t("page.home.search")}</button>
      </form>

      <button className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-lg shadow-md transition-colors duration-200">
        {t("page.home.publish")}
      </button>
    </div>
  );
}
