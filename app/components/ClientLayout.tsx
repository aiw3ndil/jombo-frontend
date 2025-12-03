"use client";

import Header from "@/app/components/Header";
import { ReactNode } from "react";

export function ClientLayout({ 
  children, 
  lang 
}: { 
  children: ReactNode;
  lang: string;
}) {
  return (
    <>
      <Header lang={lang} />
      <main className="min-h-screen bg-gray-50 py-6">
        <div className="container mx-auto px-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            {children}
          </div>
        </div>
      </main>
    </>
  );
}
