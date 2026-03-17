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

    const getStatusClasses = (status: string) => {
        switch (status) {
            case "confirmed": return "bg-green-100 text-green-700 border-green-200";
            case "pending": return "bg-yellow-100 text-yellow-700 border-yellow-200";
            case "rejected":
            case "cancelled": return "bg-red-100 text-red-700 border-red-200";
            default: return "bg-gray-100 text-gray-700 border-gray-200";
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case "confirmed": return t("page.myTrips.statusConfirmed") || "CONFIRMADA";
            case "pending": return t("page.myTrips.statusPending") || "PENDIENTE";
            case "rejected": return t("page.myTrips.statusRejected") || "RECHAZADA";
            case "cancelled": return t("page.myTrips.statusCancelled") || "CANCELADA";
            default: return status.toUpperCase();
        }
    };

    if (translationsLoading || authLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="spinner"></div>
            </div>
        );
    }

    if (!trip) return null;

    return (
        <div className="min-h-screen bg-white py-12 px-4">
            <div className="max-w-5xl mx-auto">
                {/* Header HUD */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-12">
                    <button
                        onClick={() => router.push(`/${lang}/my-trips`)}
                        className="flex items-center gap-2 text-green-600 font-bold uppercase tracking-widest text-sm hover:text-green-800 transition-all group"
                    >
                        <svg className="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
                        {t("page.myTrips.back") || "Lista de viajes"}
                    </button>
                    <div className="text-right">
                        <h1 className="text-4xl md:text-5xl font-bold text-green-900 mb-2">
                            {t("page.myTrips.tripDetails") || "Detalle del Viaje"}
                        </h1>
                        <p className="text-green-700 text-lg uppercase tracking-wider font-medium">Gestión de pasajeros</p>
                    </div>
                </div>

                {/* Trip Info Card */}
                <div className="bg-green-50 rounded-[3rem] p-8 md:p-12 border-2 border-green-100 shadow-sm relative overflow-hidden mb-12">
                    <div className="relative grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div className="space-y-6">
                            <div className="inline-flex items-center gap-2 text-green-700 font-bold text-xs uppercase tracking-widest bg-white px-4 py-1.5 rounded-full border-2 border-green-200">
                                RUTA SELECCIONADA
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold text-green-900 leading-tight">
                                {trip.departure_location}
                                <span className="mx-4 text-green-300">→</span>
                                {trip.arrival_location}
                            </h2>
                            <div className="flex items-center gap-4 p-5 bg-white rounded-2xl border-2 border-green-100 shadow-sm">
                                <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                <p className="text-green-800 font-bold text-lg">
                                    {new Date(trip.departure_time).toLocaleString(lang, {
                                        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                    })}h
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-col md:items-end justify-center gap-8">
                            <div className="text-center md:text-right">
                                <p className="text-green-500 font-bold uppercase tracking-[0.2em] text-xs mb-1">PROGRAMA DE COSTOS</p>
                                <div className="text-5xl font-bold text-green-900 italic">
                                    €{Number(trip.price).toFixed(2)} <span className="text-sm font-normal text-green-600 not-italic lowercase">/ plaza</span>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="bg-white rounded-2xl px-8 py-5 border-2 border-green-100 text-center shadow-sm">
                                    <p className="text-xs font-bold text-green-400 uppercase tracking-widest mb-1">{t("page.myTrips.availableSeats")}</p>
                                    <p className="text-2xl font-bold text-green-600">{trip.available_seats}</p>
                                </div>
                                <div className="bg-white rounded-2xl px-8 py-5 border-2 border-green-100 text-center shadow-sm">
                                    <p className="text-xs font-bold text-green-400 uppercase tracking-widest mb-1">PASAJEROS CONFIRMADOS</p>
                                    <p className="text-2xl font-bold text-green-600">{tripBookings.filter(b => b.status === "confirmed").length}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bookings Section */}
                <div className="relative">
                    <div className="flex items-center gap-6 mb-10">
                        <h2 className="text-3xl font-bold text-green-900">
                            {t("page.myTrips.bookingsForTrip") || "Solicitudes de reserva"}
                        </h2>
                        <div className="h-0.5 flex-1 bg-green-100"></div>
                        <span className="text-xs font-bold text-green-500 uppercase tracking-widest bg-green-50 px-4 py-1.5 rounded-full border-2 border-green-100">{tripBookings.length} TOTAL</span>
                    </div>

                    {loadingBookings ? (
                        <div className="flex flex-col items-center py-20 gap-4">
                            <div className="spinner"></div>
                            <p className="text-green-600 font-bold uppercase tracking-widest text-xs">{t("page.myTrips.loadingBookings")}</p>
                        </div>
                    ) : tripBookings.length === 0 ? (
                        <div className="bg-green-50 rounded-[2.5rem] p-20 text-center border-2 border-green-100 italic">
                            <p className="text-green-300 text-xl font-bold uppercase tracking-widest">{t("page.myTrips.noBookings") || "Aún no hay solicitudes para este viaje"}</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6">
                            {tripBookings.map((booking) => (
                                <div
                                    key={booking.id}
                                    className="result-card"
                                >
                                    <div className="relative flex flex-col md:flex-row justify-between md:items-center gap-8">
                                        <div className="flex-1 space-y-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 rounded-full bg-green-600 p-0.5 flex-shrink-0">
                                                    <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-green-600 font-bold text-2xl overflow-hidden border-2 border-white">
                                                        {booking.user?.picture_url ? (
                                                            <img src={booking.user.picture_url} className="w-full h-full object-cover" alt="" />
                                                        ) : (booking.user?.name?.charAt(0) || "?")}
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="font-bold text-green-900 text-2xl leading-tight">
                                                        {booking.user?.name || booking.user?.email || "Usuario Invitado"}
                                                    </div>
                                                    <div className="text-xs font-bold text-green-400 uppercase tracking-widest mt-1">
                                                        PASAJERO ID: <span className="text-green-600 font-mono">#{String(booking.user?.id).padStart(4, '0')}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border-2 ${getStatusClasses(booking.status)}`}>
                                                    {getStatusText(booking.status)}
                                                </span>
                                                <div className="text-xs font-bold text-green-700 uppercase tracking-widest bg-green-50 px-4 py-1.5 rounded-full border border-green-100">
                                                    {booking.seats} {booking.seats === 1 ? t("page.myTrips.seat") : t("page.myTrips.seats")}
                                                </div>
                                            </div>
                                        </div>

                                        {booking.status === "pending" && (
                                            <div className="flex gap-4 w-full md:w-auto mt-4 md:mt-0">
                                                <button
                                                    onClick={() => handleConfirmBooking(booking.id)}
                                                    disabled={actionLoading === booking.id}
                                                    className="flex-1 md:flex-none btn-primary px-8 py-3.5 text-sm"
                                                >
                                                    {actionLoading === booking.id ? "..." : (t("page.myTrips.confirm") || "CONFIRMAR")}
                                                </button>
                                                <button
                                                    onClick={() => handleRejectBooking(booking)}
                                                    disabled={actionLoading === booking.id}
                                                    className="flex-1 md:flex-none px-8 py-3.5 rounded-xl bg-white border-2 border-red-100 text-red-600 font-bold uppercase tracking-widest text-xs hover:bg-red-50 transition-all shadow-sm"
                                                >
                                                    {actionLoading === booking.id ? "..." : (t("page.myTrips.reject") || "RECHAZAR")}
                                                </button>
                                            </div>
                                        )}
                                        {booking.status === "confirmed" && (
                                            <div className="flex items-center gap-2 text-green-600 font-bold bg-green-50 px-6 py-3 rounded-xl border border-green-100">
                                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                                                PASAJERO A BORDO
                                            </div>
                                        )}
                                    </div>
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
        </div>
    );
}
