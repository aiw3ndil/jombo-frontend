"use client";
import { useEffect, useState, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { getMyTrips, Trip } from "@/app/lib/api/trips";
import { useTranslation } from "@/app/hooks/useTranslation";
import { useAuth } from "@/app/contexts/AuthContext";

export default function MyTrips() {
  const translationNamespaces = useMemo(() => ["common", "myTrips"], []);
  const { t, loading: translationsLoading } = useTranslation(translationNamespaces);
  const router = useRouter();
  const params = useParams();
  const lang = (params?.lang as string) || "es";
  const { user, loading: authLoading } = useAuth();

  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/${lang}/login?redirect=/${lang}/my-trips`);
      return;
    }

    if (user) {
      loadTrips();
    }
  }, [user, authLoading, router, lang]);

  const loadTrips = async () => {
    try {
      setLoading(true);
      const data = await getMyTrips();
      // Sort trips by date, newest first or by departure date?
      // Usually upcoming trips first.
      const sortedTrips = data.sort((a, b) => new Date(a.departure_time).getTime() - new Date(b.departure_time).getTime());
      setTrips(sortedTrips);
    } catch (error) {
      console.error("Error loading trips:", error);
    } finally {
      setLoading(false);
    }
  };

  if (translationsLoading || authLoading || loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <p className="text-gray-900">{t("page.myTrips.loading") || "Cargando..."}</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {t("page.myTrips.title")}
        </h1>
        <div className="flex gap-4">
          <Link href={`/${lang}/create-trip`} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors shadow-sm">
            {t("page.myTrips.createTrip") || "Publicar viaje"}
          </Link>
        </div>
      </div>

      {trips.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-500 text-lg mb-6">
            {t("page.myTrips.noTrips") || "No has publicado ningún viaje"}
          </p>
          <button
            onClick={() => router.push(`/${lang}/create-trip`)}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            {t("page.myTrips.createTrip") || "Publicar viaje"}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {trips.map((trip) => (
            <div
              key={trip.id}
              className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-gray-900">
                      {trip.departure_location} <span className="text-gray-400">→</span> {trip.arrival_location}
                    </h3>
                  </div>

                  <div className="flex flex-wrap gap-x-6 gap-y-2 text-gray-600 text-sm">
                    <div className="flex items-center gap-1">
                      <span className="font-medium">{t("page.myTrips.departure")}:</span>
                      {new Date(trip.departure_time).toLocaleString(lang, {
                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </div>

                    <div className="flex items-center gap-1">
                      <span className="font-medium">{t("page.myTrips.availableSeats")}:</span>
                      <span className={trip.available_seats === 0 ? "text-red-500 font-bold" : ""}>
                        {trip.available_seats}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <span className="font-medium">{t("page.myTrips.price")}:</span>
                      €{Number(trip.price).toFixed(2)}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 min-w-[200px] justify-end">
                  <Link
                    href={`/${lang}/my-trips/${trip.id}`}
                    className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-50 text-center transition-colors font-medium whitespace-nowrap"
                  >
                    {t("page.myTrips.manageTrip") || "Gestionar viaje"}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
