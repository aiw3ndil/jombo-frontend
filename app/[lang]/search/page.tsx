"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter, useParams } from "next/navigation";
import Link from "next/link";
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
      {/* ── HERO / SEARCH BAR ── */}
      <section className="bg-green-50 border-b-2 border-green-100 py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-green-900 mb-4">
              {from} <span className="text-green-300 mx-2">→</span> {to}
            </h1>
            <p className="text-lg text-green-700 font-medium">
              {t("page.search.results") || "Explora las mejores opciones para tu trayecto"}
            </p>
          </div>

          <form onSubmit={handleSearch} className="bg-white p-4 rounded-[2.5rem] shadow-xl border-2 border-green-100 flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-green-400 group-focus-within:text-green-600 transition-colors z-10">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
              </div>
              <LocationInput
                value={searchFrom}
                onChange={(val: string) => setSearchFrom(val)}
                placeholder={t("page.home.from") || "Origen"}
                className="form-input pl-12 border-transparent bg-green-50/30 focus:bg-white"
              />
            </div>
            <div className="flex-1 relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-green-400 group-focus-within:text-green-600 transition-colors z-10">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
              </div>
              <LocationInput
                value={searchTo}
                onChange={(val: string) => setSearchTo(val)}
                placeholder={t("page.home.to") || "Destino"}
                className="form-input pl-12 border-transparent bg-green-50/30 focus:bg-white"
              />
            </div>
            <button
              type="submit"
              className="btn-primary px-10 py-4 shadow-lg lg:w-auto w-full"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {t("page.home.search") || "Actualizar"}
            </button>
          </form>
        </div>
      </section>

      {/* ── CONTENIDO ── */}
      <section className="py-20 px-4 min-h-[60vh]">
        <div className="max-w-5xl mx-auto">
          {/* Aviso de transporte público */}
          {source === "digitransit" && (
            <div className="mb-12 p-8 bg-green-50 border-2 border-green-200 rounded-[2.5rem] flex items-center gap-6 animate-in fade-in slide-in-from-top-4">
              <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center flex-shrink-0 shadow-sm border border-green-100">
                <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-green-900 font-black text-lg">
                  {lang === "fi" ? "Ei kimppakyytejä löytynyt" : lang === "es" ? "No se encontraron viajes compartidos" : "No carpools found"}
                </p>
                <p className="text-green-700 text-lg font-medium opacity-80">
                  {lang === "fi" ? "Näytetään julkisen liikenteen vaihtoehdot" : lang === "es" ? "Mostrando alternativas de transporte público" : "Showing public transport alternatives"}
                </p>
              </div>
            </div>
          )}

          {/* Sin resultados */}
          {trips.length === 0 && externalOptions.length === 0 ? (
            <div className="text-center py-24 bg-green-50/30 rounded-[3rem] border-2 border-dashed border-green-200">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-sm border-2 border-green-100 text-green-400">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 9.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-green-900 mb-4">{t("page.search.noResults") || "No hay viajes disponibles"}</h2>
              <p className="text-green-700 text-lg mb-8 max-w-md mx-auto font-medium">Intenta cambiar las ciudades o busca de nuevo más tarde.</p>
              <button onClick={() => router.push(`/${lang}`)} className="btn-secondary px-8 py-4">
                {t("page.search.back") || "Ver otros trayectos"}
              </button>
            </div>
          ) : (
            <div className="space-y-10">
              {/* Viajes locales */}
              {trips.map((trip) => {
                const driverPictureUrl = trip.driver?.picture_url
                  ? trip.driver.picture_url.startsWith("http")
                    ? trip.driver.picture_url
                    : `${API_BASE}${trip.driver.picture_url}`
                  : null;

                const bookingStatus = userBookings.get(trip.id);

                return (
                  <div key={trip.id} className="result-card group">
                    <div className="absolute top-0 left-0 w-2 h-full bg-green-500 group-hover:bg-green-600 transition-colors"></div>
                    
                    <div className="flex flex-col xl:flex-row gap-10">
                      {/* Lado Izquierdo: Conductor */}
                      <div className="flex-shrink-0 flex flex-col items-center">
                        <div className="relative p-1 bg-green-50 rounded-full border-2 border-green-100 group-hover:border-green-300 transition-colors">
                          <div className="w-24 h-24 rounded-full overflow-hidden shadow-inner bg-green-100 flex items-center justify-center">
                            {driverPictureUrl ? (
                              <img
                                src={driverPictureUrl}
                                alt={trip.driver.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(trip.driver.name)}&background=15803d&color=fff`;
                                }}
                              />
                            ) : (
                              <span className="text-3xl font-black text-green-700">
                                {trip.driver.name.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-9 h-9 bg-white rounded-full border-2 border-green-100 flex items-center justify-center shadow-lg">
                            <svg className="w-5 h-5 text-yellow-500 fill-current" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          </div>
                        </div>
                        <p className="mt-4 font-black text-green-900 text-lg">{trip.driver.name}</p>
                        <button
                          onClick={() => handleOpenReviews(trip.driver.id, trip.driver.name)}
                          className="text-green-600 hover:text-green-800 text-sm font-bold uppercase tracking-widest mt-2 transition-colors cursor-pointer"
                        >
                          {t("page.search.seeReviews") || "Reseñas"}
                        </button>
                      </div>

                      {/* Lado Central: Info Viaje */}
                      <div className="flex-1 space-y-8">
                        <div className="flex flex-wrap items-center gap-4">
                          <div className="flex items-center gap-2 text-green-600 font-bold bg-green-50 px-5 py-2 rounded-full border border-green-100 shadow-sm">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="uppercase tracking-wider">
                              {new Date(trip.departure_time).toLocaleDateString(lang, { day: 'numeric', month: 'long' })}
                            </span>
                            <span className="text-green-300 mx-1">|</span>
                            <span className="text-green-800">
                              {new Date(trip.departure_time).toLocaleTimeString(lang, { hour: '2-digit', minute: '2-digit' })}h
                            </span>
                          </div>
                          {trip.available_seats <= 2 && trip.available_seats > 0 && (
                            <span className="bg-red-50 text-red-600 border border-red-100 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest animate-pulse">
                              Últimas plazas
                            </span>
                          )}
                        </div>

                        <div>
                          <h3 className="text-4xl font-black text-green-900 leading-tight tracking-tight">
                            {trip.departure_location} <span className="text-green-300 mx-2">→</span> {trip.arrival_location}
                          </h3>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                           <div className="bg-green-50/50 border border-green-100 rounded-2xl p-4">
                            <p className="text-xs font-bold text-green-400 uppercase tracking-widest mb-1">{t("page.search.availableSeats") || "Plazas Libres"}</p>
                            <p className={`text-xl font-black ${trip.available_seats === 0 ? "text-red-500" : "text-green-900"}`}>
                              {trip.available_seats} <span className="text-sm font-bold text-green-700/60 lowercase">disponibles</span>
                            </p>
                          </div>
                          <div className="bg-green-50/50 border border-green-100 rounded-2xl p-4">
                            <p className="text-xs font-bold text-green-400 uppercase tracking-widest mb-1">{t("page.search.price") || "Precio"}</p>
                            <p className="text-2xl font-black text-green-700 italic">€{Number(trip.price).toFixed(2)}</p>
                          </div>
                        </div>
                      </div>

                      {/* Lado Derecho: Acciones */}
                      <div className="flex flex-col justify-center items-stretch min-w-[240px] gap-4">
                        <button
                          onClick={() => handleBookTrip(trip)}
                          disabled={bookingLoading === trip.id || trip.available_seats === 0 || !!bookingStatus}
                          className={`w-full py-6 rounded-[1.5rem] font-bold text-lg shadow-xl transform transition-all active:scale-95 ${
                            bookingStatus === "confirmed"
                              ? "bg-green-100 text-green-700 border-2 border-green-400 cursor-default"
                              : bookingStatus === "pending"
                              ? "bg-yellow-50 text-yellow-700 border-2 border-yellow-400 cursor-default"
                              : trip.available_seats === 0
                              ? "bg-gray-100 text-gray-400 border-2 border-gray-200 cursor-not-allowed shadow-none"
                              : "btn-primary"
                          }`}
                        >
                          {bookingLoading === trip.id
                            ? "..."
                            : bookingStatus === "pending"
                            ? "SOLICITADO ✓"
                            : bookingStatus === "confirmed"
                            ? "RESERVADO ✓"
                            : trip.available_seats === 0
                            ? "COMPLETO"
                            : t("page.search.book") || "RESERVAR AHORA"}
                        </button>
                        
                        {bookingStatus && (
                          <Link 
                            href={`/${lang}/my-bookings`} 
                            className="text-center text-sm font-bold text-green-600 hover:text-green-800 transition-colors uppercase tracking-widest underline decoration-2 underline-offset-4"
                          >
                            Ver mis reservas
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Opciones externas de transporte */}
              {externalOptions.length > 0 && (
                <div className="pt-10">
                  <h2 className="text-2xl font-bold text-green-900 mb-8 flex items-center gap-3">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                    {t("page.search.externalOptions") || "Otras alternativas de transporte"}
                  </h2>
                  <div className="space-y-6">
                    {externalOptions.map((option, idx) => (
                      <ExternalTransportCard key={`ext-${idx}`} option={option} lang={lang} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Modals */}
      {reviewsModalOpen && selectedDriver && (
        <UserReviewsModal
          userId={selectedDriver.id}
          userName={selectedDriver.name}
          onClose={handleCloseReviews}
        />
      )}

      {bookTripModalOpen && selectedTripForBooking && (
        <BookTripModal
          key={selectedTripForBooking.id}
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
