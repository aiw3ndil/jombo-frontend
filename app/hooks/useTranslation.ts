"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type Translations = Record<string, any>;

export function useTranslation(namespaces: string | string[] = "common") { // Changed to accept string or string[]
  const pathname = usePathname();
  const [translations, setTranslations] = useState<Translations>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTranslations = async () => {
      setLoading(true); // Set loading to true when starting to load new translations
      const langsToLoad = Array.isArray(namespaces) ? namespaces : [namespaces]; // Ensure it's an array

      const loadedTranslations: Translations = {};
      const lang = pathname.split('/')[1] || "es";

      for (const ns of langsToLoad) {
        try {
          console.log(`🌐 Loading translations: /locales/${lang}/${ns}.json`);
          const res = await fetch(`/locales/${lang}/${ns}.json`);
          if (res.ok) {
            const data = await res.json();
            console.log(`✅ Translations loaded for ${lang}/${ns}:`, Object.keys(data));
            // Merge new translations into the loadedTranslations object
            Object.assign(loadedTranslations, data);
          } else {
            console.error(`❌ Failed to load translations for ${lang}/${ns}: ${res.status}`);
          }
        } catch (err) {
          console.error(`❌ Error loading ${ns}.json:`, err);
        }
      }
      setTranslations(loadedTranslations);
      setLoading(false);
    };

    if (pathname) {
      loadTranslations();
    }
  }, [pathname, namespaces]); // 'namespaces' is now a dependency

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
