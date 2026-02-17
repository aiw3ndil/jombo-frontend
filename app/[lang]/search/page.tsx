"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter, useParams } from "next/navigation";
import { searchTrips, Trip } from "@/app/lib/api/trips";
import { createBooking, getBookings } from "@/app/lib/api/bookings";
import { useTranslation } from "@/app/hooks/useTranslation";
import { useAuth } from "@/app/contexts/AuthContext";
import UserReviewsModal from "@/app/components/UserReviewsModal";
import BookTripModal from "@/app/components/BookTripModal";
import { toast } from "sonner";
import LocationInput from "@/app/components/LocationInput";

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [bookingLoading, setBookingLoading] = useState<number | null>(null);
  const [userBookings, setUserBookings] = useState<Map<number, string>>(new Map());
  const [reviewsModalOpen, setReviewsModalOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<{ id: number; name: string } | null>(null);
  const [searchFrom, setSearchFrom] = useState(from);
  const [searchTo, setSearchTo] = useState(to);
  const [bookTripModalOpen, setBookTripModalOpen] = useState(false); // New state
  const [selectedTripForBooking, setSelectedTripForBooking] = useState<Trip | null>(null); // New state

  useEffect(() => {
    if (!from && !to) {
      router.push(`/${lang}`);
      return;
    }

    async function fetchTrips() {
      try {
        setLoading(true);
        setError("");
        const results = await searchTrips(from, to);
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
  }, [from, to, lang, router, user]);

  // Wait for translations to load
  if (translationsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
      await createBooking({
        trip_id: tripId,
        seats: seatsNumber,
      });

      toast.success(t("page.search.bookingSuccess") || "¡Solicitud de reserva enviada! Pendiente de confirmación del conductor");

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

      setBookTripModalOpen(false); // Close modal on success
      setSelectedTripForBooking(null); // Clear selected trip
    } catch (error: any) {
      console.error("Error booking trip:", error);
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

    const params = new URLSearchParams();
    if (searchFrom.trim()) {
      params.set("from", searchFrom);
    }
    if (searchTo.trim()) {
      params.set("to", searchTo);
    }

    router.push(`/${lang}/search?${params.toString()}`);
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto py-12 px-6 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="relative w-20 h-20 mb-8">
          <div className="absolute inset-0 rounded-full border-4 border-white/5 border-t-brand-cyan animate-spin"></div>
          <div className="absolute inset-2 rounded-full border-4 border-white/5 border-t-brand-purple animate-spin" style={{ animationDuration: '1.5s' }}></div>
        </div>
        <h1 className="text-xl font-bold text-white uppercase tracking-widest animate-pulse">
          {t("page.search.searching")}...
        </h1>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto py-20 px-6 text-center">
        <div className="w-20 h-20 bg-brand-pink/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-brand-pink/20">
          <svg className="w-10 h-10 text-brand-pink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h1 className="text-3xl font-black text-white mb-6 tracking-tighter uppercase italic">{error}</h1>
        <button
          onClick={() => router.push(`/${lang}`)}
          className="bg-white/5 text-white px-8 py-3 rounded-2xl hover:bg-white/10 transition-all font-bold uppercase tracking-widest text-xs border border-white/10"
        >
          {t("page.search.back")}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-12 px-4 sm:px-6 relative">
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[400px] h-[400px] bg-brand-cyan/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-12">
        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tightest uppercase italic">
          <span className="text-brand-gray/50 not-italic font-medium text-lg block mb-2 tracking-[0.2em]">
            {t("page.search.results")}
          </span>
          {from}
        </h1>
        <button
          onClick={() => router.push(`/${lang}`)}
          className="group flex items-center gap-3 bg-white/5 text-brand-gray hover:text-white px-6 py-3 rounded-2xl transition-all border border-white/5 hover:border-white/10 font-bold text-sm"
        >
          <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          {t("page.search.back")}
        </button>
      </div>

      {/* Modern Search Bar */}
      <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-3 mb-16 shadow-2xl relative overflow-hidden group">
        <div className="absolute inset-0 bg-hacker-dots opacity-5 pointer-events-none"></div>
        <form onSubmit={handleSearch} className="relative flex flex-col lg:flex-row gap-2">
          <div className="flex-1 flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-white/10 items-center">
            <div className="w-full relative group/input">
              <div className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-gray group-focus-within/input:text-brand-cyan transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
              </div>
              <LocationInput
                value={searchFrom}
                onChange={(val: string) => setSearchFrom(val)}
                placeholder={t("page.home.from") || "Desde"}
                className="w-full bg-transparent border-none pl-14 pr-4 py-4 text-white placeholder:text-brand-gray/40 focus:ring-0 outline-none font-bold"
              />
            </div>
            <div className="w-full relative group/input">
              <div className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-gray group-focus-within/input:text-brand-purple transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
              </div>
              <LocationInput
                value={searchTo}
                onChange={(val: string) => setSearchTo(val)}
                placeholder={t("page.home.to") || "Hasta"}
                className="w-full bg-transparent border-none pl-14 pr-4 py-4 text-white placeholder:text-brand-gray/40 focus:ring-0 outline-none font-bold"
              />
            </div>
          </div>
          <button
            type="submit"
            className="bg-brand-gradient text-white px-10 py-4 rounded-[2rem] font-black uppercase tracking-widest text-xs transition-all hover:scale-[1.02] active:scale-95 shadow-xl shadow-brand-cyan/20 flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {t("page.home.search") || "Buscar"}
          </button>
        </form>
      </div>

      {trips.length === 0 ? (
        <div className="text-center py-24 bg-white/5 rounded-[3rem] border border-white/5 backdrop-blur-xl">
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/10">
            <svg className="w-8 h-8 text-brand-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 9.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-xl text-brand-gray font-medium uppercase tracking-widest">{t("page.search.noResults")}</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {trips.map((trip) => {
            const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";
            const driverPictureUrl = trip.driver.picture_url
              ? (trip.driver.picture_url.startsWith('http')
                ? trip.driver.picture_url
                : `${API_BASE}${trip.driver.picture_url}`)
              : null;

            return (
              <div
                key={trip.id}
                className="group relative bg-white/5 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] p-8 hover:border-brand-cyan/20 transition-all duration-500 hover:shadow-2xl hover:shadow-brand-cyan/5 overflow-hidden"
              >
                <div className="absolute inset-0 bg-hacker-dots opacity-5 pointer-events-none"></div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-cyan/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>

                <div className="relative flex flex-col md:flex-row gap-8 items-center md:items-start">
                  {/* Driver Photo & Meta */}
                  <div className="flex-shrink-0 text-center space-y-4">
                    <div className="relative">
                      <div className="absolute inset-0 bg-brand-gradient opacity-20 blur-xl rounded-full scale-110"></div>
                      {driverPictureUrl ? (
                        <img
                          src={driverPictureUrl}
                          alt={trip.driver.name}
                          className="relative w-24 h-24 rounded-full object-cover border-2 border-white/10 shadow-2xl"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            target.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                      ) : null}
                      <div
                        className={`relative w-24 h-24 rounded-full bg-brand-gradient flex items-center justify-center text-white text-3xl font-black ${driverPictureUrl ? 'hidden' : ''}`}
                      >
                        {trip.driver.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-brand-dark rounded-full border border-white/10 flex items-center justify-center shadow-lg">
                        <svg className="w-4 h-4 text-brand-cyan" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </div>
                    </div>
                    <button
                      onClick={() => handleOpenReviews(trip.driver.id, trip.driver.name)}
                      className="text-brand-gray hover:text-white text-xs font-black uppercase tracking-widest transition-all block mx-auto underline decoration-brand-gray/50 underline-offset-4"
                    >
                      {t("page.search.seeReviews") || "Reseñas"}
                    </button>
                  </div>

                  {/* Trip Info */}
                  <div className="flex-1 space-y-6 w-full">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-3 text-brand-cyan font-black text-xs uppercase tracking-[0.2em] mb-2">
                          <span>{trip.driver.name}</span>
                          <span className="w-1.5 h-1.5 rounded-full bg-white/10"></span>
                          <span>{new Date(trip.departure_time).toLocaleDateString(lang, { day: 'numeric', month: 'short' })}</span>
                        </div>
                        <h2 className="text-2xl md:text-3xl font-black text-white leading-tight tracking-tightest flex items-center gap-4 group-hover:text-brand-cyan transition-colors">
                          {trip.departure_location}
                          <svg className="w-6 h-6 text-brand-gray/30 group-hover:text-brand-cyan/50 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                          </svg>
                          {trip.arrival_location}
                        </h2>
                      </div>
                      <div className="text-right flex flex-row sm:flex-col items-center sm:items-end gap-3 sm:gap-0">
                        <p className="text-3xl font-black text-white tracking-tightest">
                          €{Number(trip.price || 0).toFixed(2)}
                        </p>
                        <p className="text-xs font-black text-brand-gray uppercase tracking-widest leading-none">
                          {t("page.search.perSeat")}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 bg-black/20 rounded-3xl p-5 border border-white/5 gap-4">
                      <div className="space-y-1">
                        <p className="text-xs font-black text-brand-gray/70 uppercase tracking-widest">{t("page.search.departure")}</p>
                        <p className="text-sm font-bold text-white italic">{new Date(trip.departure_time).toLocaleTimeString(lang, { hour: '2-digit', minute: '2-digit' })} HS</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-black text-brand-gray/70 uppercase tracking-widest">{t("page.search.availableSeats")}</p>
                        <p className="text-sm font-bold text-white flex items-center gap-2">
                          <span className={`${trip.available_seats <= 1 ? 'text-brand-pink' : 'text-brand-cyan'}`}>{trip.available_seats}</span>
                          <span className="text-xs text-brand-gray/80 font-bold uppercase tracking-wide">{t("common.seats") || "Asientos"}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex pt-2">
                      <button
                        onClick={() => handleBookTrip(trip)}
                        disabled={
                          bookingLoading === trip.id ||
                          trip.available_seats === 0 ||
                          userBookings.has(trip.id)
                        }
                        className="w-full bg-white/5 text-white border border-white/10 px-8 py-4 rounded-2xl hover:bg-brand-gradient hover:border-transparent transition-all shadow-xl font-black uppercase tracking-[0.2em] text-xs disabled:opacity-40 disabled:cursor-not-allowed group/btn relative overflow-hidden active:scale-[0.98]"
                      >
                        <span className="relative z-10">
                          {bookingLoading === trip.id
                            ? (t("page.search.booking") || "Procesando...")
                            : userBookings.has(trip.id)
                              ? userBookings.get(trip.id) === "pending"
                                ? (t("page.search.statusPending") || "Solicitud enviada")
                                : (t("page.search.statusConfirmed") || "Reserva Confirmada")
                              : trip.available_seats === 0
                                ? (t("page.search.noSeats") || "Lleno")
                                : t("page.search.book") || "Reservar Asiento"}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

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
          onClose={() => {
            setBookTripModalOpen(false);
            setSelectedTripForBooking(null);
          }}
          onConfirm={handleConfirmBooking}
          trip={selectedTripForBooking}
          loading={bookingLoading === selectedTripForBooking?.id}
          t={t}
        />
      )}
    </div>
  );
}
