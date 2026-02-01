"use client";

import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { ReactNode } from "react";

export function ClientLayout({
  children,
  lang
}: {
  children: ReactNode;
  lang: string;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-brand-dark">
      <Header lang={lang} />
      <main className="flex-1">
        {children}
      </main>
      <Footer lang={lang} />
    </div>
  );
}
