"use client";
import React, { useState } from "react";
import { toast } from "sonner";
import type { Trip } from "@/app/lib/api/trips";
import { useAuth } from "@/app/contexts/AuthContext";
import { sendEmailVerification } from "@/app/lib/api/users";

interface BookTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (tripId: number, seats: number) => void;
  trip: Pick<Trip, "id" | "available_seats" | "departure_location" | "arrival_location" | "price" | "segment" | "instant_booking"> | null;
  loading: boolean;
  t: (key: string, defaultValue?: string) => string;
}

const BookTripModal: React.FC<BookTripModalProps> = ({ isOpen, onClose, onConfirm, trip, loading, t }) => {
  const [selectedSeats, setSelectedSeats] = useState(1);
  const [sending, setSending] = useState(false);
  const { user } = useAuth();

  if (!isOpen || !trip) return null;

  // Para reservar hace falta el email verificado
  const needsEmail = !!user && !user.verifications?.email;
  const resendLink = async () => {
    setSending(true);
    try {
      await sendEmailVerification();
      toast.success(t("verify.emailSent", "Check your inbox for the confirmation link."));
    } catch (e: any) {
      toast.error(e?.message || t("verify.error", "Something went wrong"));
    } finally {
      setSending(false);
    }
  };

  if (needsEmail) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1f3a2a]/50 p-4" role="dialog" aria-modal="true">
        <div className="w-full max-w-md rounded-2xl border-2 border-[#c4d8b4] bg-white p-6 shadow-2xl">
          <h3 className="mb-2 text-xl font-bold text-[var(--brand-dark)]">✉️ {t("gate.email.title", "Verify your email to book")}</h3>
          <p className="mb-6 text-[var(--brand-neutral)]">
            {t("gate.email.text", "To keep Jombo safe, passengers confirm their email address before booking. We'll send you a link — open it and come back to book.")}
          </p>
          <div className="flex justify-end gap-3">
            <button onClick={onClose} className="btn-secondary px-5 py-2.5">
              {t("page.search.cancel") || "Cancel"}
            </button>
            <button onClick={resendLink} disabled={sending} className="btn-primary px-5 py-2.5">
              {t("verify.sendLink", "Send link")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const from = trip.segment?.from ?? trip.departure_location;
  const to = trip.segment?.to ?? trip.arrival_location;
  const pricePerSeat = Number(trip.segment?.price ?? trip.price);
  const seatOptions = Array.from({ length: Math.min(trip.available_seats, 8) }, (_, i) => i + 1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1f3a2a]/50 p-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-md rounded-2xl border-2 border-[#c4d8b4] bg-white p-6 shadow-2xl">
        <h3 className="mb-1 text-xl font-bold text-[var(--brand-dark)]">{t("page.search.bookTripModalTitle") || "Book trip"}</h3>
        <p className="mb-4 font-semibold text-[var(--brand-neutral)]">
          {from} → {to}
        </p>

        <div
          className={`mb-4 rounded-xl border-2 px-4 py-3 text-sm ${
            trip.instant_booking ? "border-[#9cc58a] bg-[#e4f1da] text-[var(--brand-dark)]" : "border-yellow-300 bg-yellow-50 text-yellow-800"
          }`}
        >
          {trip.instant_booking
            ? `⚡ ${t("booking.instantInfo", "Instant booking: your seat is confirmed right away.")}`
            : `⏳ ${t("booking.requestInfo", "The driver will review your request and confirm it.")}`}
        </div>

        <label htmlFor="seats-select" className="form-label">
          {t("page.search.selectSeats") || "Select number of seats:"}
        </label>
        <select
          id="seats-select"
          value={selectedSeats}
          onChange={(e) => setSelectedSeats(parseInt(e.target.value))}
          className="form-select mb-4"
          disabled={loading}
        >
          {seatOptions.map((num) => (
            <option key={num} value={num}>
              {num} {num === 1 ? t("page.search.seat", "seat") : t("page.search.seats", "seats")}
            </option>
          ))}
        </select>

        <div className="mb-6 flex items-center justify-between rounded-xl bg-[#ebf3e2] px-4 py-3">
          <span className="font-semibold text-[var(--brand-neutral)]">{t("booking.total", "Total to share with the driver")}</span>
          <span className="text-xl font-black text-[var(--brand-dark)]">{(pricePerSeat * selectedSeats).toFixed(2)} €</span>
        </div>

        <div className="flex justify-end gap-3">
          <button onClick={onClose} disabled={loading} className="btn-secondary px-5 py-2.5">
            {t("page.search.cancel") || "Cancel"}
          </button>
          <button onClick={() => onConfirm(trip.id, selectedSeats)} disabled={loading} className="btn-primary px-5 py-2.5">
            {loading
              ? t("page.search.booking") || "Booking..."
              : trip.instant_booking
              ? t("booking.bookNow", "Book now")
              : t("booking.sendRequest", "Send request")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookTripModal;
