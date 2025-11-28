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
      <main className="p-6">{children}</main>
    </>
  );
}
