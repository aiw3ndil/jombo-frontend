"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import LanguageSwitcher from "./LanguageSwitcher";
import { useAuth } from "@/app/contexts/AuthContext";
import { useTranslation } from "@/app/hooks/useTranslation";

export default function Header({ lang }: { lang: string }) {
  const { user, logout } = useAuth();
  const { t, loading } = useTranslation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  console.log('🟡 Header: user state:', user);
  console.log('🟡 Header: translation loading:', loading);
  console.log('🟡 Header: myBookings translation:', t("menu.myBookings"));
  console.log('🟡 Header: myTrips translation:', t("menu.myTrips"));
  console.log('🟡 Header: logout translation:', t("menu.logout"));

  useEffect(() => {
    if (!isDropdownOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.user-dropdown')) {
        setIsDropdownOpen(false);
      }
    };

    // Pequeño delay para evitar que el click que abre el dropdown lo cierre inmediatamente
    setTimeout(() => {
      document.addEventListener("click", handleClickOutside);
    }, 0);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isDropdownOpen]);

  return (
    <header className="p-4 bg-blue-700 text-white flex justify-between items-center">
      <Link href={`/${lang}`} className="text-xl font-bold hover:underline">
        Jombo
      </Link>
      <div className="flex items-center gap-4">
        <LanguageSwitcher />
        {user ? (
          <div className="relative user-dropdown">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsDropdownOpen(!isDropdownOpen);
              }}
              className="bg-white text-blue-700 px-3 py-1 rounded-lg hover:bg-blue-50 flex items-center gap-2"
            >
              {user.name || user.email}
              <svg
                className={`w-4 h-4 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50">
                <Link
                  href={`/${lang}/messages`}
                  onClick={() => setIsDropdownOpen(false)}
                  className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100"
                >
                  {t("menu.messages")}
                </Link>
                <Link
                  href={`/${lang}/my-bookings`}
                  onClick={() => setIsDropdownOpen(false)}
                  className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100"
                >
                  {t("menu.myBookings")}
                </Link>
                <Link
                  href={`/${lang}/my-trips`}
                  onClick={() => setIsDropdownOpen(false)}
                  className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100"
                >
                  {t("menu.myTrips")}
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setIsDropdownOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100"
                >
                  {t("menu.logout")}
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link
            href={`/${lang}/login`}
            className="bg-white text-blue-700 px-3 py-1 rounded-lg hover:bg-blue-50 transition-colors"
          >
            Login
          </Link>
        )}
      </div>
    </header>
  );
}
