"use client";
import { useEffect, useState } from "react";
import { localePath, langPrefix } from "@/app/lib/i18n/config";
import { useTranslation } from "@/app/hooks/useTranslation";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { createTrip, CreateTripData } from "@/app/lib/api/trips";
import { useAuth } from "@/app/contexts/AuthContext";
import Link from "next/link";
import { toast } from "sonner";
import TripForm from "@/app/components/TripForm";
import VerificationPanel from "@/app/components/VerificationPanel";
import { getAppConfig } from "@/app/lib/api/users";

export default function CreateTrip() {
  const { t, loading: translationsLoading } = useTranslation();
  const router = useRouter();
  const params = useParams();
  const lang = (params?.lang as string) || "fi";
  const { user, loading: authLoading } = useAuth();
  const query = useSearchParams();
  const rideRequestId = query.get("ride_request");
  const initialValues = {
    from: query.get("from") || undefined,
    to: query.get("to") || undefined,
    date: query.get("date") || undefined,
    seats: query.get("seats") ? Number(query.get("seats")) : undefined,
  };

  // null = todavía cargando la configuración
  const [smsEnabled, setSmsEnabled] = useState<boolean | null>(null);
  useEffect(() => {
    getAppConfig().then((c) => setSmsEnabled(c.sms_enabled)).catch(() => setSmsEnabled(false));
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`${langPrefix(lang)}/login?redirect=${langPrefix(lang)}/create-trip`);
    }
  }, [user, authLoading, router, lang]);

  if (translationsLoading || authLoading || smsEnabled === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!user) return null;

  // Para publicar viajes hace falta el teléfono verificado (si se pueden enviar SMS)
  if (smsEnabled && !user.verifications?.phone) {
    return (
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-10">
        <div className="rounded-2xl border-2 border-yellow-300 bg-yellow-50 p-5 text-yellow-900">
          <h1 className="mb-1 text-xl font-bold">📱 {t("gate.phone.title", "Verify your phone to publish trips")}</h1>
          <p>
            {t("gate.phone.text", "Passengers trust drivers with a verified phone number. It is never shown publicly.")}{" "}
            {!user.phone && t("gate.phone.addFirst", "Add your number in your profile first.")}
          </p>
          {!user.phone && (
            <Link href={`${langPrefix(lang)}/profile`} className="btn-primary mt-4 inline-block px-4 py-2 text-sm">
              {t("gate.phone.goToProfile", "Go to my profile")}
            </Link>
          )}
        </div>
        {user.phone && <VerificationPanel />}
      </div>
    );
  }

  const handleSubmit = async (data: CreateTripData) => {
    await createTrip(rideRequestId ? { ...data, ride_request_id: Number(rideRequestId) } : data);
    toast.success(t("page.createTrip.success") || "Trip published successfully");
    router.push(localePath(lang));
  };

  return <TripForm mode="create" onSubmit={handleSubmit} onCancel={() => router.back()} initialValues={initialValues} />;
}
