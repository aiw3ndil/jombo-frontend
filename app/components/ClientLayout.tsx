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
    <div className="flex flex-col min-h-screen">
      <Header lang={lang} />
      <main className="flex-1 bg-gray-50 py-6">
        <div className="container mx-auto px-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            {children}
          </div>
        </div>
      </main>
      <Footer lang={lang} />
    </div>
  );
}
