"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter, useParams } from "next/navigation";
import { searchTrips, Trip } from "@/app/lib/api/trips";
import { createBooking, getBookings } from "@/app/lib/api/bookings";
import { useTranslation } from "@/app/hooks/useTranslation";
import { useAuth } from "@/app/contexts/AuthContext";

export default function SearchPage() {
  const { t, loading: translationsLoading } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const lang = (params?.lang as string) || "es";
  const from = searchParams.get("from") || "";
  const { user } = useAuth();
  
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [bookingLoading, setBookingLoading] = useState<number | null>(null);
  const [userBookings, setUserBookings] = useState<Map<number, string>>(new Map());

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
        
        // Si el usuario está logueado, cargar sus reservas
        if (user) {
          try {
            const bookings = await getBookings();
            // Crear un mapa de trip_id -> status para reservas activas
            const bookingsMap = new Map<number, string>();
            bookings.forEach(b => {
              if (b.status !== 'cancelled' && b.status !== 'rejected') {
                bookingsMap.set(b.trip_id, b.status);
              }
            });
            setUserBookings(bookingsMap);
            console.log('📋 User bookings:', Array.from(bookingsMap.entries()));
          } catch (err) {
            console.error('Error loading user bookings:', err);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al buscar viajes");
      } finally {
        setLoading(false);
      }
    }

    fetchTrips();
  }, [from, lang, router, user]);

  // Wait for translations to load
  if (translationsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const handleBookTrip = async (tripId: number, availableSeats: number) => {
    if (!user) {
      router.push(`/${lang}/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`);
      return;
    }

    const seats = prompt(t("page.search.howManySeats") || `¿Cuántos asientos? (Disponibles: ${availableSeats})`, "1");
    
    if (!seats) return;
    
    const seatsNumber = parseInt(seats);
    
    if (isNaN(seatsNumber) || seatsNumber < 1 || seatsNumber > availableSeats) {
      alert(t("page.search.invalidSeats") || "Número de asientos inválido");
      return;
    }

    setBookingLoading(tripId);

    try {
      await createBooking({
        trip_id: tripId,
        seats: seatsNumber,
      });
      
      alert(t("page.search.bookingSuccess") || "¡Solicitud de reserva enviada! Pendiente de confirmación del conductor");
      
      // Recargar los viajes para actualizar los asientos disponibles
      const results = await searchTrips(from);
      setTrips(results);
      
      // Actualizar las reservas del usuario
      const bookings = await getBookings();
      const bookingsMap = new Map<number, string>();
      bookings.forEach(b => {
        if (b.status !== 'cancelled' && b.status !== 'rejected') {
          bookingsMap.set(b.trip_id, b.status);
        }
      });
      setUserBookings(bookingsMap);
    } catch (error: any) {
      console.error("Error booking trip:", error);
      alert(error?.message || t("page.search.bookingError") || "Error al realizar la reserva");
    } finally {
      setBookingLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
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
                <button 
                  onClick={() => handleBookTrip(trip.id, trip.available_seats)}
                  disabled={
                    bookingLoading === trip.id || 
                    trip.available_seats === 0 || 
                    userBookings.has(trip.id)
                  }
                  className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {bookingLoading === trip.id 
                    ? (t("page.search.booking") || "Reservando...") 
                    : userBookings.has(trip.id)
                    ? userBookings.get(trip.id) === "pending"
                      ? (t("page.search.statusPending") || "Pendiente")
                      : (t("page.search.statusConfirmed") || "Confirmada")
                    : trip.available_seats === 0
                    ? (t("page.search.noSeats") || "Sin asientos")
                    : t("page.search.book")}
                </button>
              </div>
            </div>
          )})}
        </div>
      )}
    </div>
  );
}
