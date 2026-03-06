"use client";
import { useEffect, useState, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { getMyTrips, deleteTrip, Trip } from "@/app/lib/api/trips";
import { useTranslation } from "@/app/hooks/useTranslation";
import { useAuth } from "@/app/contexts/AuthContext";
import { toast } from "sonner";

export default function MyTrips() {
  const translationNamespaces = useMemo(() => ["common", "myTrips"], []);
  const { t, loading: translationsLoading } = useTranslation(translationNamespaces);
  const router = useRouter();
  const params = useParams();
  const lang = (params?.lang as string) || "es";
  const { user, loading: authLoading } = useAuth();

  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean, trip: Trip | null }>({ isOpen: false, trip: null });
  const [deleting, setDeleting] = useState(false);

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
      // Sort trips by date, newest first or by departure date?
      // Usually upcoming trips first.
      const sortedTrips = data.sort((a, b) => new Date(a.departure_time).getTime() - new Date(b.departure_time).getTime());
      setTrips(sortedTrips);
    } catch (error) {
      console.error("Error loading trips:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (allRecurring: boolean = false) => {
    if (!deleteModal.trip) return;

    setDeleting(true);
    try {
      await deleteTrip(deleteModal.trip.id, allRecurring);
      toast.success(t("page.myTrips.deleteSuccess") || "Viaje eliminado exitosamente");
      setDeleteModal({ isOpen: false, trip: null });
      loadTrips();
    } catch (error: any) {
      console.error("Error deleting trip:", error);
      toast.error(error.message || t("page.myTrips.deleteError") || "Error al eliminar el viaje");
    } finally {
      setDeleting(false);
    }
  };

  if (translationsLoading || authLoading || loading) {
    return (
      <div className="max-w-4xl mx-auto py-24 px-6 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="relative w-20 h-20 mb-8">
          <div className="absolute inset-0 rounded-full border-4 border-white/5 border-t-brand-cyan animate-spin"></div>
          <div className="absolute inset-2 rounded-full border-4 border-white/5 border-t-brand-purple animate-spin" style={{ animationDuration: '1.5s' }}></div>
        </div>
        <p className="text-brand-gray uppercase tracking-widest text-xs font-black animate-pulse">{t("page.myTrips.loading") || "Cargando..."}</p>
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
            {t("page.myTrips.title")}
          </h1>
          <p className="text-brand-gray/80 font-bold uppercase tracking-[0.2em] text-xs">
            Tus viajes compartidos en la red
          </p>
        </div>
        <Link href={`/${lang}/create-trip`} className="bg-brand-gradient text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all hover:scale-[1.05] active:scale-95 shadow-xl shadow-brand-cyan/20">
          {t("page.myTrips.createTrip") || "Publicar viaje"}
        </Link>
      </div>

      {trips.length === 0 ? (
        <div className="text-center py-24 bg-white/5 backdrop-blur-3xl rounded-[3rem] border border-white/10 relative overflow-hidden">
          <div className="absolute inset-0 bg-hacker-dots opacity-5 pointer-events-none"></div>
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-8 border border-white/10">
            <svg className="w-8 h-8 text-brand-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </div>
          <p className="text-xl text-brand-gray font-medium uppercase tracking-widest mb-8">
            {t("page.myTrips.noTrips") || "No has publicado ningún viaje"}
          </p>
          <Link href={`/${lang}/create-trip`} className="inline-block bg-white/5 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs border border-white/10 hover:bg-white/10 transition-all">
            {t("page.myTrips.createTrip") || "Publicar viaje"}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {trips.map((trip) => (
            <div
              key={trip.id}
              className="group relative bg-white/5 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] p-8 hover:border-brand-cyan/20 transition-all duration-500 hover:shadow-2xl hover:shadow-brand-cyan/5 overflow-hidden"
            >
              <div className="absolute inset-0 bg-hacker-dots opacity-5 pointer-events-none"></div>

              <div className="relative flex flex-col lg:flex-row justify-between lg:items-center gap-8">
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-3 text-brand-cyan font-black text-xs uppercase tracking-[0.2em]">
                    <span>{new Date(trip.departure_time).toLocaleDateString(lang, { day: 'numeric', month: 'short' })}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-white/20"></span>
                    <span className="text-brand-purple">{new Date(trip.departure_time).toLocaleTimeString(lang, { hour: '2-digit', minute: '2-digit' })} HS</span>
                  </div>

                  <h3 className="text-2xl md:text-3xl font-black text-white leading-tight tracking-tightest flex items-center gap-4 group-hover:text-brand-cyan transition-colors">
                    {trip.departure_location}
                    <svg className="w-6 h-6 text-brand-gray/30 group-hover:text-brand-cyan/50 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                    {trip.arrival_location}
                  </h3>

                  <div className="flex flex-wrap gap-6">
                    <div className="bg-black/20 rounded-2xl px-5 py-3 border border-white/5">
                      <p className="text-xs font-black text-brand-gray/80 uppercase tracking-widest mb-1">{t("page.myTrips.availableSeats")}</p>
                      <p className={`text-sm font-bold flex items-center gap-2 ${trip.available_seats === 0 ? "text-brand-pink" : "text-white"}`}>
                        {trip.available_seats} <span className="text-xs text-brand-gray/70 uppercase font-black italic">Lugares</span>
                      </p>
                    </div>

                    <div className="bg-black/20 rounded-2xl px-5 py-3 border border-white/5">
                      <p className="text-xs font-black text-brand-gray/80 uppercase tracking-widest mb-1">{t("page.myTrips.price")}</p>
                      <p className="text-sm font-bold text-white italic">€{Number(trip.price).toFixed(2)}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row lg:flex-col gap-4 min-w-[220px]">
                  <Link
                    href={`/${lang}/my-trips/${trip.id}`}
                    className="flex-1 bg-white/5 text-white border border-white/10 px-8 py-4 rounded-2xl hover:bg-white/10 transition-all font-black uppercase tracking-widest text-xs text-center shadow-xl group/btn"
                  >
                    {t("page.myTrips.manageTrip") || "Gestionar viaje"}
                  </Link>
                  <button
                    onClick={() => setDeleteModal({ isOpen: true, trip })}
                    className="flex-1 bg-brand-pink/10 text-brand-pink border border-brand-pink/20 px-8 py-4 rounded-2xl hover:bg-brand-pink/20 transition-all font-black uppercase tracking-widest text-xs text-center group/delete"
                  >
                    {t("page.myTrips.deleteTrip") || "Eliminar"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && deleteModal.trip && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-brand-dark/80 backdrop-blur-md" onClick={() => !deleting && setDeleteModal({ isOpen: false, trip: null })}></div>
          
          <div className="relative w-full max-w-lg bg-brand-dark border border-white/10 rounded-[3rem] p-8 md:p-12 shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="absolute inset-0 bg-hacker-dots opacity-10 pointer-events-none"></div>
            
            <div className="relative text-center space-y-8">
              <div className="w-20 h-20 bg-brand-pink/10 rounded-full flex items-center justify-center mx-auto border border-brand-pink/20">
                <svg className="w-10 h-10 text-brand-pink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>

              <div className="space-y-4">
                <h2 className="text-3xl font-black text-white uppercase italic tracking-tightest">
                  {deleteModal.trip.is_recurring ? t("page.myTrips.deleteRecurringTripTitle") : t("page.myTrips.deleteTrip")}
                </h2>
                <p className="text-brand-gray font-medium uppercase tracking-widest text-xs">
                  {t("page.myTrips.deleteTripConfirm")}
                </p>
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5 inline-block text-brand-cyan font-black text-xs tracking-widest uppercase">
                  {deleteModal.trip.departure_location} → {deleteModal.trip.arrival_location}
                </div>
              </div>

              <div className="flex flex-col gap-4 pt-4">
                {deleteModal.trip.is_recurring ? (
                  <>
                    <button
                      onClick={() => handleDelete(false)}
                      disabled={deleting}
                      className="w-full bg-white/5 text-white border border-white/10 py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs transition-all hover:bg-white/10 active:scale-95 disabled:opacity-50"
                    >
                      {deleting ? "..." : t("page.myTrips.deleteOnlyThis")}
                    </button>
                    <button
                      onClick={() => handleDelete(true)}
                      disabled={deleting}
                      className="w-full bg-brand-gradient text-white py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs transition-all hover:scale-[1.03] active:scale-95 shadow-xl shadow-brand-cyan/20 disabled:opacity-50"
                    >
                      {deleting ? "..." : t("page.myTrips.deleteAllRecurring")}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleDelete(false)}
                    disabled={deleting}
                    className="w-full bg-brand-gradient text-white py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs transition-all hover:scale-[1.03] active:scale-95 shadow-xl shadow-brand-cyan/20 disabled:opacity-50"
                  >
                    {deleting ? "..." : t("page.myTrips.deleteTrip")}
                  </button>
                )}
                
                <button
                  onClick={() => setDeleteModal({ isOpen: false, trip: null })}
                  disabled={deleting}
                  className="w-full text-brand-gray/60 hover:text-white transition-colors font-black uppercase tracking-[0.2em] text-[10px] py-2"
                >
                  {t("page.createTrip.cancel") || "Cancelar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
