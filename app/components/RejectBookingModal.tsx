"use client";
import React from "react";

interface RejectBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void; // No seats needed for rejection
  loading: boolean; // For rejection confirmation loading state
  t: (key: string, defaultValue?: string) => string; // Translation function
  bookingDetails: {
    userName: string;
    seats: number;
  } | null;
}

const RejectBookingModal: React.FC<RejectBookingModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  loading,
  t,
  bookingDetails,
}) => {
  if (!isOpen || !bookingDetails) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          {t("rejectBookingModalTitle") || "Rechazar Reserva"}
        </h3>
        <p className="text-gray-700 mb-4">
          {t("rejectBookingModalMessage")
            .replace("{{userName}}", bookingDetails.userName)
            .replace("{{seats}}", String(bookingDetails.seats)) ||
            `¿Estás seguro de rechazar la reserva de ${bookingDetails.userName} para ${bookingDetails.seats} asiento(s)?`}
        </p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t("cancel") || "Cancelar"}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (t("rejecting") || "Rechazando...") : (t("reject") || "Rechazar")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RejectBookingModal;
