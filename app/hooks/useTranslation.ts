"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type Translations = Record<string, any>;

export function useTranslation(namespace: string = "common") {
    const pathname = usePathname();
  const [translations, setTranslations] = useState<Translations>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTranslations = async () => {
      try {
        const lang = pathname.split('/')[1] || "es";
        console.log(`🌐 Loading translations: /locales/${lang}/${namespace}.json`);
        const res = await fetch(`/locales/${lang}/${namespace}.json`);
        if (res.ok) {
          const data = await res.json();
          console.log(`✅ Translations loaded for ${lang}/${namespace}:`, Object.keys(data));
          setTranslations(data);
        } else {
          console.error(`❌ Failed to load translations: ${res.status}`);
        }
      } catch (err) {
        console.error(`❌ Error loading ${namespace}.json:`, err);
        setTranslations({});
      } finally {
        setLoading(false);
      }
    };

    if (pathname) {
      loadTranslations();
    }
  }, [pathname, namespace]);

  const t = (key: string, defaultValue?: string): string => {
    const keys = key.split(".");
    let value: any = translations;

    for (const k of keys) {
      value = value?.[k];
    }

    const result = typeof value === "string" ? value : defaultValue || key;
    
    // Log cuando no se encuentra una traducción
    if (result === key && !loading && Object.keys(translations).length > 0) {
      console.warn(`⚠️ Translation not found: ${key}`);
    }
    
    return result;
  };

  return { t, loading };
}
