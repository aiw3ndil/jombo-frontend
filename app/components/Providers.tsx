"use client";

import { AuthProvider } from "@/app/contexts/AuthContext";
import { NotificationsProvider } from "@/app/contexts/NotificationsContext";
import { GoogleMapsProvider } from "@/app/contexts/GoogleMapsContext";
import { ReactNode } from "react";

const getRegionFromLang = (lang: string) => {
  switch (lang) {
    case 'fi': return 'FI';
    case 'en': return 'US';
    case 'es':
    default: return 'ES';
  }
};

export function Providers({ children, lang = 'es' }: { children: ReactNode; lang?: string }) {
  const region = getRegionFromLang(lang);
  
  return (
    <AuthProvider>
      <NotificationsProvider>
        <GoogleMapsProvider language={lang} region={region}>
          {children}
        </GoogleMapsProvider>
      </NotificationsProvider>
    </AuthProvider>
  );
}
