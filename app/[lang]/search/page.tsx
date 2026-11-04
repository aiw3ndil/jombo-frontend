"use client";
import { VehicleSummary } from "@/app/components/VehicleSelector";
import { useEffect, useState } from "react";
import { localePath, langPrefix } from "@/app/lib/i18n/config";
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
import { searchTrips, Trip, ExternalOption, SearchResponse, SearchFilters, FILTER_KEYS } from "@/app/lib/api/trips";
import SearchFiltersBar, { filtersFromParams, activeFilterCount } from "@/app/components/SearchFiltersBar";
import TripPreferences from "@/app/components/TripPreferences";
import SearchAlertCta from "@/app/components/SearchAlertCta";

export default function SearchPage() {
  const { t, loading: translationsLoading } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const lang = (params?.lang as string) || "fi";
  const from = searchParams.get("from") || "";
  const to = searchParams.get("to") || "";
  const queryKey = searchParams.toString();
  const filters = filtersFromParams(new URLSearchParams(queryKey));
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
      router.push(localePath(lang));
      return;
    }
    async function fetchTrips() {
      try {
        setLoading(true);
        setError("");
        const response: SearchResponse = await searchTrips(from, to, filtersFromParams(new URLSearchParams(queryKey)));
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
        setError(err instanceof Error ? err.message : "Error searching trips");
      } finally {
        setLoading(false);
      }
    }
    fetchTrips();
  }, [queryKey, lang, router, user]);

  if (translationsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="spinner"></div>
      </div>
    );
  }

  const handleBookTrip = async (trip: Trip) => {
    if (!user) {
      router.push(`${langPrefix(lang)}/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`);
      return;
    }
    if (user.id === trip.driver.id) {
      toast.error(t("page.search.cannotBookOwnTrip") || "You cannot book your own trip.");
      return;
    }
    setSelectedTripForBooking(trip);
    setBookTripModalOpen(true);
  };

  const applyFilters = (next: SearchFilters) => {
    const p = new URLSearchParams();
    if (from) p.set("from", from);
    if (to) p.set("to", to);
    for (const key of FILTER_KEYS) {
      const v = next[key];
      if (v !== undefined && v !== "" && v !== false && v !== 0 && !(key === "sort" && v === "departure_time")) p.set(key, String(v));
    }
    router.replace(`${langPrefix(lang)}/search?${p.toString()}`, { scroll: false });
  };

  const handleConfirmBooking = async (tripId: number, seatsNumber: number) => {
    setBookingLoading(tripId);
    const bookedTrip = trips.find((tr) => tr.id === tripId);
    try {
      const booking = await createBooking({
        trip_id: tripId,
        seats: seatsNumber,
        pickup_location: bookedTrip?.segment?.from,
        dropoff_location: bookedTrip?.segment?.to,
      });
      toast.success(
        booking.status === "confirmed"
          ? t("booking.confirmedNow", "Your seat is confirmed!")
          : t("page.search.bookingSuccess") || "Booking completed successfully"
      );
      const response = await searchTrips(from, to, filters);
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
      toast.error(error?.message || t("page.search.bookingError") || "Error making booking");
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
    router.push(`${langPrefix(lang)}/search?${p.toString()}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--page-bg)] flex flex-col items-center justify-center gap-4">
        <div className="spinner"></div>
        <p className="text-[var(--brand-neutral)] font-semibold text-lg">{t("page.search.searching") || "Searching trips"}...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[var(--page-bg)] flex flex-col items-center justify-center gap-6 px-4">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <p className="text-red-700 text-lg font-semibold text-center">{error}</p>
        <button
          onClick={() => router.push(localePath(lang))}
          className="bg-[var(--brand-blue)] hover:bg-[var(--brand-blue)] text-white px-8 py-3 rounded-xl font-bold text-base transition-colors"
        >
          {t("page.search.back") || "Back"}
        </button>
      </div>
    );
  }

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";

  return (
    <div className="min-h-screen bg-[var(--page-bg)]">
      {/* ── HERO / SEARCH BAR ── */}
      <section className="bg-[#ebf3e2] border-b-2 border-[#c4d8b4] py-8 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-6">
            <h1 className="text-2xl md:text-2xl font-bold text-[var(--brand-dark)] mb-2">
              {from} <span className="text-[var(--brand-neutral)] mx-2">→</span> {to}
            </h1>
            <p className="text-sm md:text-base text-[var(--brand-neutral)] font-medium">
              {t("page.search.results") || "Search results from"}
            </p>
          </div>

          <form onSubmit={handleSearch} className="bg-white p-4 rounded-[1.5rem] shadow-xl border-2 border-[#c4d8b4] flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--brand-neutral)] group-focus-within:text-[var(--brand-blue)] transition-colors z-10">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
              </div>
              <LocationInput
                value={searchFrom}
                onChange={(val: string) => setSearchFrom(val)}
                placeholder={t("page.home.from") || "From"}
                className="form-input pl-12 border-transparent bg-[#ebf3e2]/30 focus:bg-white"
              />
            </div>
            <div className="flex-1 relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--brand-neutral)] group-focus-within:text-[var(--brand-blue)] transition-colors z-10">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
              </div>
              <LocationInput
                value={searchTo}
                onChange={(val: string) => setSearchTo(val)}
                placeholder={t("page.home.to") || "To"}
                className="form-input pl-12 border-transparent bg-[#ebf3e2]/30 focus:bg-white"
              />
            </div>
            <button
              type="submit"
              className="btn-primary px-7 py-4 shadow-lg lg:w-auto w-full"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {t("page.home.search") || "Search trip"}
            </button>
          </form>
        </div>
      </section>

      {/* ── CONTENIDO ── */}
      <section className="py-12 px-4 min-h-[60vh]">
        <div className="max-w-5xl mx-auto">
          {/* Aviso de transporte público */}
          {source === "digitransit" && (
            <div className="mb-8 p-8 bg-[#ebf3e2] border-2 border-[#c4d8b4] rounded-[1.5rem] flex items-center gap-6 animate-in fade-in slide-in-from-top-4">
              <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center flex-shrink-0 shadow-sm border border-[#c4d8b4]">
                <svg className="w-7 h-7 text-[var(--brand-blue)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-[var(--brand-dark)] font-black text-lg">
                  {lang === "fi" ? "Ei kimppakyytejä löytynyt" : "No carpools found"}
                </p>
                <p className="text-[var(--brand-neutral)] text-lg font-medium opacity-80">
                  {lang === "fi" ? "Näytetään julkisen liikenteen vaihtoehdot" : "Showing public transport alternatives"}
                </p>
              </div>
            </div>
          )}

          <SearchFiltersBar value={filters} onChange={applyFilters} />

          {from && to && <SearchAlertCta from={from} to={to} date={filters.date} hasResults={trips.length > 0} />}

          {/* Sin resultados */}
          {trips.length === 0 && externalOptions.length === 0 ? (
            <div className="text-center py-12 bg-[#ebf3e2]/30 rounded-[1.75rem] border-2 border-dashed border-[#c4d8b4]">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-sm border-2 border-[#c4d8b4] text-[var(--brand-neutral)]">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 9.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-[var(--brand-dark)] mb-4">{t("page.search.noResults") || "No trips found"}</h2>
              <p className="text-[var(--brand-neutral)] text-lg mb-8 max-w-md mx-auto font-medium">
                {activeFilterCount(filters) > 0
                  ? t("filters.noResultsFiltered", "No trips match these filters. Try removing some of them.")
                  : t("page.search.noResultsHint", "Try changing the cities or search again later.")}
              </p>
              <button onClick={() => router.push(localePath(lang))} className="btn-secondary px-8 py-4">
                {t("page.search.back") || "Back"}
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Viajes locales */}
              {trips.map((trip) => {
                const driverPictureUrl = trip.driver?.picture_url
                  ? trip.driver.picture_url.startsWith("http")
                    ? trip.driver.picture_url
                    : `${API_BASE}${trip.driver.picture_url}`
                  : null;

                const bookingStatus = userBookings.get(trip.id);
                const segmentTime = trip.segment?.departure_time ?? trip.departure_time;
                const shownPrice = Number(trip.segment?.price ?? trip.price);

                return (
                  <div key={trip.id} className="result-card group">
                    <div className="absolute top-0 left-0 w-2 h-full bg-green-500 group-hover:bg-[var(--brand-blue)] transition-colors"></div>
                    
                    <div className="flex flex-col xl:flex-row gap-10">
                      {/* Lado Izquierdo: Conductor */}
                      <div className="flex-shrink-0 flex flex-col items-center">
                        <div className="relative p-1 bg-[#ebf3e2] rounded-full border-2 border-[#c4d8b4] group-hover:border-[#c4d8b4] transition-colors">
                          <div className="w-24 h-24 rounded-full overflow-hidden shadow-inner bg-[#c4d8b4] flex items-center justify-center">
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
                              <span className="text-2xl font-black text-[var(--brand-neutral)]">
                                {trip.driver.name.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-9 h-9 bg-white rounded-full border-2 border-[#c4d8b4] flex items-center justify-center shadow-lg">
                            <svg className="w-5 h-5 text-yellow-500 fill-current" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          </div>
                        </div>
                        <Link href={`${langPrefix(lang)}/users/${trip.driver.id}`} className="mt-4 font-black text-[var(--brand-dark)] text-lg hover:text-[var(--brand-blue)] hover:underline">
                          {trip.driver.name}
                        </Link>
                        {!!trip.driver.total_reviews && (
                          <p className="text-sm font-semibold text-[var(--brand-neutral)]">
                            ★ {Number(trip.driver.average_rating).toFixed(1)} · {trip.driver.total_reviews}
                          </p>
                        )}
                        <button
                          onClick={() => handleOpenReviews(trip.driver.id, trip.driver.name)}
                          className="text-[var(--brand-blue)] hover:text-[var(--brand-dark)] text-sm font-bold uppercase tracking-widest mt-2 transition-colors cursor-pointer"
                        >
                          {t("page.search.seeReviews") || "See reviews"}
                        </button>
                      </div>

                      {/* Lado Central: Info Viaje */}
                      <div className="flex-1 space-y-8">
                        <div className="flex flex-wrap items-center gap-4">
                          <div className="flex items-center gap-2 text-[var(--brand-blue)] font-bold bg-[#ebf3e2] px-5 py-2 rounded-full border border-[#c4d8b4] shadow-sm">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="uppercase tracking-wider">
                              {new Date(segmentTime).toLocaleDateString(lang, { day: 'numeric', month: 'long' })}
                            </span>
                            <span className="text-[var(--brand-neutral)] mx-1">|</span>
                            <span className="text-[var(--brand-dark)]">
                              {new Date(segmentTime).toLocaleTimeString(lang, { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          {trip.available_seats <= 2 && trip.available_seats > 0 && (
                            <span className="bg-red-50 text-red-600 border border-red-100 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest animate-pulse">
                              {t("page.search.lastSeats", "Last seats")}
                            </span>
                          )}
                        </div>

                        <div>
                          <Link href={`${langPrefix(lang)}/trips/${trip.id}${trip.segment ? `?${new URLSearchParams({ from: trip.segment.from, to: trip.segment.to })}` : ""}`} className="block hover:text-[var(--brand-blue)]">
                            <h3 className="text-2xl font-black text-[var(--brand-dark)] leading-tight tracking-tight hover:underline">
                              {trip.segment?.from ?? trip.departure_location} <span className="text-[var(--brand-neutral)] mx-2">→</span> {trip.segment?.to ?? trip.arrival_location}
                            </h3>
                          </Link>
                          {(trip.segment || (trip.stops && trip.stops.length > 0)) && (
                            <p className="mt-1 text-sm text-[var(--brand-neutral)]">
                              {t("stops.fullRoute", "Full route")}: {[trip.departure_location, ...(trip.stops || []).map((st) => st.location), trip.arrival_location].join(" → ")}
                            </p>
                          )}
                          <VehicleSummary vehicle={trip.vehicle} className="mt-3" />
                          <div className="mt-3">
                            <TripPreferences trip={trip} compact />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                           <div className="bg-[#ebf3e2]/50 border border-[#c4d8b4] rounded-2xl p-4">
                            <p className="text-xs font-bold text-[var(--brand-neutral)] uppercase tracking-widest mb-1">{t("page.search.availableSeats") || "Available seats"}</p>
                            <p className={`text-lg font-black ${trip.available_seats === 0 ? "text-red-500" : "text-[var(--brand-dark)]"}`}>
                              {trip.available_seats} <span className="text-sm font-bold text-[var(--brand-neutral)]/60 lowercase">{t("page.search.available", "available")}</span>
                            </p>
                          </div>
                          <div className="bg-[#ebf3e2]/50 border border-[#c4d8b4] rounded-2xl p-4">
                            <p className="text-xs font-bold text-[var(--brand-neutral)] uppercase tracking-widest mb-1">{t("page.search.price") || "Price"}</p>
                            <p className="text-2xl font-black text-[var(--brand-dark)]">€{shownPrice.toFixed(2)}</p>
                          </div>
                        </div>
                      </div>

                      {/* Lado Derecho: Acciones */}
                      <div className="flex flex-col justify-center items-stretch min-w-[240px] gap-4">
                        <button
                          onClick={() => handleBookTrip(trip)}
                          disabled={bookingLoading === trip.id || trip.available_seats === 0 || !!bookingStatus}
                          className={`w-full py-4 rounded-[1.5rem] font-bold text-lg shadow-xl transform transition-all active:scale-95 ${
                            bookingStatus === "confirmed"
                              ? "bg-[#c4d8b4] text-[var(--brand-neutral)] border-2 border-green-400 cursor-default"
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
                            ? `${t("booking.requested", "Requested")} ✓`
                            : bookingStatus === "confirmed"
                            ? `${t("booking.booked", "Booked")} ✓`
                            : trip.available_seats === 0
                            ? t("booking.full", "Full")
                            : trip.instant_booking
                            ? `⚡ ${t("booking.bookNow", "Book now")}`
                            : t("page.search.book") || "Book"}
                        </button>
                        
                        {bookingStatus && (
                          <Link 
                            href={`${langPrefix(lang)}/my-bookings`} 
                            className="text-center text-sm font-bold text-[var(--brand-blue)] hover:text-[var(--brand-dark)] transition-colors uppercase tracking-widest underline decoration-2 underline-offset-4"
                          >
                            {t("page.search.viewMyBookings", "View my bookings")}
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
                  <h2 className="text-2xl font-bold text-[var(--brand-dark)] mb-8 flex items-center gap-3">
                    <svg className="w-8 h-8 text-[var(--brand-blue)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                    {t("page.search.externalOptions") || "Other transport options"}
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
