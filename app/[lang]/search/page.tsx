"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter, useParams } from "next/navigation";
import { createBooking, getBookings } from "@/app/lib/api/bookings";
import { useTranslation } from "@/app/hooks/useTranslation";
import { useAuth } from "@/app/contexts/AuthContext";
import UserReviewsModal from "@/app/components/UserReviewsModal";
import BookTripModal from "@/app/components/BookTripModal";
import { toast } from "sonner";
import LocationInput from "@/app/components/LocationInput";
import ExternalTransportCard from "@/app/components/ExternalTransportCard";
import { searchTrips, Trip, ExternalOption, SearchResponse } from "@/app/lib/api/trips";

export default function SearchPage() {
  const { t, loading: translationsLoading } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const lang = (params?.lang as string) || "es";
  const from = searchParams.get("from") || "";
  const to = searchParams.get("to") || "";
  const { user } = useAuth();

  const [trips, setTrips] = useState<Trip[]>([]);
  const [externalOptions, setExternalOptions] = useState<ExternalOption[]>([]);
  const [isFallback, setIsFallback] = useState(false);
  const [source, setSource] = useState<"local" | "digitransit">("local");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [bookingLoading, setBookingLoading] = useState<number | null>(null);
  const [userBookings, setUserBookings] = useState<Map<number, string>>(new Map());
  const [reviewsModalOpen, setReviewsModalOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<{ id: number; name: string } | null>(null);
  const [searchFrom, setSearchFrom] = useState(from);
  const [searchTo, setSearchTo] = useState(to);
  const [bookTripModalOpen, setBookTripModalOpen] = useState(false);
  const [selectedTripForBooking, setSelectedTripForBooking] = useState<Trip | null>(null);

  useEffect(() => {
    if (!from && !to) {
      router.push(`/${lang}`);
      return;
    }
    async function fetchTrips() {
      try {
        setLoading(true);
        setError("");
        const response: SearchResponse = await searchTrips(from, to);
        setTrips(response.trips);
        setExternalOptions(response.external_options);
        setIsFallback(response.is_fallback);
        setSource(response.source);
        if (user) {
          try {
            const bookings = await getBookings();
            const bookingsMap = new Map<number, string>();
            bookings.forEach((b) => {
              if (b.status !== "cancelled" && b.status !== "rejected") {
                bookingsMap.set(b.trip_id, b.status);
              }
            });
            setUserBookings(bookingsMap);
          } catch (err) {}
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al buscar viajes");
      } finally {
        setLoading(false);
      }
    }
    fetchTrips();
  }, [from, to, lang, router, user]);

  if (translationsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="spinner"></div>
      </div>
    );
  }

  const handleBookTrip = async (trip: Trip) => {
    if (!user) {
      router.push(`/${lang}/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`);
      return;
    }
    if (user.id === trip.driver.id) {
      toast.error(t("page.search.cannotBookOwnTrip") || "No puedes reservar tu propio viaje.");
      return;
    }
    setSelectedTripForBooking(trip);
    setBookTripModalOpen(true);
  };

  const handleConfirmBooking = async (tripId: number, seatsNumber: number) => {
    setBookingLoading(tripId);
    try {
      await createBooking({ trip_id: tripId, seats: seatsNumber });
      toast.success(t("page.search.bookingSuccess") || "¡Solicitud enviada! Pendiente de confirmación");
      const response = await searchTrips(from, to);
      setTrips(response.trips);
      setExternalOptions(response.external_options);
      setSource(response.source);
      setIsFallback(response.is_fallback);
      const bookings = await getBookings();
      const bookingsMap = new Map<number, string>();
      bookings.forEach((b) => {
        if (b.status !== "cancelled" && b.status !== "rejected") {
          bookingsMap.set(b.trip_id, b.status);
        }
      });
      setUserBookings(bookingsMap);
      setBookTripModalOpen(false);
      setSelectedTripForBooking(null);
    } catch (error: any) {
      toast.error(error?.message || t("page.search.bookingError") || "Error al realizar la reserva");
    } finally {
      setBookingLoading(null);
    }
  };

  const handleOpenReviews = (driverId: number, driverName: string) => {
    setSelectedDriver({ id: driverId, name: driverName });
    setReviewsModalOpen(true);
  };

  const handleCloseReviews = () => {
    setReviewsModalOpen(false);
    setSelectedDriver(null);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchFrom.trim() && !searchTo.trim()) return;
    const p = new URLSearchParams();
    if (searchFrom.trim()) p.set("from", searchFrom);
    if (searchTo.trim()) p.set("to", searchTo);
    router.push(`/${lang}/search?${p.toString()}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
        <div className="spinner"></div>
        <p className="text-green-700 font-semibold text-lg">{t("page.search.searching") || "Buscando viajes"}...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-6 px-4">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <p className="text-red-700 text-xl font-semibold text-center">{error}</p>
        <button
          onClick={() => router.push(`/${lang}`)}
          className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-bold text-base transition-colors"
        >
          {t("page.search.back") || "Volver al inicio"}
        </button>
      </div>
    );
  }

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";

  return (
    <div className="min-h-screen bg-white">
      {/* Barra de búsqueda superior */}
      <div className="bg-green-50 border-b-2 border-green-100 py-6 px-4">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSearch} className="flex flex-col lg:flex-row gap-3">
            <div className="flex-1 flex items-center gap-2 bg-white border-2 border-green-300 rounded-xl px-4 py-3 focus-within:border-green-500 transition-colors">
              <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              <LocationInput
                value={searchFrom}
                onChange={(val: string) => setSearchFrom(val)}
                placeholder={t("page.home.from") || "Desde"}
                className="w-full bg-transparent border-none outline-none text-green-900 text-lg font-medium placeholder:text-green-400"
              />
            </div>
            <div className="flex-1 flex items-center gap-2 bg-white border-2 border-green-300 rounded-xl px-4 py-3 focus-within:border-green-500 transition-colors">
              <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              <LocationInput
                value={searchTo}
                onChange={(val: string) => setSearchTo(val)}
                placeholder={t("page.home.to") || "Hasta"}
                className="w-full bg-transparent border-none outline-none text-green-900 text-lg font-medium placeholder:text-green-400"
              />
            </div>
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-bold text-lg transition-colors flex items-center gap-2 justify-center"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {t("page.home.search") || "Buscar"}
            </button>
          </form>
        </div>
      </div>

      {/* Contenido de resultados */}
      <div className="max-w-4xl mx-auto py-10 px-4">
        {/* Cabecera resultados */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-green-900">
              {from}{to ? ` → ${to}` : ""}
            </h1>
            <p className="text-green-600 text-base mt-1">{t("page.search.results") || "Resultados de búsqueda"}</p>
          </div>
          <button
            onClick={() => router.push(`/${lang}`)}
            className="flex items-center gap-2 bg-white border-2 border-green-200 text-green-700 hover:bg-green-50 px-5 py-2.5 rounded-xl font-semibold text-base transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {t("page.search.back") || "Volver"}
          </button>
        </div>

        {/* Aviso de transporte público */}
        {source === "digitransit" && (
          <div className="mb-8 p-5 bg-green-50 border-2 border-green-200 rounded-xl flex items-start gap-4">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-green-900 font-bold text-base mb-1">
                {lang === "fi" ? "Ei kimppakyytejä löytynyt" : lang === "es" ? "No se encontraron viajes compartidos" : "No carpools found"}
              </p>
              <p className="text-green-700 text-base">
                {lang === "fi" ? "Näytetään julkisen liikenteen vaihtoehdot" : lang === "es" ? "Mostrando alternativas de transporte público entre " : "Showing public transport alternatives between "}
                <strong>{from} – {to}</strong>
              </p>
            </div>
          </div>
        )}

        {/* Sin resultados */}
        {trips.length === 0 && externalOptions.length === 0 ? (
          <div className="text-center py-20 bg-green-50 rounded-2xl border-2 border-green-100">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 9.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-xl text-green-700 font-semibold mb-2">{t("page.search.noResults") || "No hay viajes disponibles"}</p>
            <p className="text-green-600 text-base">Intenta con otras fechas o ciudades</p>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Viajes locales */}
            {trips.map((trip) => {
              const driverPictureUrl = trip.driver?.picture_url
                ? trip.driver.picture_url.startsWith("http")
                  ? trip.driver.picture_url
                  : `${API_BASE}${trip.driver.picture_url}`
                : null;

              const bookingStatus = userBookings.get(trip.id);

              return (
                <div key={trip.id} className="result-card">
                  <div className="flex flex-col md:flex-row gap-6 items-start">
                    {/* Avatar conductor */}
                    <div className="flex-shrink-0 text-center">
                      <div className="relative inline-block">
                        {driverPictureUrl ? (
                          <img
                            src={driverPictureUrl}
                            alt={trip.driver.name}
                            className="w-20 h-20 rounded-full object-cover border-2 border-green-200"
                            onError={(e) => {
                              const t = e.target as HTMLImageElement;
                              t.style.display = "none";
                              t.nextElementSibling?.classList.remove("hidden");
                            }}
                          />
                        ) : null}
                        <div className={`w-20 h-20 rounded-full bg-green-600 flex items-center justify-center text-white text-2xl font-bold ${driverPictureUrl ? "hidden" : ""}`}>
                          {trip.driver.name.charAt(0).toUpperCase()}
                        </div>
                        {/* Estrella */}
                        <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-white rounded-full border border-green-200 flex items-center justify-center shadow-sm">
                          <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        </div>
                      </div>
                      <button
                        onClick={() => handleOpenReviews(trip.driver.id, trip.driver.name)}
                        className="text-green-600 hover:text-green-800 text-sm font-semibold underline mt-2 block"
                      >
                        {t("page.search.seeReviews") || "Ver reseñas"}
                      </button>
                    </div>

                    {/* Info del viaje */}
                    <div className="flex-1 space-y-4">
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                        <div>
                          <p className="text-green-600 font-semibold text-sm mb-1">{trip.driver.name} · {new Date(trip.departure_time).toLocaleDateString(lang, { day: "numeric", month: "short" })}</p>
                          <h2 className="text-2xl font-bold text-green-900">
                            {trip.departure_location} → {trip.arrival_location}
                          </h2>
                        </div>
                        <div className="text-right">
                          <p className="text-3xl font-bold text-green-800">€{Number(trip.price || 0).toFixed(2)}</p>
                          <p className="text-green-500 text-sm font-medium">{t("page.search.perSeat") || "por plaza"}</p>
                        </div>
                      </div>

                      {/* Detalles */}
                      <div className="grid grid-cols-2 gap-4 bg-green-50 rounded-xl p-4 border border-green-100">
                        <div>
                          <p className="text-green-500 font-semibold text-xs uppercase tracking-wide mb-1">{t("page.search.departure") || "Salida"}</p>
                          <p className="text-green-900 font-bold text-base">{new Date(trip.departure_time).toLocaleTimeString(lang, { hour: "2-digit", minute: "2-digit" })} h</p>
                        </div>
                        <div>
                          <p className="text-green-500 font-semibold text-xs uppercase tracking-wide mb-1">{t("page.search.availableSeats") || "Plazas disponibles"}</p>
                          <p className={`font-bold text-base ${trip.available_seats <= 1 ? "text-red-600" : "text-green-700"}`}>
                            {trip.available_seats} {t("common.seats") || "asientos"}
                          </p>
                        </div>
                      </div>

                      {/* Botón reservar */}
                      <button
                        onClick={() => handleBookTrip(trip)}
                        disabled={bookingLoading === trip.id || trip.available_seats === 0 || !!bookingStatus}
                        className={`w-full py-4 rounded-xl font-bold text-base transition-colors ${
                          bookingStatus === "confirmed"
                            ? "bg-green-100 text-green-700 border-2 border-green-300 cursor-default"
                            : bookingStatus === "pending"
                            ? "bg-yellow-50 text-yellow-700 border-2 border-yellow-300 cursor-default"
                            : trip.available_seats === 0
                            ? "bg-gray-100 text-gray-500 border-2 border-gray-200 cursor-not-allowed"
                            : "bg-green-600 hover:bg-green-700 text-white shadow-md"
                        } disabled:opacity-70`}
                      >
                        {bookingLoading === trip.id
                          ? (t("page.search.booking") || "Procesando...")
                          : bookingStatus === "pending"
                          ? (t("page.search.statusPending") || "Solicitud enviada ✓")
                          : bookingStatus === "confirmed"
                          ? (t("page.search.statusConfirmed") || "Reserva Confirmada ✓")
                          : trip.available_seats === 0
                          ? (t("page.search.noSeats") || "Completo")
                          : t("page.search.book") || "Reservar plaza"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Opciones externas de transporte */}
            {externalOptions.map((option, idx) => (
              <ExternalTransportCard key={`ext-${idx}`} option={option} lang={lang} />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {reviewsModalOpen && selectedDriver && (
        <UserReviewsModal
          userId={selectedDriver.id}
          userName={selectedDriver.name}
          onClose={handleCloseReviews}
        />
      )}

      {bookTripModalOpen && (
        <BookTripModal
          isOpen={bookTripModalOpen}
          onClose={() => { setBookTripModalOpen(false); setSelectedTripForBooking(null); }}
          onConfirm={handleConfirmBooking}
          trip={selectedTripForBooking}
          loading={bookingLoading === selectedTripForBooking?.id}
          t={t}
        />
      )}
    </div>
  );
}
