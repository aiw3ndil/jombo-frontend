"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { getMyTrips, getTripBookings, Trip } from "@/app/lib/api/trips";
import { confirmBooking, rejectBooking, Booking } from "@/app/lib/api/bookings";
import { useTranslation } from "@/app/hooks/useTranslation";
import { useAuth } from "@/app/contexts/AuthContext";
import { toast } from "sonner";

export default function MyTrips() {
  const { t, loading: translationsLoading } = useTranslation();
  const router = useRouter();
  const params = useParams();
  const lang = (params?.lang as string) || "es";
  const { user, loading: authLoading } = useAuth();

  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTripId, setSelectedTripId] = useState<number | null>(null);
  const [tripBookings, setTripBookings] = useState<Booking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/${lang}/login?redirect=/${lang}/my-trips`);
      return;
    }

    if (user) {
      loadTrips();
    }
  }, [user, authLoading, router, lang]);

  const loadTrips = async () => {
    try {
      setLoading(true);
      const data = await getMyTrips();
      setTrips(data);
    } catch (error) {
      console.error("Error loading trips:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadTripBookings = async (tripId: number) => {
    try {
      setLoadingBookings(true);
      setSelectedTripId(tripId);
      const bookings = await getTripBookings(tripId);
      setTripBookings(bookings);
    } catch (error) {
      console.error("Error loading trip bookings:", error);
      toast.error(t("page.myTrips.errorLoadingBookings") || "Error al cargar las reservas");
    } finally {
      setLoadingBookings(false);
    }
  };

  const handleConfirmBooking = async (tripId: number, bookingId: number) => {
    setActionLoading(bookingId);
    try {
      await confirmBooking(tripId, bookingId);
      toast.success(t("page.myTrips.bookingConfirmed") || "Reserva confirmada");
      // Recargar las reservas del viaje
      if (selectedTripId) {
        await loadTripBookings(selectedTripId);
        await loadTrips(); // Actualizar asientos disponibles
      }
    } catch (error: any) {
      console.error("Error confirming booking:", error);
      toast.error(error?.message || t("page.myTrips.errorConfirming") || "Error al confirmar la reserva");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectBooking = async (tripId: number, bookingId: number) => {
    if (!confirm(t("page.myTrips.confirmReject") || "¿Estás seguro de rechazar esta reserva?")) {
      return;
    }

    setActionLoading(bookingId);
    try {
      await rejectBooking(tripId, bookingId);
      toast.success(t("page.myTrips.bookingRejected") || "Reserva rechazada");
      // Recargar las reservas del viaje
      if (selectedTripId) {
        await loadTripBookings(selectedTripId);
      }
    } catch (error: any) {
      console.error("Error rejecting booking:", error);
      toast.error(error?.message || t("page.myTrips.errorRejecting") || "Error al rechazar la reserva");
    } finally {
      setActionLoading(null);
    }
  };

  if (translationsLoading || authLoading || loading) {
    return (
      <div className="max-w-5xl mx-auto">
        <p className="text-gray-900">{t("page.myTrips.loading") || "Cargando..."}</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "cancelled":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "confirmed":
        return t("page.myTrips.statusConfirmed") || "Confirmada";
      case "pending":
        return t("page.myTrips.statusPending") || "Pendiente";
      case "rejected":
        return t("page.myTrips.statusRejected") || "Rechazada";
      case "cancelled":
        return t("page.myTrips.statusCancelled") || "Cancelada";
      default:
        return status;
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          {t("page.myTrips.title")}
        </h1>
        <button
          onClick={() => router.push(`/${lang}`)}
          className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
        >
          {t("page.myTrips.back")}
        </button>
      </div>

      {trips.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg mb-4">
            {t("page.myTrips.noTrips") || "No has publicado ningún viaje"}
          </p>
          <button
            onClick={() => router.push(`/${lang}/create-trip`)}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            {t("page.myTrips.createTrip") || "Publicar viaje"}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Lista de viajes */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {t("page.myTrips.yourTrips")}
            </h2>
            {trips.map((trip) => (
              <div
                key={trip.id}
                className={`border rounded-lg p-4 bg-white shadow cursor-pointer transition-all ${
                  selectedTripId === trip.id ? "ring-2 ring-blue-500" : ""
                }`}
                onClick={() => loadTripBookings(trip.id)}
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {trip.departure_location} → {trip.arrival_location}
                </h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>
                    <span className="font-medium">{t("page.myTrips.departure")}:</span>{" "}
                    {new Date(trip.departure_time).toLocaleString(lang)}
                  </p>
                  <p>
                    <span className="font-medium">{t("page.myTrips.availableSeats")}:</span>{" "}
                    {trip.available_seats}
                  </p>
                  <p>
                    <span className="font-medium">{t("page.myTrips.price")}:</span> €
                    {Number(trip.price).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Panel de reservas */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {t("page.myTrips.bookingsForTrip")}
            </h2>
            {!selectedTripId ? (
              <p className="text-gray-400 text-center py-12">
                {t("page.myTrips.selectTrip") || "Selecciona un viaje para ver sus reservas"}
              </p>
            ) : loadingBookings ? (
              <p className="text-gray-400 text-center py-12">
                {t("page.myTrips.loadingBookings") || "Cargando reservas..."}
              </p>
            ) : tripBookings.length === 0 ? (
              <p className="text-gray-400 text-center py-12">
                {t("page.myTrips.noBookings") || "No hay reservas para este viaje"}
              </p>
            ) : (
              <div className="space-y-3">
                {tripBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="border rounded-lg p-4 bg-white shadow"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {booking.user?.name || booking.user?.email}
                        </p>
                        <p className="text-sm text-gray-600">
                          {booking.seats} {booking.seats === 1 ? t("page.myTrips.seat") : t("page.myTrips.seats")}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(booking.status)}`}>
                        {getStatusText(booking.status)}
                      </span>
                    </div>

                    {booking.status === "pending" && (
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => selectedTripId && handleConfirmBooking(selectedTripId, booking.id)}
                          disabled={actionLoading === booking.id}
                          className="flex-1 bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700 disabled:bg-gray-400"
                        >
                          {actionLoading === booking.id
                            ? t("page.myTrips.confirming") || "..."
                            : t("page.myTrips.confirm") || "Confirmar"}
                        </button>
                        <button
                          onClick={() => selectedTripId && handleRejectBooking(selectedTripId, booking.id)}
                          disabled={actionLoading === booking.id}
                          className="flex-1 bg-red-600 text-white px-3 py-2 rounded text-sm hover:bg-red-700 disabled:bg-gray-400"
                        >
                          {actionLoading === booking.id
                            ? t("page.myTrips.rejecting") || "..."
                            : t("page.myTrips.reject") || "Rechazar"}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
