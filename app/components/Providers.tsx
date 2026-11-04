"use client";

import { AuthProvider } from "@/app/contexts/AuthContext";
import { NotificationsProvider } from "@/app/contexts/NotificationsContext";
import { GoogleMapsProvider } from "@/app/contexts/GoogleMapsContext";
import { ReactNode } from "react";

// Jombo only operates in Finland
const MAPS_REGION = 'FI';

export function Providers({ children, lang = 'fi' }: { children: ReactNode; lang?: string }) {
  const region = MAPS_REGION;
  
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
