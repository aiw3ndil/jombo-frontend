"use client";
import Link from "next/link";
import LanguageSwitcher from "./LanguageSwitcher";

export default function Header({ lang }: { lang: string }) {
  return (
    <header className="p-4 bg-blue-700 text-white flex justify-between items-center">
      <Link href={`/${lang}`} className="text-xl font-bold hover:underline">
        Jombo
      </Link>
      <div className="flex items-center gap-4">
        <LanguageSwitcher />
        <Link
          href={`/${lang}/login`}
          className="bg-white text-blue-700 px-3 py-1 rounded-lg hover:bg-black/5"
        >
          Login
        </Link>
      </div>
    </header>
  );
}
