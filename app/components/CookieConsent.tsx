"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "@/app/hooks/useTranslation";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const { t } = useTranslation();
  const params = useParams();
  const lang = (params?.lang as string) || "es";

  useEffect(() => {
    // Check if user has already given consent
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      // Small delay for better UX
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookie-consent", "true");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 md:p-6">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white border-2 border-green-300 rounded-2xl p-6 md:p-8 shadow-xl relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-xl font-bold text-green-900 mb-2 flex items-center justify-center md:justify-start gap-3">
                🍪 {t("cookies.title")}
              </h3>
              <p className="text-green-800 text-base leading-relaxed max-w-2xl">
                {t("cookies.description")}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0 w-full sm:w-auto">
              <Link
                href={`/${lang}/terms`}
                className="text-green-700 font-semibold text-base hover:text-green-900 transition-colors underline py-2 px-4"
              >
                {t("cookies.learnMore")}
              </Link>
              <button
                onClick={handleAccept}
                className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-bold text-base py-4 px-10 rounded-xl transition-colors shadow-md cursor-pointer active:scale-95"
              >
                {t("cookies.accept")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
