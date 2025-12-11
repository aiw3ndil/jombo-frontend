"use client";

import { AuthProvider } from "@/app/contexts/AuthContext";
import { NotificationsProvider } from "@/app/contexts/NotificationsContext";
import { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <NotificationsProvider>{children}</NotificationsProvider>
    </AuthProvider>
  );
}
