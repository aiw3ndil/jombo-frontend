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
    <div className="min-h-screen bg-white">
      {/* ── HERO ── */}
      <section className="bg-green-50 border-b-2 border-green-100 py-20 px-4">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 bg-green-100 border border-green-300 text-green-800 px-5 py-2 rounded-full text-sm font-bold mb-6 uppercase tracking-wide">
              <span className="w-2 h-2 rounded-full bg-green-600"></span>
              {t("page.myBookings.badge") || "Mis Viajes"}
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-green-900 leading-tight mb-6">
              {t("page.myBookings.title") || "Mis Reservas"}
            </h1>
            <p className="text-xl md:text-2xl text-green-700 max-w-2xl leading-relaxed font-normal">
              {t("page.myBookings.subtitle") || "Gestiona tus solicitudes de viaje y consulta tus trayectos confirmados."}
            </p>
          </div>
          <button
            onClick={() => router.push(`/${lang}`)}
            className="btn-secondary px-10 py-4 shadow-md bg-white hover:bg-green-50"
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {t("page.myBookings.back") || "Volver al inicio"}
          </button>
        </div>
      </section>

      {/* ── CONTENIDO ── */}
      <section className="py-20 px-4 min-h-[50vh]">
        <div className="max-w-5xl mx-auto">
          {bookings.length === 0 ? (
            <div className="text-center py-24 bg-green-50/50 rounded-[3rem] border-2 border-dashed border-green-200">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-sm border-2 border-green-100 text-green-600">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-green-900 mb-4">
                {t("page.myBookings.noBookings") || "Aún no tienes reservas"}
              </h2>
              <p className="text-green-700 text-lg mb-12 max-w-md mx-auto">
                {t("page.myBookings.noBookingsInfo") || "Busca un viaje que te interese y reserva tu plaza de forma gratuita."}
              </p>
              <button
                onClick={() => router.push(`/${lang}`)}
                className="btn-primary px-12 py-5 shadow-lg"
              >
                {t("page.myBookings.searchTrips") || "Buscar viajes ahora"}
              </button>
            </div>
          ) : (
            <div className="space-y-10">
              {bookings.map((booking) => (
                <div key={booking.id} className="result-card group">
                  {/* Decoración superior */}
                  <div className={`absolute top-0 left-0 w-full h-1.5 ${
                    booking.status === 'confirmed' ? 'bg-green-500' : 
                    booking.status === 'pending' ? 'bg-yellow-400' : 'bg-red-400'
                  }`}></div>

                  <div className="flex flex-col xl:flex-row justify-between gap-10">
                    <div className="flex-1 space-y-8">
                      <div className="flex flex-wrap items-center gap-4">
                        <span className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest border-2 shadow-sm ${getStatusClasses(booking.status)}`}>
                          {getStatusText(booking.status)}
                        </span>
                        <div className="flex items-center gap-2 text-green-600 font-bold text-sm bg-green-50 px-4 py-1.5 rounded-lg border border-green-100">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v12a2 2 0 002 2z" />
                          </svg>
                          {new Date(booking.created_at).toLocaleDateString(lang, { day: 'numeric', month: 'long', year: 'numeric' })}
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="flex items-start gap-4">
                           <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center text-green-700 flex-shrink-0">
                              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              </svg>
                           </div>
                           <h2 className="text-4xl font-bold text-green-900 leading-tight tracking-tight">
                            {booking.trip?.departure_location} <span className="text-green-300 mx-2">→</span> {booking.trip?.arrival_location}
                          </h2>
                        </div>
                        
                        <div className="flex items-center gap-4 bg-green-50/50 p-4 rounded-2xl border border-green-100 w-fit group-hover:bg-green-50 transition-colors">
                          <div className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center text-white font-bold overflow-hidden shadow-md border-2 border-white">
                            {booking.trip?.driver?.picture_url ? (
                              <img src={booking.trip.driver.picture_url} className="w-full h-full object-cover" alt="" />
                            ) : (
                              booking.trip?.driver?.name?.charAt(0)
                            )}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-green-400 uppercase tracking-widest">{t("page.myBookings.driver") || "Conductor"}</p>
                            <p className="font-bold text-green-900 text-lg">
                              {booking.trip?.driver?.name}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div className="bg-green-50/30 border-2 border-green-100 rounded-[1.5rem] p-5 hover:bg-white hover:border-green-300 transition-all shadow-sm">
                          <p className="text-xs font-bold text-green-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                             {t("page.myBookings.departure") || "HORARIO"}
                          </p>
                          <p className="font-bold text-green-900 text-base">
                            {booking.trip?.departure_time ? (
                              <>
                                {new Date(booking.trip.departure_time).toLocaleDateString(lang)} · {new Date(booking.trip.departure_time).toLocaleTimeString(lang, { hour: '2-digit', minute: '2-digit' })}h
                              </>
                            ) : "-"}
                          </p>
                        </div>
                        <div className="bg-green-50/30 border-2 border-green-100 rounded-[1.5rem] p-5 hover:bg-white hover:border-green-300 transition-all shadow-sm">
                          <p className="text-xs font-bold text-green-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                             {t("page.myBookings.seats") || "ASIENTOS"}
                          </p>
                          <p className="font-bold text-green-900 text-base underline decoration-green-300 underline-offset-4 decoration-2">{booking.seats} {t("common.seats") || "plazas"}</p>
                        </div>
                        <div className="bg-green-50 border-2 border-green-200 rounded-[1.5rem] p-5 shadow-inner">
                          <p className="text-xs font-bold text-green-400 uppercase tracking-widest mb-2">{t("page.myBookings.totalPrice") || "PAGO TOTAL"}</p>
                          <p className="font-black text-green-700 text-2xl">
                            €{booking.trip?.price ? (Number(booking.trip.price) * booking.seats).toFixed(2) : "0.00"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row xl:flex-col gap-4 min-w-[240px] justify-center items-stretch">
                      {booking.status !== "cancelled" && booking.status !== "rejected" && (
                        <>
                          {canReview(booking) && (
                            <button
                              onClick={() => handleOpenReview(booking)}
                              className="btn-primary w-full shadow-lg"
                            >
                              <span className="text-xl mr-2">⭐</span> {t("page.myBookings.review") || "Calificar viaje"}
                            </button>
                          )}
                          {bookingReviews[booking.id] && (
                            <div className="flex items-center justify-center gap-3 text-green-700 bg-green-50 border-2 border-green-200 px-8 py-5 rounded-2xl text-base font-bold shadow-sm">
                              <svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              {t("page.myBookings.reviewed") || "CALIFICADO"}
                            </div>
                          )}

                          <button
                            onClick={() => handleCancelBooking(booking.id)}
                            disabled={cancellingId === booking.id}
                            className="bg-white border-2 border-red-100 text-red-600 px-8 py-5 rounded-2xl font-bold hover:bg-red-50 hover:border-red-200 transition-all disabled:opacity-50 shadow-sm text-lg"
                          >
                            {cancellingId === booking.id ? (
                              <span className="flex items-center justify-center gap-3">
                                <div className="w-5 h-5 border-3 border-red-200 border-t-red-600 rounded-full animate-spin"></div>
                                Procesando...
                              </span>
                            ) : (t("page.myBookings.cancel") || "Cancelar reserva")}
                          </button>
                        </>
                      )}
                      {(booking.status === "cancelled" || booking.status === "rejected") && (
                        <div className="px-10 py-6 text-center grayscale opacity-40 bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2">
                           <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                           </svg>
                          <span className="text-sm font-bold text-gray-400 uppercase tracking-widest italic">{t("page.myBookings.inactive") || "Reserva Finalizada"}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

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
