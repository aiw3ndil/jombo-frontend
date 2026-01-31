"use client";

import { useEffect, useState, useMemo, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getMyTrips, getTripBookings, Trip } from "@/app/lib/api/trips";
import { confirmBooking, rejectBooking, Booking } from "@/app/lib/api/bookings";
import { useTranslation } from "@/app/hooks/useTranslation";
import { useAuth } from "@/app/contexts/AuthContext";
import { toast } from "sonner";
import RejectBookingModal from "@/app/components/RejectBookingModal";

export default function TripDetails({ params }: { params: Promise<{ lang: string; id: string }> }) {
    const resolvedParams = use(params);
    const lang = resolvedParams.lang || "es";
    const tripIdStr = resolvedParams.id;
    const tripId = parseInt(tripIdStr, 10);

    const translationNamespaces = useMemo(() => ["common", "myTrips"], []);
    const { t, loading: translationsLoading } = useTranslation(translationNamespaces);
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();

    const [trip, setTrip] = useState<Trip | null>(null);
    const [tripBookings, setTripBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingBookings, setLoadingBookings] = useState(false);
    const [actionLoading, setActionLoading] = useState<number | null>(null);
    const [rejectModalOpen, setRejectModalOpen] = useState(false);
    const [selectedBookingToReject, setSelectedBookingToReject] = useState<Booking | null>(null);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push(`/${lang}/login?redirect=/${lang}/my-trips/${tripId}`);
            return;
        }

        if (user && tripId) {
            loadData();
        }
    }, [user, authLoading, router, lang, tripId]);

    const loadData = async () => {
        setLoading(true);
        try {
            // Fetch trips to find current trip details (workaround for missing getTrip endpoint)
            const trips = await getMyTrips();
            const currentTrip = trips.find(t => t.id === tripId);

            if (!currentTrip) {
                toast.error("Viaje no encontrado");
                router.push(`/${lang}/my-trips`);
                return;
            }

            setTrip(currentTrip);
            await loadBookings();
        } catch (error) {
            console.error("Error loading trip data:", error);
            toast.error("Error al cargar los datos del viaje");
        } finally {
            setLoading(false);
        }
    };

    const loadBookings = async () => {
        try {
            setLoadingBookings(true);
            const bookings = await getTripBookings(tripId);
            setTripBookings(bookings);
        } catch (error) {
            console.error("Error loading bookings:", error);
            toast.error(t("page.myTrips.errorLoadingBookings") || "Error al cargar las reservas");
        } finally {
            setLoadingBookings(false);
        }
    };

    const handleConfirmBooking = async (bookingId: number) => {
        setActionLoading(bookingId);
        try {
            await confirmBooking(tripId, bookingId);
            toast.success(t("page.myTrips.bookingConfirmed") || "Reserva confirmada");
            await loadBookings();
            // Optionally reload trip to update available seats if API supports it
            // But we would need to fetch trips again
        } catch (error: any) {
            console.error("Error confirming booking:", error);
            toast.error(error?.message || t("page.myTrips.errorConfirming") || "Error al confirmar la reserva");
        } finally {
            setActionLoading(null);
        }
    };

    const handleRejectBooking = (booking: Booking) => {
        setSelectedBookingToReject(booking);
        setRejectModalOpen(true);
    };

    const handleConfirmRejectBooking = async () => {
        if (!selectedBookingToReject) return;

        setActionLoading(selectedBookingToReject.id);
        try {
            await rejectBooking(tripId, selectedBookingToReject.id);
            toast.success(t("page.myTrips.bookingRejected") || "Reserva rechazada");
            await loadBookings();
            setRejectModalOpen(false);
            setSelectedBookingToReject(null);
        } catch (error: any) {
            console.error("Error rejecting booking:", error);
            toast.error(error?.message || t("page.myTrips.errorRejecting") || "Error al rechazar la reserva");
        } finally {
            setActionLoading(null);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "confirmed": return "bg-green-100 text-green-800";
            case "pending": return "bg-yellow-100 text-yellow-800";
            case "rejected": return "bg-red-100 text-red-800";
            case "cancelled": return "bg-gray-100 text-gray-800";
            default: return "bg-gray-100 text-gray-800";
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case "confirmed": return t("page.myTrips.statusConfirmed") || "Confirmada";
            case "pending": return t("page.myTrips.statusPending") || "Pendiente";
            case "rejected": return t("page.myTrips.statusRejected") || "Rechazada";
            case "cancelled": return t("page.myTrips.statusCancelled") || "Cancelada";
            default: return status;
        }
    };

    if (translationsLoading || authLoading || loading) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <p className="text-gray-900">{t("page.myTrips.loading") || "Cargando..."}</p>
            </div>
        );
    }

    if (!trip) return null;

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <button
                    onClick={() => router.push(`/${lang}/my-trips`)}
                    className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
                >
                    ← {t("page.myTrips.back") || "Volver"}
                </button>
                <h1 className="text-2xl font-bold text-gray-900">
                    {t("page.myTrips.tripDetails") || "Detalles del Viaje"}
                </h1>
            </div>

            {/* Trip Info Card */}
            <div className="bg-white shadow rounded-lg p-6 mb-8 border border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">
                            {trip.departure_location} → {trip.arrival_location}
                        </h2>
                        <p className="text-gray-600">
                            {new Date(trip.departure_time).toLocaleString(lang, {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </p>
                    </div>
                    <div className="flex flex-col md:items-end justify-center">
                        <div className="text-lg font-semibold text-gray-900">
                            €{Number(trip.price).toFixed(2)} <span className="text-sm font-normal text-gray-500">/ {t("page.search.perSeat")}</span>
                        </div>
                        <div className="text-gray-600 mt-1">
                            {trip.available_seats} {t("page.myTrips.availableSeats")}
                        </div>
                    </div>
                </div>
            </div>

            {/* Bookings Section */}
            <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                    {t("page.myTrips.bookingsForTrip")}
                </h2>

                {loadingBookings ? (
                    <p className="text-gray-400 py-8">{t("page.myTrips.loadingBookings")}</p>
                ) : tripBookings.length === 0 ? (
                    <div className="bg-gray-50 rounded-lg p-8 text-center border border-gray-200">
                        <p className="text-gray-500">{t("page.myTrips.noBookings")}</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {tripBookings.map((booking) => (
                            <div
                                key={booking.id}
                                className="border rounded-lg p-4 bg-white shadow-sm flex flex-col md:flex-row justify-between md:items-center gap-4"
                            >
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-1">
                                        <div className="font-semibold text-gray-900 text-lg">
                                            {booking.user?.name || booking.user?.email || "Usuario"}
                                        </div>
                                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(booking.status)}`}>
                                            {getStatusText(booking.status)}
                                        </span>
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        {booking.seats} {booking.seats === 1 ? t("page.myTrips.seat") : t("page.myTrips.seats")}
                                    </div>
                                </div>

                                {booking.status === "pending" && (
                                    <div className="flex gap-2 w-full md:w-auto">
                                        <button
                                            onClick={() => handleConfirmBooking(booking.id)}
                                            disabled={actionLoading === booking.id}
                                            className="flex-1 md:flex-none bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700 disabled:bg-gray-400 transition-colors"
                                        >
                                            {actionLoading === booking.id
                                                ? (t("page.myTrips.confirming") || "...")
                                                : (t("page.myTrips.confirm") || "Confirmar")}
                                        </button>
                                        <button
                                            onClick={() => handleRejectBooking(booking)}
                                            disabled={actionLoading === booking.id}
                                            className="flex-1 md:flex-none bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700 disabled:bg-gray-400 transition-colors"
                                        >
                                            {actionLoading === booking.id
                                                ? (t("page.myTrips.rejecting") || "...")
                                                : (t("page.myTrips.reject") || "Rechazar")}
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {rejectModalOpen && selectedBookingToReject && (
                <RejectBookingModal
                    isOpen={rejectModalOpen}
                    onClose={() => {
                        setRejectModalOpen(false);
                        setSelectedBookingToReject(null);
                    }}
                    onConfirm={handleConfirmRejectBooking}
                    loading={actionLoading === selectedBookingToReject.id}
                    t={t}
                    bookingDetails={{
                        userName: selectedBookingToReject.user?.name || selectedBookingToReject.user?.email || 'N/A',
                        seats: selectedBookingToReject.seats,
                    }}
                />
            )}
        </div>
    );
}
