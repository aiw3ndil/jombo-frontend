"use client";
import { useParams, useSearchParams } from "next/navigation";
import React from "react";
import { localePath, normalizeLang, stripLangPrefix } from "@/app/lib/i18n/config";

const languages = [
  { code: "fi", label: "🇫🇮 Suomi" },
  { code: "en", label: "🇬🇧 English" },
];

export default function LanguageSwitcher() {
  const params = useParams();
  const searchParams = useSearchParams();

  const selected = normalizeLang((params as any)?.lang);

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const lang = e.target.value;

    // Ruta actual sin prefijo de idioma (el finés no lleva prefijo)
    const currentPath = typeof window !== "undefined" ? stripLangPrefix(window.location.pathname) : "/";
    let newPath = localePath(lang, currentPath === "/" ? "" : currentPath);

    // Agregar los query parameters si existen
    const queryString = searchParams.toString();
    if (queryString) {
      newPath += `?${queryString}`;
    }

    window.location.href = newPath;
  }

  return (
    <select
      value={selected}
      onChange={handleChange}
      className="px-3 py-1 border rounded bg-white text-black"
      aria-label="Change language"
    >
      {languages.map((l) => (
        <option key={l.code} value={l.code}>
          {l.label}
        </option>
      ))}
    </select>
  );
}
