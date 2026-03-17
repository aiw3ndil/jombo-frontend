"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { getBookings, cancelBooking, Booking } from "@/app/lib/api/bookings";
import { getBookingReviews } from "@/app/lib/api/reviews";
import { useTranslation } from "@/app/hooks/useTranslation";
import { useAuth } from "@/app/contexts/AuthContext";
import ReviewModal from "@/app/components/ReviewModal";
import { toast } from "sonner";

export default function MyBookings() {
  const { t, loading: translationsLoading } = useTranslation();
  const router = useRouter();
  const params = useParams();
  const lang = (params?.lang as string) || "es";
  const { user, loading: authLoading } = useAuth();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [bookingReviews, setBookingReviews] = useState<{ [key: number]: boolean }>({});

  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/${lang}/login?redirect=/${lang}/my-bookings`);
      return;
    }

    if (user) {
      loadBookings();
    }
  }, [user, authLoading, router, lang]);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const data = await getBookings();
      setBookings(data);

      const reviewsStatus: { [key: number]: boolean } = {};
      await Promise.all(
        data.map(async (booking) => {
          if (booking.status === "confirmed" && booking.trip?.departure_time) {
            try {
              const reviews = await getBookingReviews(booking.id);
              reviewsStatus[booking.id] = reviews.some(
                (review) => review.reviewer_id === user?.id
              );
            } catch (error) {
              reviewsStatus[booking.id] = false;
            }
          }
        })
      );
      setBookingReviews(reviewsStatus);
    } catch (error) {
      console.error("Error loading bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId: number) => {
    if (!confirm(t("page.myBookings.confirmCancel") || "¿Estás seguro de cancelar esta reserva?")) {
      return;
    }

    setCancellingId(bookingId);
    try {
      await cancelBooking(bookingId);
      toast.success(t("page.myBookings.cancelSuccess") || "Reserva cancelada exitosamente");
      await loadBookings();
    } catch (error: any) {
      toast.error(error?.message || t("page.myBookings.cancelError") || "Error al cancelar la reserva");
    } finally {
      setCancellingId(null);
    }
  };

  const handleOpenReview = (booking: Booking) => {
    setSelectedBooking(booking);
    setReviewModalOpen(true);
  };

  const handleCloseReview = () => {
    setReviewModalOpen(false);
    setSelectedBooking(null);
  };

  const handleReviewSuccess = () => {
    handleCloseReview();
    loadBookings();
  };

  const canReview = (booking: Booking): boolean => {
    if (booking.status !== "confirmed") return false;
    if (!booking.trip?.departure_time) return false;
    const departureTime = new Date(booking.trip.departure_time);
    const now = new Date();
    if (departureTime > now) return false;
    if (bookingReviews[booking.id]) return false;
    return true;
  };

  if (translationsLoading || authLoading || (loading && bookings.length === 0)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!user) return null;

  const getStatusClasses = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-700 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "rejected":
      case "cancelled":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "confirmed":
        return t("page.myBookings.statusConfirmed") || "CONFIRMADA";
      case "pending":
        return t("page.myBookings.statusPending") || "PENDIENTE";
      case "rejected":
        return t("page.myBookings.statusRejected") || "RECHAZADA";
      case "cancelled":
        return t("page.myBookings.statusCancelled") || "CANCELADA";
      default:
        return status.toUpperCase();
    }
  };

  return (
    <div className="min-h-screen bg-white py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Cabecera */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-12">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-green-900 mb-2">
              {t("page.myBookings.title") || "Mis Reservas"}
            </h1>
            <p className="text-green-700 text-lg">
              {t("page.myBookings.subtitle") || "Gestiona tus solicitudes de viaje"}
            </p>
          </div>
          <button
            onClick={() => router.push(`/${lang}`)}
            className="bg-green-50 text-green-700 border-2 border-green-200 px-8 py-3 rounded-xl font-bold hover:bg-green-100 transition-all shadow-sm"
          >
            {t("page.myBookings.back") || "Volver"}
          </button>
        </div>

        {bookings.length === 0 ? (
          <div className="text-center py-24 bg-green-50 rounded-[3rem] border-2 border-green-100">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8 border-2 border-green-200 text-green-600">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-2xl text-green-900 font-bold mb-10">
              {t("page.myBookings.noBookings") || "No tienes reservas registradas"}
            </p>
            <button
              onClick={() => router.push(`/${lang}`)}
              className="btn-primary px-10 py-5 text-base"
            >
              {t("page.myBookings.searchTrips") || "Buscar viajes"}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => (
              <div key={booking.id} className="result-card">
                <div className="flex flex-col xl:flex-row justify-between gap-8">
                  <div className="flex-1 space-y-6">
                    <div className="flex flex-wrap items-center gap-4">
                      <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border-2 ${getStatusClasses(booking.status)}`}>
                        {getStatusText(booking.status)}
                      </span>
                      <span className="text-green-600 font-bold text-sm uppercase tracking-wider">{new Date(booking.created_at).toLocaleDateString(lang, { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>

                    <div className="space-y-4">
                      <h2 className="text-3xl font-bold text-green-900 leading-tight">
                        {booking.trip?.departure_location} → {booking.trip?.arrival_location}
                      </h2>
                      <div className="flex items-center gap-3 bg-green-50 p-3 rounded-xl border border-green-100 w-fit">
                        <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white font-bold overflow-hidden shadow-sm">
                          {booking.trip?.driver?.picture_url ? (
                            <img src={booking.trip.driver.picture_url} className="w-full h-full object-cover" alt="" />
                          ) : (
                            booking.trip?.driver?.name?.charAt(0)
                          )}
                        </div>
                        <p className="font-bold text-green-800">
                          {t("page.myBookings.driver") || "Conductor"}: <span className="text-green-600">{booking.trip?.driver?.name}</span>
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="bg-white border-2 border-green-100 rounded-2xl p-4">
                        <p className="text-xs font-bold text-green-400 uppercase tracking-widest mb-1">{t("page.myBookings.departure") || "HORARIO"}</p>
                        <p className="font-bold text-green-900">
                          {booking.trip?.departure_time ? (
                            <>
                              {new Date(booking.trip.departure_time).toLocaleDateString(lang)} · {new Date(booking.trip.departure_time).toLocaleTimeString(lang, { hour: '2-digit', minute: '2-digit' })}h
                            </>
                          ) : "-"}
                        </p>
                      </div>
                      <div className="bg-white border-2 border-green-100 rounded-2xl p-4">
                        <p className="text-xs font-bold text-green-400 uppercase tracking-widest mb-1">{t("page.myBookings.seats") || "ASIENTOS"}</p>
                        <p className="font-bold text-green-900">{booking.seats} {t("common.seats") || "plazas"}</p>
                      </div>
                      <div className="bg-white border-2 border-green-100 rounded-2xl p-4">
                        <p className="text-xs font-bold text-green-400 uppercase tracking-widest mb-1">{t("page.myBookings.totalPrice") || "TOTAL"}</p>
                        <p className="font-bold text-green-700 text-lg">
                          €{booking.trip?.price ? (Number(booking.trip.price) * booking.seats).toFixed(2) : "0.00"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row xl:flex-col gap-3 min-w-[200px] justify-center">
                    {booking.status !== "cancelled" && booking.status !== "rejected" && (
                      <>
                        {canReview(booking) && (
                          <button
                            onClick={() => handleOpenReview(booking)}
                            className="bg-yellow-400 hover:bg-yellow-500 text-yellow-900 px-8 py-4 rounded-xl font-bold transition-all shadow-md"
                          >
                            ⭐ {t("page.myBookings.review") || "Calificar viaje"}
                          </button>
                        )}
                        {bookingReviews[booking.id] && (
                          <div className="flex items-center justify-center gap-2 text-green-700 bg-green-50 border-2 border-green-200 px-8 py-4 rounded-xl text-sm font-bold">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            {t("page.myBookings.reviewed") || "CALIFICADO"}
                          </div>
                        )}

                        <button
                          onClick={() => handleCancelBooking(booking.id)}
                          disabled={cancellingId === booking.id}
                          className="bg-white border-2 border-red-100 text-red-600 px-8 py-4 rounded-xl font-bold hover:bg-red-50 transition-all"
                        >
                          {cancellingId === booking.id ? "Cancelando..." : (t("page.myBookings.cancel") || "Cancelar reserva")}
                        </button>
                      </>
                    )}
                    {(booking.status === "cancelled" || booking.status === "rejected") && (
                      <div className="px-8 py-4 text-center grayscale opacity-50 bg-gray-50 rounded-xl border-2 border-gray-100">
                        <span className="text-sm font-bold text-gray-400 uppercase tracking-widest italic">{t("page.myBookings.inactive") || "Finalizada"}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {reviewModalOpen && selectedBooking && (
        <ReviewModal
          bookingId={selectedBooking.id}
          driverName={selectedBooking.trip?.driver?.name || ""}
          tripRoute={`${selectedBooking.trip?.departure_location} → ${selectedBooking.trip?.arrival_location}`}
          onClose={handleCloseReview}
          onSuccess={handleReviewSuccess}
        />
      )}
    </div>
  );
}
