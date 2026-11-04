"use client";

import { useParams } from "next/navigation";
import { useMemo } from "react";

import enCommon from "@/public/locales/en/common.json";
import enLogin from "@/public/locales/en/login.json";
import enRegister from "@/public/locales/en/register.json";
import enMyTrips from "@/public/locales/en/myTrips.json";
import fiCommon from "@/public/locales/fi/common.json";
import fiLogin from "@/public/locales/fi/login.json";
import fiRegister from "@/public/locales/fi/register.json";
import fiMyTrips from "@/public/locales/fi/myTrips.json";
import { normalizeLang } from "@/app/lib/i18n/config";

type Translations = Record<string, any>;

// Traducciones empaquetadas en el build: disponibles de forma síncrona en
// servidor y cliente, sin depender de fetch en tiempo de ejecución.
const FILES: Record<string, Record<string, Translations>> = {
  en: { common: enCommon, login: enLogin, register: enRegister, myTrips: enMyTrips },
  fi: { common: fiCommon, login: fiLogin, register: fiRegister, myTrips: fiMyTrips },
};

export function useTranslation(namespaces?: string | string[]) {
  // Finnish pages have no URL prefix, so read the language from the route params
  const params = useParams();
  const lang = normalizeLang((params as any)?.lang);

  const translations = useMemo(() => {
    const requested = namespaces
      ? Array.isArray(namespaces)
        ? namespaces
        : [namespaces]
      : ["common"];
    const files = FILES[lang] ?? FILES.fi;

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
