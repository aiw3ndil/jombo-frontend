"use client";
import Header from "@/src/app/components/Header";
import { AuthProvider } from "@/src/app/contexts/AuthContext";
import { useParams } from "next/navigation";

export default function LangLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const lang = ((params as any)?.lang || "es") as string;

  return (
    <AuthProvider>
      <Header lang={lang} />
      <main className="p-6">{children}</main>
    </AuthProvider>
  );
}
