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

    const getStatusClasses = (status: string) => {
        switch (status) {
            case "confirmed": return "bg-brand-cyan/10 text-brand-cyan border-brand-cyan/20";
            case "pending": return "bg-brand-gray/10 text-brand-gray border-brand-gray/20";
            case "rejected":
            case "cancelled": return "bg-brand-pink/10 text-brand-pink border-brand-pink/20";
            default: return "bg-white/5 text-white border-white/10";
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
            <div className="max-w-4xl mx-auto py-24 px-6 flex flex-col items-center justify-center min-h-[60vh]">
                <div className="relative w-24 h-24 mb-8">
                    <div className="absolute inset-0 rounded-full border-4 border-white/5 border-t-brand-cyan animate-spin"></div>
                    <div className="absolute inset-2 rounded-full border-4 border-white/5 border-t-brand-purple animate-spin" style={{ animationDuration: '1.5s' }}></div>
                </div>
                <p className="text-brand-gray/80 uppercase tracking-widest text-xs font-black animate-pulse">Analizando vectores del viaje...</p>
            </div>
        );
    }

    if (!trip) return null;

    return (
        <div className="max-w-5xl mx-auto py-12 px-4 sm:px-6 relative">
            <div className="absolute top-0 left-0 -translate-y-1/2 -translate-x-1/4 w-[400px] h-[400px] bg-brand-purple/5 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-12">
                <button
                    onClick={() => router.push(`/${lang}/my-trips`)}
                    className="flex items-center gap-2 text-brand-gray/80 font-black uppercase tracking-widest text-xs hover:text-white transition-all group"
                >
                    <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
                    {t("page.myTrips.back") || "LISTADO"}
                </button>
                <div className="text-right">
                    <h1 className="text-4xl md:text-5xl font-black text-white tracking-tightest uppercase italic mb-2">
                        {t("page.myTrips.tripDetails") || "Operación de Viaje"}
                    </h1>
                    <p className="text-brand-gray/80 font-bold uppercase tracking-[0.2em] text-xs">Gestión avanzada de pasajeros</p>
                </div>
            </div>

            {/* Trip Info Card */}
            <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-8 md:p-12 shadow-2xl relative overflow-hidden mb-12">
                <div className="absolute inset-0 bg-hacker-dots opacity-5 pointer-events-none"></div>
                <div className="relative grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-6">
                        <div className="inline-flex items-center gap-2 text-brand-cyan font-black text-xs uppercase tracking-[0.3em] bg-brand-cyan/10 px-4 py-1.5 rounded-full border border-brand-cyan/20">
                            COORDENADAS ELEGIDAS
                        </div>
                        <h2 className="text-3xl md:text-4xl font-black text-white leading-tight tracking-tightest italic flex items-center gap-4">
                            {trip.departure_location}
                            <svg className="w-8 h-8 text-brand-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                            {trip.arrival_location}
                        </h2>
                        <div className="flex items-center gap-4 p-4 bg-black/20 rounded-2xl border border-white/5">
                            <svg className="w-6 h-6 text-brand-gray/30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            <p className="text-white font-bold uppercase tracking-widest text-xs">
                                {new Date(trip.departure_time).toLocaleString(lang, {
                                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                })}
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-col md:items-end justify-center gap-6">
                        <div className="text-center md:text-right">
                            <p className="text-brand-gray/80 font-black uppercase tracking-[0.2em] text-xs mb-1">PROGRAMA DE COSTOS</p>
                            <div className="text-4xl font-black text-white italic">
                                €{Number(trip.price).toFixed(2)} <span className="text-sm font-normal text-brand-gray/50 not-italic lowercase">/ persona</span>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="bg-black/20 rounded-2xl px-6 py-4 border border-white/5 text-center">
                                <p className="text-xs font-black text-brand-gray/80 uppercase tracking-widest mb-1">{t("page.myTrips.availableSeats")}</p>
                                <p className="text-xl font-black text-brand-cyan">{trip.available_seats}</p>
                            </div>
                            <div className="bg-black/20 rounded-2xl px-6 py-4 border border-white/5 text-center">
                                <p className="text-xs font-black text-brand-gray/80 uppercase tracking-widest mb-1">TOTAL PASAJEROS</p>
                                <p className="text-xl font-black text-brand-purple">{tripBookings.filter(b => b.status === "confirmed").length}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bookings Section */}
            <div className="relative">
                <div className="flex items-center gap-4 mb-8">
                    <h2 className="text-2xl font-black text-white tracking-tightest uppercase italic">
                        {t("page.myTrips.bookingsForTrip")}
                    </h2>
                    <div className="h-px flex-1 bg-white/5"></div>
                    <span className="text-xs font-black text-brand-gray/90 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-lg border border-white/5">{tripBookings.length} TOTAL</span>
                </div>

                {loadingBookings ? (
                    <div className="flex flex-col items-center py-12 gap-4">
                        <div className="w-8 h-8 border-2 border-brand-cyan/20 border-t-brand-cyan rounded-full animate-spin"></div>
                        <p className="text-brand-gray/80 text-xs font-black uppercase tracking-widest">{t("page.myTrips.loadingBookings")}</p>
                    </div>
                ) : tripBookings.length === 0 ? (
                    <div className="bg-white/5 backdrop-blur-3xl rounded-[2.5rem] p-12 text-center border border-white/10 italic">
                        <p className="text-brand-gray/40 uppercase tracking-widest font-black">{t("page.myTrips.noBookings")}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {tripBookings.map((booking) => (
                            <div
                                key={booking.id}
                                className="group relative bg-white/5 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] p-8 hover:border-brand-cyan/20 transition-all duration-500 hover:shadow-2xl overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-hacker-dots opacity-5 pointer-events-none"></div>
                                <div className="relative flex flex-col md:flex-row justify-between md:items-center gap-8">
                                    <div className="flex-1 space-y-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-brand-gradient p-0.5">
                                                <div className="w-full h-full rounded-full bg-brand-dark flex items-center justify-center text-white font-black text-lg overflow-hidden">
                                                    {booking.user?.picture_url ? (
                                                        <img src={booking.user.picture_url} className="w-full h-full object-cover" alt="" />
                                                    ) : (booking.user?.name?.charAt(0) || "?")}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="font-black text-white text-xl tracking-tightest uppercase italic">
                                                    {booking.user?.name || booking.user?.email || "Usuario Invitado"}
                                                </div>
                                                <div className="text-xs font-black text-brand-gray uppercase tracking-widest">
                                                    PASAJERO ID: <span className="text-brand-gray/70 font-mono">#{String(booking.user?.id).padStart(4, '0')}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border transition-all ${getStatusClasses(booking.status)}`}>
                                                {getStatusText(booking.status)}
                                            </span>
                                            <div className="text-xs font-black text-white uppercase tracking-[0.2em] bg-black/20 px-3 py-1.5 rounded-lg border border-white/5">
                                                {booking.seats} {booking.seats === 1 ? t("page.myTrips.seat") : t("page.myTrips.seats")}
                                            </div>
                                        </div>
                                    </div>

                                    {booking.status === "pending" && (
                                        <div className="flex gap-4 w-full md:w-auto">
                                            <button
                                                onClick={() => handleConfirmBooking(booking.id)}
                                                disabled={actionLoading === booking.id}
                                                className="flex-1 md:flex-none bg-brand-gradient text-white px-8 py-3.5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-brand-cyan/20 hover:scale-[1.05] transition-all disabled:opacity-50"
                                            >
                                                {actionLoading === booking.id ? "..." : (t("page.myTrips.confirm") || "CONFIRMAR")}
                                            </button>
                                            <button
                                                onClick={() => handleRejectBooking(booking)}
                                                disabled={actionLoading === booking.id}
                                                className="flex-1 md:flex-none px-8 py-3.5 rounded-2xl bg-brand-pink/10 text-brand-pink border border-brand-pink/20 font-black uppercase tracking-widest text-xs hover:bg-brand-pink hover:text-white transition-all disabled:opacity-50"
                                            >
                                                {actionLoading === booking.id ? "..." : (t("page.myTrips.reject") || "RECHAZAR")}
                                            </button>
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
    );
}
