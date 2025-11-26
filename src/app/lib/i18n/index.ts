"use client";

import i18n from "i18next";
import { initReactI18next } from "react-i18next";

let initPromise: Promise<void> | null = null;

const initializeI18n = (): Promise<void> => {
  if (i18n.isInitialized) {
    return Promise.resolve();
  }

  if (initPromise) {
    return initPromise;
  }

  initPromise = (async () => {
    const resources = {
      en: { common: {}, login: {}, register: {} },
      fi: { common: {}, login: {}, register: {} },
      es: { common: {}, login: {}, register: {} },
    };

    // Load translations from public/locales
    for (const lang of ["en", "fi", "es"]) {
      for (const ns of ["common", "login", "register"]) {
        try {
          const res = await fetch(`/locales/${lang}/${ns}.json`);
          if (res.ok) {
            (resources as any)[lang][ns] = await res.json();
          }
        } catch (err) {
          console.warn(`Failed to load ${lang}/${ns}.json:`, err);
        }
      }
    }

    // Detect language from URL path
    const pathLang = typeof window !== "undefined" ? window.location.pathname.split("/")[1] : "es";
    const detectedLang = ["es", "en", "fi"].includes(pathLang) ? pathLang : "es";

    await i18n.use(initReactI18next).init({
      resources,
      lng: detectedLang,
      fallbackLng: "es",
      ns: ["common", "login", "register"],
      defaultNS: "common",
      interpolation: { escapeValue: false },
    });
  })();

  return initPromise;
};

// Start initialization immediately
initializeI18n();

export { initializeI18n };
export default i18n;