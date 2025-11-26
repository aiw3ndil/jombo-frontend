"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Get saved language preference or default to Spanish
    const savedLang = localStorage.getItem("preferredLanguage") || "es";
    router.replace(`/${savedLang}`);
  }, [router]);

  return null;
}
