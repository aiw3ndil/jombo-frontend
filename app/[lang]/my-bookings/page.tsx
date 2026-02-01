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

      // Check which bookings already have reviews
      const reviewsStatus: { [key: number]: boolean } = {};
      await Promise.all(
        data.map(async (booking) => {
          if (booking.status === "confirmed" && booking.trip?.departure_time) {
            try {
              const reviews = await getBookingReviews(booking.id);
              // Check if current user already reviewed
              reviewsStatus[booking.id] = reviews.some(
                (review) => review.reviewer_id === user?.id
              );
            } catch (error) {
              console.error(`Error fetching reviews for booking ${booking.id}:`, error);
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
      console.error("Error cancelling booking:", error);
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
    // Only confirmed bookings can be reviewed
    if (booking.status !== "confirmed") return false;

    // Trip must have already happened (departure_time in the past)
    if (!booking.trip?.departure_time) return false;

    const departureTime = new Date(booking.trip.departure_time);
    const now = new Date();

    if (departureTime > now) return false;

    // Check if user already reviewed
    if (bookingReviews[booking.id]) return false;

    return true;
  };

  if (translationsLoading || authLoading || (loading && bookings.length === 0)) {
    return (
      <div className="max-w-5xl mx-auto">
        <p className="text-gray-900">{t("page.myBookings.loading") || "Cargando..."}</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const getStatusClasses = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-brand-cyan/10 text-brand-cyan border-brand-cyan/20";
      case "pending":
        return "bg-brand-gray/10 text-brand-gray border-brand-gray/20";
      case "rejected":
      case "cancelled":
        return "bg-brand-pink/10 text-brand-pink border-brand-pink/20";
      default:
        return "bg-white/5 text-white border-white/10";
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

  if (translationsLoading || authLoading || (loading && bookings.length === 0)) {
    return (
      <div className="max-w-4xl mx-auto py-24 px-6 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="relative w-24 h-24 mb-8">
          <div className="absolute inset-0 rounded-full border-4 border-white/5 border-t-brand-cyan animate-spin"></div>
          <div className="absolute inset-2 rounded-full border-4 border-white/5 border-t-brand-purple animate-spin" style={{ animationDuration: '1.5s' }}></div>
        </div>
        <p className="text-brand-gray uppercase tracking-widest text-[10px] font-black animate-pulse">{t("page.myBookings.loading") || "Cargando..."}</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-5xl mx-auto py-12 px-4 sm:px-6 relative">
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[400px] h-[400px] bg-brand-cyan/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-12">
        <div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tightest uppercase italic mb-2">
            {t("page.myBookings.title")}
          </h1>
          <p className="text-brand-gray font-medium uppercase tracking-[0.2em] text-[10px]">
            Tu historial de reservas en la red
          </p>
        </div>
        <button
          onClick={() => router.push(`/${lang}`)}
          className="bg-white/5 text-white/50 border border-white/10 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:text-white hover:border-white/20 transition-all shadow-xl"
        >
          {t("page.myBookings.back")}
        </button>
      </div>

      {bookings.length === 0 ? (
        <div className="text-center py-24 bg-white/5 backdrop-blur-3xl rounded-[3rem] border border-white/10 relative overflow-hidden">
          <div className="absolute inset-0 bg-hacker-dots opacity-5 pointer-events-none"></div>
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-8 border border-white/10 text-brand-gray/30">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-xl text-brand-gray font-medium uppercase tracking-widest mb-10">
            {t("page.myBookings.noBookings") || "No tienes reservas registradas"}
          </p>
          <button
            onClick={() => router.push(`/${lang}`)}
            className="bg-brand-gradient text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl shadow-brand-cyan/20 hover:scale-105 active:scale-95 transition-all"
          >
            {t("page.myBookings.searchTrips") || "Buscar viajes"}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="group relative bg-white/5 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] p-8 hover:border-brand-cyan/20 transition-all duration-500 hover:shadow-2xl hover:shadow-brand-cyan/5 overflow-hidden"
            >
              <div className="absolute inset-0 bg-hacker-dots opacity-5 pointer-events-none"></div>

              <div className="relative flex flex-col xl:flex-row justify-between xl:items-center gap-8">
                <div className="flex-1 space-y-6">
                  <div className="flex flex-wrap items-center gap-4">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${getStatusClasses(booking.status)}`}>
                      {getStatusText(booking.status)}
                    </span>
                    <span className="text-brand-gray/50 text-[10px] font-black uppercase tracking-[0.2em]">{new Date(booking.created_at).toLocaleDateString(lang)}</span>
                  </div>

                  <div className="space-y-2">
                    <h2 className="text-2xl md:text-3xl font-black text-white leading-tight tracking-tightest flex items-center gap-4 group-hover:text-brand-cyan transition-colors italic">
                      {booking.trip?.departure_location}
                      <svg className="w-6 h-6 text-brand-gray/30 group-hover:text-brand-cyan/50 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                      {booking.trip?.arrival_location}
                    </h2>
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-brand-gradient flex items-center justify-center p-0.5">
                        <div className="w-full h-full rounded-full bg-brand-dark overflow-hidden">
                          {booking.trip?.driver?.picture_url ? (
                            <img src={booking.trip.driver.picture_url} className="w-full h-full object-cover" alt="" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-brand-purple text-[8px] font-black text-white">{booking.trip?.driver?.name?.charAt(0)}</div>
                          )}
                        </div>
                      </div>
                      <p className="text-[10px] font-black text-brand-gray uppercase tracking-widest">
                        {t("page.myBookings.driver")}: <span className="text-white">{booking.trip?.driver?.name}</span>
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 bg-black/20 rounded-[2rem] p-6 border border-white/5">
                    <div>
                      <p className="text-[10px] font-black text-brand-gray/40 uppercase tracking-widest mb-1">{t("page.myBookings.departure")}</p>
                      <p className="font-bold text-xs text-white uppercase italic">
                        {booking.trip?.departure_time ? (
                          <>
                            {new Date(booking.trip.departure_time).toLocaleDateString(lang, { day: 'numeric', month: 'short' })}
                            <span className="mx-2 text-brand-purple">|</span>
                            {new Date(booking.trip.departure_time).toLocaleTimeString(lang, { hour: '2-digit', minute: '2-digit' })}
                          </>
                        ) : "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-brand-gray/40 uppercase tracking-widest mb-1">{t("page.myBookings.seats")}</p>
                      <p className="font-bold text-xs text-white">{booking.seats} <span className="text-[10px] text-brand-gray font-medium">LUGARES</span></p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-brand-gray/40 uppercase tracking-widest mb-1">{t("page.myBookings.totalPrice")}</p>
                      <p className="font-bold text-xs text-brand-cyan">
                        €{booking.trip?.price ? (Number(booking.trip.price) * booking.seats).toFixed(2) : "0.00"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-brand-gray/40 uppercase tracking-widest mb-1">ID RESERVA</p>
                      <p className="font-bold text-[10px] text-brand-gray/60 font-mono">#{String(booking.id).padStart(6, '0')}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row xl:flex-col gap-4 min-w-[200px] justify-center items-stretch">
                  {booking.status !== "cancelled" && booking.status !== "rejected" && (
                    <>
                      {canReview(booking) && (
                        <button
                          onClick={() => handleOpenReview(booking)}
                          className="bg-brand-purple text-white px-8 py-4 rounded-2xl hover:scale-105 active:scale-95 transition-all font-black uppercase tracking-widest text-[10px] shadow-xl shadow-brand-purple/20"
                        >
                          ⭐ {t("page.myBookings.review") || "CALIFICAR"}
                        </button>
                      )}
                      {bookingReviews[booking.id] && (
                        <div className="flex items-center justify-center gap-2 text-brand-cyan bg-brand-cyan/10 border border-brand-cyan/20 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          {t("page.myBookings.reviewed") || "CALIFICADO"}
                        </div>
                      )}

                      <button
                        onClick={() => handleCancelBooking(booking.id)}
                        disabled={cancellingId === booking.id}
                        className="bg-brand-pink/10 text-brand-pink border border-brand-pink/20 px-8 py-4 rounded-2xl hover:bg-brand-pink hover:text-white transition-all font-black uppercase tracking-widest text-[10px] disabled:opacity-50"
                      >
                        {cancellingId === booking.id
                          ? (t("page.myBookings.cancelling") || "PROCESANDO...")
                          : (t("page.myBookings.cancel") || "CANCELAR")}
                      </button>
                    </>
                  )}
                  {(booking.status === "cancelled" || booking.status === "rejected") && (
                    <div className="px-8 py-4 text-center grayscale opacity-50">
                      <span className="text-[10px] font-black text-brand-gray uppercase tracking-widest italic">{t("page.myBookings.inactive")}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

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
