"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter, useParams } from "next/navigation";
import { searchTrips, Trip } from "@/app/lib/api/trips";
import { useTranslation } from "@/app/hooks/useTranslation";

export default function SearchPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const lang = (params?.lang as string) || "es";
  const from = searchParams.get("from") || "";
  
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!from) {
      router.push(`/${lang}`);
      return;
    }

    async function fetchTrips() {
      try {
        setLoading(true);
        setError("");
        const results = await searchTrips(from);
        console.log('🔍 Search results:', results);
        setTrips(results);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al buscar viajes");
      } finally {
        setLoading(false);
      }
    }

    fetchTrips();
  }, [from, lang, router]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-100 mb-6">
          {t("page.search.searching")}...
        </h1>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-red-600 mb-6">{error}</h1>
        <button
          onClick={() => router.push(`/${lang}`)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {t("page.search.back")}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          <span className="text-gray-700">{t("page.search.results")}</span> <span className="text-blue-600">"{from}"</span>
        </h1>
        <button
          onClick={() => router.push(`/${lang}`)}
          className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
        >
          {t("page.search.back")}
        </button>
      </div>

      {trips.length === 0 ? (
        <p className="text-gray-700">{t("page.search.noResults")}</p>
      ) : (
        <div className="space-y-4">
          {trips.map((trip) => {
            console.log('🎫 Trip:', trip, 'Price:', trip.price);
            return (
            <div
              key={trip.id}
              className="border border-gray-300 rounded-lg p-4 hover:shadow-lg transition-shadow bg-white"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {trip.departure_location} → {trip.arrival_location}
                  </h2>
                  <p className="text-gray-700">
                    {t("page.search.driver")}: {trip.driver.name}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">
                    €{Number(trip.price || 0).toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-600">
                    {t("page.search.perSeat")}
                  </p>
                </div>
              </div>
              
              <div className="flex justify-between items-center mt-4">
                <div>
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">{t("page.search.departure")}:</span> {new Date(trip.departure_time).toLocaleString(lang)}
                  </p>
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">{t("page.search.availableSeats")}:</span> {trip.available_seats}
                  </p>
                </div>
                <button className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
                  {t("page.search.book")}
                </button>
              </div>
            </div>
          )})}
        </div>
      )}
    </div>
  );
}
