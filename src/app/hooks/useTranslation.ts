"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

type Translations = Record<string, any>;

export function useTranslation(namespace: string = "common") {
  const params = useParams();
  const lang = ((params as any)?.lang || "es") as string;
  const [translations, setTranslations] = useState<Translations>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTranslations = async () => {
      try {
        const res = await fetch(`/locales/${lang}/${namespace}.json`);
        if (res.ok) {
          const data = await res.json();
          setTranslations(data);
        }
      } catch (err) {
        console.warn(`Failed to load ${lang}/${namespace}.json:`, err);
        setTranslations({});
      } finally {
        setLoading(false);
      }
    };

    loadTranslations();
  }, [lang, namespace]);

  const t = (key: string, defaultValue?: string): string => {
    const keys = key.split(".");
    let value: any = translations;

    for (const k of keys) {
      value = value?.[k];
    }

    return typeof value === "string" ? value : defaultValue || key;
  };

  return { t, loading };
}
