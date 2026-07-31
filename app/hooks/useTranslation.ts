"use client";

import { usePathname } from "next/navigation";
import { useMemo } from "react";

import esCommon from "@/public/locales/es/common.json";
import esLogin from "@/public/locales/es/login.json";
import esRegister from "@/public/locales/es/register.json";
import esMyTrips from "@/public/locales/es/myTrips.json";
import enCommon from "@/public/locales/en/common.json";
import enLogin from "@/public/locales/en/login.json";
import enRegister from "@/public/locales/en/register.json";
import enMyTrips from "@/public/locales/en/myTrips.json";
import fiCommon from "@/public/locales/fi/common.json";
import fiLogin from "@/public/locales/fi/login.json";
import fiRegister from "@/public/locales/fi/register.json";

type Translations = Record<string, any>;

const SUPPORTED_LANGS = ["es", "en", "fi"];

// Traducciones empaquetadas en el build: disponibles de forma síncrona en
// servidor y cliente, sin depender de fetch en tiempo de ejecución.
const FILES: Record<string, Record<string, Translations>> = {
  es: { common: esCommon, login: esLogin, register: esRegister, myTrips: esMyTrips },
  en: { common: enCommon, login: enLogin, register: enRegister, myTrips: enMyTrips },
  fi: { common: fiCommon, login: fiLogin, register: fiRegister },
};

export function useTranslation(namespaces?: string | string[]) {
  const pathname = usePathname();
  const pathLang = pathname?.split("/")[1] || "es";
  const lang = SUPPORTED_LANGS.includes(pathLang) ? pathLang : "es";

  const translations = useMemo(() => {
    const requested = namespaces
      ? Array.isArray(namespaces)
        ? namespaces
        : [namespaces]
      : ["common"];
    const files = FILES[lang] ?? FILES.es;

    return requested.reduce<Translations>(
      (acc, ns) => ({ ...acc, ...(files[ns] ?? {}) }),
      {}
    );
  }, [lang, namespaces]);

  const t = (key: string, defaultValue?: string): string => {
    const keys = key.split(".");
    let value: any = translations;

    for (const k of keys) {
      value = value?.[k];
    }

    if (typeof value === "string") {
      return value;
    }

    if (defaultValue !== undefined) {
      return defaultValue;
    }

    if (process.env.NODE_ENV !== "production") {
      console.warn(`⚠️ Translation not found: ${key}`);
    }

    return "";
  };

  return { t, loading: false };
}
