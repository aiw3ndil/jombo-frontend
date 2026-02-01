"use client";

import { AuthProvider } from "@/app/contexts/AuthContext";
import { NotificationsProvider } from "@/app/contexts/NotificationsContext";
import { GoogleMapsProvider } from "@/app/contexts/GoogleMapsContext";
import { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <NotificationsProvider>
        <GoogleMapsProvider>
          {children}
        </GoogleMapsProvider>
      </NotificationsProvider>
    </AuthProvider>
  );
}
