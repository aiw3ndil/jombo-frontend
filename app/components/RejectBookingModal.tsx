"use client";
import React from "react";

interface RejectBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
  t: (key: string, defaultValue?: string) => string;
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
    <div className="fixed inset-0 bg-green-900/40 backdrop-blur-sm flex justify-center items-center p-4 z-[1000]">
      <div className="bg-white rounded-[2.5rem] shadow-2xl p-8 md:p-12 w-full max-w-lg border-2 border-red-50 text-center relative overflow-hidden">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-8 border-2 border-red-100">
          <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>

        <h3 className="text-3xl font-bold text-red-700 mb-6 font-serif italic">
          {t("rejectBookingModalTitle") || "¿Rechazar Reserva?"}
        </h3>
        
        <div className="bg-red-50 p-6 rounded-2xl mb-10 border border-red-100">
          <p className="text-red-900 font-bold text-lg leading-relaxed">
            {t("rejectBookingModalMessage")
              .replace("{{userName}}", bookingDetails.userName)
              .replace("{{seats}}", String(bookingDetails.seats)) ||
              `¿Estás seguro de rechazar la reserva de ${bookingDetails.userName} por ${bookingDetails.seats} plaza(s)?`}
          </p>
          <p className="text-red-600/70 text-sm mt-4 font-medium italic">
            Esta acción liberará las plazas para otros viajeros.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-8 py-4 rounded-xl bg-gray-100 text-gray-500 font-bold hover:bg-gray-200 transition-all uppercase tracking-widest text-sm"
          >
            {t("cancel") || "VOLVER"}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-[1.5] px-8 py-4 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition-all shadow-lg uppercase tracking-widest text-sm"
          >
            {loading ? (t("rejecting") || "CARGANDO...") : (t("reject") || "SÍ, RECHAZAR")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RejectBookingModal;
