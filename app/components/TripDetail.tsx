"use client";
import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTranslation } from "@/app/hooks/useTranslation";
import { useAuth } from "@/app/contexts/AuthContext";
import { createBooking } from "@/app/lib/api/bookings";
import { langPrefix } from "@/app/lib/i18n/config";
import type { Trip } from "@/app/lib/api/trips";
import BookTripModal from "@/app/components/BookTripModal";
import RouteTimeline from "@/app/components/RouteTimeline";
import TripPreferences from "@/app/components/TripPreferences";
import { VehicleSummary } from "@/app/components/VehicleSelector";
import Avatar from "@/app/components/Avatar";
import VerifiedBadges, { ExperienceBadge } from "@/app/components/VerifiedBadges";

/** Página pública de un viaje */
export default function TripDetail({ trip, from, to }: { trip: Trip; from?: string; to?: string }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const router = useRouter();
  const lang = (useParams()?.lang as string) || "fi";
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [seatsLeft, setSeatsLeft] = useState(trip.available_seats);
  const [booked, setBooked] = useState<string | null>(null);

  const isPast = new Date(trip.segment?.departure_time ?? trip.departure_time) < new Date();
  const isOwn = user?.id === trip.driver.id;
  const price = Number(trip.segment?.price ?? trip.price);
  const departure = new Date(trip.segment?.departure_time ?? trip.departure_time);

  const openBooking = () => {
    if (!user) {
      router.push(`${langPrefix(lang)}/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`);
      return;
    }
    setModalOpen(true);
  };

  const confirm = async (tripId: number, seats: number) => {
    setLoading(true);
    try {
      const booking = await createBooking({ trip_id: tripId, seats, pickup_location: trip.segment?.from, dropoff_location: trip.segment?.to });
      setBooked(booking.status);
      if (booking.status === "confirmed") setSeatsLeft((s) => s - seats);
      toast.success(booking.status === "confirmed" ? t("booking.confirmedNow", "Your seat is confirmed!") : t("page.search.bookingSuccess", "Booking request sent"));
      setModalOpen(false);
    } catch (e: any) {
      toast.error(e?.message || t("page.search.bookingError", "Error making booking"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--page-bg)]">
      <section className="border-b-2 border-[#c4d8b4] bg-[#ebf3e2] px-4 py-8">
        <div className="mx-auto max-w-5xl">
          <p className="mb-1 text-sm font-bold uppercase tracking-wide text-[var(--brand-blue)]">
            {departure.toLocaleDateString(lang, { weekday: "long", day: "numeric", month: "long" })}
          </p>
          <h1 className="text-2xl font-bold text-[var(--brand-dark)] md:text-3xl">
            {trip.segment?.from ?? trip.departure_location} → {trip.segment?.to ?? trip.arrival_location}
          </h1>
          {(from || to) && trip.segment && (
            <p className="mt-1 text-sm text-[var(--brand-neutral)]">
              {t("stops.partOf", "Part of the ride")} {trip.departure_location} → {trip.arrival_location}
            </p>
          )}
        </div>
      </section>

      <section className="px-4 py-8">
        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-[1fr_20rem]">
          <div className="space-y-6">
            <div className="rounded-2xl border-2 border-[#c4d8b4] bg-white p-5">
              <h2 className="mb-4 font-bold text-[var(--brand-dark)]">{t("trip.route", "Route")}</h2>
              <RouteTimeline trip={trip} />
              {trip.distance_km ? (
                <p className="mt-4 text-sm text-[var(--brand-neutral)]">
                  🛣️ {trip.distance_km} km
                  {trip.duration_minutes ? ` · ⏱️ ${Math.floor(trip.duration_minutes / 60)} h ${trip.duration_minutes % 60} min` : ""}
                </p>
              ) : null}
            </div>

            <div className="rounded-2xl border-2 border-[#c4d8b4] bg-white p-5">
              <h2 className="mb-3 font-bold text-[var(--brand-dark)]">{t("prefs.title", "Preferences")}</h2>
              <TripPreferences trip={trip} />
              {trip.vehicle && (
                <>
                  <h2 className="mb-2 mt-5 font-bold text-[var(--brand-dark)]">{t("vehicle.step", "Vehicle")}</h2>
                  <VehicleSummary vehicle={trip.vehicle} />
                </>
              )}
              {trip.description && (
                <>
                  <h2 className="mb-2 mt-5 font-bold text-[var(--brand-dark)]">{t("trip.driverNotes", "Driver's notes")}</h2>
                  <p className="whitespace-pre-line text-[var(--brand-neutral)]">{trip.description}</p>
                </>
              )}
            </div>

            <Link href={`${langPrefix(lang)}/users/${trip.driver.id}`} className="flex items-center gap-4 rounded-2xl border-2 border-[#c4d8b4] bg-white p-5 hover:border-[var(--brand-blue)]">
              <Avatar name={trip.driver.name} url={trip.driver.picture_url} size={56} />
              <div className="flex-1">
                <p className="font-bold text-[var(--brand-dark)]">{trip.driver.name}</p>
                <p className="text-sm text-[var(--brand-neutral)]">
                  {trip.driver.total_reviews ? `★ ${Number(trip.driver.average_rating).toFixed(1)} · ${trip.driver.total_reviews} ${t("profile.reviews", "reviews")}` : t("profile.noReviews", "No reviews yet")}
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <ExperienceBadge level={trip.driver.experience_level} />
                  <VerifiedBadges verifications={trip.driver.verifications} />
                </div>
              </div>
              <span className="text-[var(--brand-blue)]" aria-hidden="true">→</span>
            </Link>
          </div>

          <aside className="h-fit rounded-2xl border-2 border-[#c4d8b4] bg-white p-5 md:sticky md:top-24">
            <p className="text-sm font-semibold text-[var(--brand-neutral)]">{t("page.search.price", "Price")}</p>
            <p className="text-3xl font-black text-[var(--brand-dark)]">{price.toFixed(2)} €</p>
            <p className="mb-4 text-sm text-[var(--brand-neutral)]">
              {seatsLeft} {seatsLeft === 1 ? t("page.search.seat", "seat") : t("page.search.seats", "seats")} {t("page.search.available", "available")}
            </p>
            <TripPreferences trip={{ instant_booking: trip.instant_booking }} compact />
            <button
              type="button"
              onClick={openBooking}
              disabled={isPast || isOwn || seatsLeft === 0 || !!booked}
              className="btn-primary mt-4 w-full py-3"
            >
              {booked === "confirmed"
                ? `${t("booking.booked", "Booked")} ✓`
                : booked
                ? `${t("booking.requested", "Requested")} ✓`
                : isOwn
                ? t("trip.yourTrip", "This is your trip")
                : isPast
                ? t("trip.departed", "Already departed")
                : seatsLeft === 0
                ? t("booking.full", "Full")
                : trip.instant_booking
                ? `⚡ ${t("booking.bookNow", "Book now")}`
                : t("booking.sendRequest", "Send request")}
            </button>
            {booked && (
              <Link href={`${langPrefix(lang)}/my-bookings`} className="mt-3 block text-center text-sm font-bold text-[var(--brand-blue)] underline">
                {t("page.search.viewMyBookings", "View my bookings")}
              </Link>
            )}
          </aside>
        </div>
      </section>

      {modalOpen && (
        <BookTripModal isOpen onClose={() => setModalOpen(false)} onConfirm={confirm} trip={{ ...trip, available_seats: seatsLeft }} loading={loading} t={t} />
      )}
    </div>
  );
}
