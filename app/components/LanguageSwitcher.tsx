"use client";
import { usePathname, useParams, useRouter } from "next/navigation";
import React from "react";

const languages = [
  { code: "es", label: "🇪🇸 Español" },
  { code: "fi", label: "🇫🇮 Suomi" },
  { code: "en", label: "🇬🇧 English" },
];

export default function LanguageSwitcher() {
  const pathname = usePathname();
  const params = useParams();
  const router = useRouter();

  const currentPath = pathname?.split("/").slice(2).join("/") || "";
  const selected = ((params as any)?.lang || "es") as string;

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const lang = e.target.value;
    // Save language preference to localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("preferredLanguage", lang);
    }
    const newPath = currentPath ? `/${lang}/${currentPath}` : `/${lang}`;
    router.push(newPath);
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
