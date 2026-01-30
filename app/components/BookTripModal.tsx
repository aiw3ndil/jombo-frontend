"use client";
import React, { useState, useEffect } from "react";

interface BookTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (tripId: number, seats: number) => void;
  trip: {
    id: number;
    available_seats: number;
    departure_location: string;
    arrival_location: string;
  } | null;
  loading: boolean; // For booking confirmation loading state
  t: (key: string, defaultValue?: string) => string; // Translation function
}

const BookTripModal: React.FC<BookTripModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  trip,
  loading,
  t,
}) => {
  const [selectedSeats, setSelectedSeats] = useState(1);

  useEffect(() => {
    if (isOpen && trip) {
      // Reset to 1 seat when modal opens
      setSelectedSeats(1);
    }
  }, [isOpen, trip]);

  if (!isOpen || !trip) return null;

  const maxSelectableSeats = Math.min(trip.available_seats, 10); // Cap at 10 seats for practical dropdown size
  const seatOptions = Array.from({ length: maxSelectableSeats }, (_, i) => i + 1);

  const handleConfirmClick = () => {
    onConfirm(trip.id, selectedSeats);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          {t("page.search.bookTripModalTitle") || "Reservar Viaje"}
        </h3>
        <p className="text-gray-700 mb-4">
          {t("page.search.bookTripModalMessage").replace("{{from}}", trip.departure_location).replace("{{to}}", trip.arrival_location) || `¿Cuántos asientos quieres reservar para el viaje de ${trip.departure_location} a ${trip.arrival_location}?`}
        </p>

        <div className="mb-6">
          <label htmlFor="seats-select" className="block text-sm font-medium text-gray-700 mb-2">
            {t("page.search.selectSeats") || "Seleccionar número de asientos:"}
          </label>
          <select
            id="seats-select"
            value={selectedSeats}
            onChange={(e) => setSelectedSeats(parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            disabled={loading}
          >
            {seatOptions.map((num) => (
              <option key={num} value={num}>
                {num} {num === 1 ? t("page.search.seat") : t("page.search.seats")}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t("page.search.cancel") || "Cancelar"}
          </button>
          <button
            onClick={handleConfirmClick}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (t("page.search.booking") || "Reservando...") : (t("page.search.book") || "Reservar")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookTripModal;
