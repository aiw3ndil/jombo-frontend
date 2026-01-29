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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "text-green-600";
      case "pending":
        return "text-yellow-600";
      case "rejected":
        return "text-orange-600";
      case "cancelled":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "confirmed":
        return t("page.myBookings.statusConfirmed") || "Confirmada";
      case "pending":
        return t("page.myBookings.statusPending") || "Pendiente";
      case "rejected":
        return t("page.myBookings.statusRejected") || "Rechazada";
      case "cancelled":
        return t("page.myBookings.statusCancelled") || "Cancelada";
      default:
        return status;
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          {t("page.myBookings.title")}
        </h1>
        <button
          onClick={() => router.push(`/${lang}`)}
          className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
        >
          {t("page.myBookings.back")}
        </button>
      </div>

      {bookings.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg mb-4">
            {t("page.myBookings.noBookings") || "No tienes reservas"}
          </p>
          <button
            onClick={() => router.push(`/${lang}`)}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            {t("page.myBookings.searchTrips") || "Buscar viajes"}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="border border-gray-300 rounded-lg p-4 bg-white shadow"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-900 mb-1">
                    {booking.trip?.departure_location} → {booking.trip?.arrival_location}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {t("page.myBookings.driver")}: {booking.trip?.driver?.name}
                  </p>
                </div>
                <span className={`font-semibold ${getStatusColor(booking.status)}`}>
                  {getStatusText(booking.status)}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                <div>
                  <p className="text-sm text-gray-600">{t("page.myBookings.departure")}</p>
                  <p className="font-medium text-gray-900">
                    {booking.trip?.departure_time ? new Date(booking.trip.departure_time).toLocaleString(lang) : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">{t("page.myBookings.seats")}</p>
                  <p className="font-medium text-gray-900">{booking.seats}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">{t("page.myBookings.totalPrice")}</p>
                  <p className="font-medium text-green-600">
                    €{booking.trip?.price ? (Number(booking.trip.price) * booking.seats).toFixed(2) : "0.00"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">{t("page.myBookings.bookingDate")}</p>
                  <p className="font-medium text-gray-900">
                    {new Date(booking.created_at).toLocaleDateString(lang)}
                  </p>
                </div>
              </div>

              {booking.status !== "cancelled" && booking.status !== "rejected" && (
                <div className="flex justify-end gap-2">
                  {canReview(booking) && (
                    <button
                      onClick={() => handleOpenReview(booking)}
                      className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition-colors"
                    >
                      ⭐ {t("page.myBookings.review") || "Calificar"}
                    </button>
                  )}
                  {bookingReviews[booking.id] && (
                    <span className="flex items-center gap-1 text-green-600 px-4 py-2">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      {t("page.myBookings.reviewed") || "Calificado"}
                    </span>
                  )}
                  <button
                    onClick={() => handleCancelBooking(booking.id)}
                    disabled={cancellingId === booking.id}
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {cancellingId === booking.id
                      ? (t("page.myBookings.cancelling") || "Cancelando...")
                      : (t("page.myBookings.cancel") || "Cancelar reserva")}
                  </button>
                </div>
              )}
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
