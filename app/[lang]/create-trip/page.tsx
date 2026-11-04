"use client";
import { useEffect } from "react";
import { localePath, langPrefix } from "@/app/lib/i18n/config";
import { useTranslation } from "@/app/hooks/useTranslation";
import { useRouter, useParams } from "next/navigation";
import { createTrip, CreateTripData } from "@/app/lib/api/trips";
import { useAuth } from "@/app/contexts/AuthContext";
import { toast } from "sonner";
import TripForm from "@/app/components/TripForm";

export default function CreateTrip() {
  const { t, loading: translationsLoading } = useTranslation();
  const router = useRouter();
  const params = useParams();
  const lang = (params?.lang as string) || "fi";
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`${langPrefix(lang)}/login?redirect=${langPrefix(lang)}/create-trip`);
    }
  }, [user, authLoading, router, lang]);

  if (translationsLoading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!user) return null;

  const handleSubmit = async (data: CreateTripData) => {
    await createTrip(data);
    toast.success(t("page.createTrip.success") || "Trip published successfully");
    router.push(localePath(lang));
  };

  return <TripForm mode="create" onSubmit={handleSubmit} onCancel={() => router.back()} />;
}
