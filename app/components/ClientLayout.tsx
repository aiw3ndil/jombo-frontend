"use client";

import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { HillsDivider } from "@/app/components/Landscape";
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
      <HillsDivider className="block w-full h-10 md:h-16 -mb-px mt-12" />
      <Footer lang={lang} />
    </div>
  );
}
