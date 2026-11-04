"use client";
import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { langPrefix } from "@/app/lib/i18n/config";
import { useTranslation } from "@/app/hooks/useTranslation";
import { useAuth } from "@/app/contexts/AuthContext";
import { getMyTrips, updateTrip, CreateTripData, Trip } from "@/app/lib/api/trips";
import { toast } from "sonner";
import TripForm from "@/app/components/TripForm";

export default function EditTrip({ params }: { params: Promise<{ lang: string; id: string }> }) {
  const { lang = "fi", id } = use(params);
  const tripId = parseInt(id, 10);
  const { t, loading: translationsLoading } = useTranslation();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);

  const tripUrl = `${langPrefix(lang)}/my-trips/${tripId}`;

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push(`${langPrefix(lang)}/login?redirect=${tripUrl}/edit`);
      return;
    }

    // Solo el conductor puede editar: buscamos el viaje entre los suyos
    getMyTrips()
      .then((trips) => {
        const current = trips.find((tr) => tr.id === tripId);
        if (!current) {
          toast.error(t("page.editTrip.notFound", "Trip not found"));
          router.push(`${langPrefix(lang)}/my-trips`);
          return;
        }
        setTrip(current);
      })
      .catch(() => toast.error(t("page.editTrip.loadError", "Error loading trip data")))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading, tripId]);

  if (translationsLoading || authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!trip) return null;

  const handleSubmit = async (data: CreateTripData) => {
    await updateTrip(trip.id, data);
    toast.success(t("page.editTrip.success", "Trip updated successfully"));
    router.push(tripUrl);
  };

  return <TripForm mode="edit" trip={trip} onSubmit={handleSubmit} onCancel={() => router.push(tripUrl)} />;
}
