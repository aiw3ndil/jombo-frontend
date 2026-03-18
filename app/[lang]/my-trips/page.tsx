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
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-white">
      {/* ── HERO ── */}
      <section className="bg-green-50 border-b-2 border-green-100 py-20 px-4">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 bg-green-100 border border-green-300 text-green-800 px-5 py-2 rounded-full text-sm font-bold mb-6 uppercase tracking-wide">
              <span className="w-2 h-2 rounded-full bg-green-600"></span>
              {t("page.myTrips.badge") || "Panel de Conductor"}
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-green-900 leading-tight mb-6">
              {t("page.myTrips.title") || "Mis Viajes"}
            </h1>
            <p className="text-xl md:text-2xl text-green-700 max-w-2xl leading-relaxed font-normal">
              {t("page.myTrips.subtitle") || "Gestiona los trayectos que has publicado y activa nuevas rutas."}
            </p>
          </div>
          <Link 
            href={`/${lang}/create-trip`} 
            className="btn-primary px-12 py-5 shadow-xl hover:scale-105 transform transition-all active:scale-95"
          >
            <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {t("page.myTrips.createTrip") || "Publicar nuevo viaje"}
          </Link>
        </div>
      </section>

      {/* ── CONTENIDO ── */}
      <section className="py-20 px-4 min-h-[50vh]">
        <div className="max-w-5xl mx-auto">
          {trips.length === 0 ? (
            <div className="text-center py-24 bg-green-50/50 rounded-[3rem] border-2 border-dashed border-green-200">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-sm border-2 border-green-100 text-green-600">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-green-900 mb-4">
                {t("page.myTrips.noTrips") || "Aún no has publicado nada"}
              </h2>
              <p className="text-green-700 text-lg mb-12 max-w-md mx-auto font-medium">
                {t("page.myTrips.createTripInfo") || "Comparte tu coche, ahorra gastos y ayuda al planeta publicando tu primer viaje."}
              </p>
              <Link href={`/${lang}/create-trip`} className="btn-primary px-12 py-5 shadow-lg">
                {t("page.myTrips.createTrip") || "Publicar mi primer viaje"}
              </Link>
            </div>
          ) : (
            <div className="space-y-10">
              {trips.map((trip) => (
                <div key={trip.id} className="result-card group">
                  {/* Decoración lateral */}
                  <div className="absolute top-0 left-0 w-2 h-full bg-green-500 group-hover:bg-green-600 transition-colors"></div>

                  <div className="flex flex-col xl:flex-row justify-between gap-10">
                    <div className="flex-1 space-y-8">
                      <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-2 text-green-600 font-bold bg-green-50 px-5 py-2 rounded-full border border-green-100 shadow-sm">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="uppercase tracking-wider">{new Date(trip.departure_time).toLocaleDateString(lang, { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                          <span className="text-green-300 mx-1">|</span>
                          <span className="text-green-800">{new Date(trip.departure_time).toLocaleTimeString(lang, { hour: '2-digit', minute: '2-digit' })}h</span>
                        </div>
                        {trip.is_recurring && (
                          <span className="bg-green-600 text-white px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest shadow-md">RECURRENTE</span>
                        )}
                      </div>

                      <div className="space-y-2">
                         <h3 className="text-4xl font-bold text-green-900 leading-tight tracking-tight">
                            {trip.departure_location} <span className="text-green-300 mx-2">→</span> {trip.arrival_location}
                        </h3>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="bg-green-50/30 border-2 border-green-100 rounded-[1.5rem] p-5 hover:bg-white hover:border-green-300 transition-all shadow-sm">
                          <p className="text-xs font-bold text-green-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                             {t("page.myTrips.availableSeats") || "PLAZAS DISPONIBLES"}
                          </p>
                          <p className={`text-2xl font-black ${trip.available_seats === 0 ? "text-red-500" : "text-green-900"}`}>
                            {trip.available_seats} <span className="text-base font-bold text-green-700/60 lowercase">libres</span>
                          </p>
                        </div>

                        <div className="bg-green-50/30 border-2 border-green-100 rounded-[1.5rem] p-5 hover:bg-white hover:border-green-300 transition-all shadow-sm">
                          <p className="text-xs font-bold text-green-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                             {t("page.myTrips.price") || "PRECIO POR PERSONA"}
                          </p>
                          <p className="text-2xl font-black text-green-700 italic">€{Number(trip.price).toFixed(2)}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row xl:flex-col gap-4 min-w-[240px] justify-center items-stretch">
                      <Link
                        href={`/${lang}/my-trips/${trip.id}`}
                        className="btn-primary w-full shadow-lg"
                      >
                        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        {t("page.myTrips.manageTrip") || "Gestionar viaje"}
                      </Link>
                      <button
                        onClick={() => setDeleteModal({ isOpen: true, trip })}
                        className="bg-white border-2 border-red-100 text-red-600 px-8 py-5 rounded-2xl font-bold hover:bg-red-50 hover:border-red-200 transition-all shadow-sm text-lg active:scale-95 flex items-center justify-center"
                      >
                        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        {t("page.myTrips.deleteTrip") || "Eliminar"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Modal de eliminación */}
      {deleteModal.isOpen && deleteModal.trip && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-green-900/40 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl border-2 border-red-50">
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto border-2 border-red-50">
                <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>

              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-red-700">
                  {deleteModal.trip?.is_recurring ? "¿Eliminar recurrencia?" : "¿Eliminar viaje?"}
                </h2>
                <p className="text-gray-600 text-lg">
                  {t("page.myTrips.deleteConfirm") || "Esta acción borrará el viaje y todas sus reservas."}
                </p>
                <div className="text-green-800 font-bold bg-green-50 p-3 rounded-xl inline-block mt-4 border border-green-100">
                  {deleteModal.trip?.departure_location} → {deleteModal.trip?.arrival_location}
                </div>
              </div>

              <div className="flex flex-col gap-4 pt-6">
                {deleteModal.trip?.is_recurring ? (
                  <>
                    <button
                      onClick={() => handleDelete(false)}
                      disabled={deleting}
                      className="w-full bg-white border-2 border-red-600 text-red-700 py-4 rounded-xl font-bold hover:bg-red-50 transition-all"
                    >
                      {deleting ? "..." : t("page.myTrips.deleteOnlyThis") || "Solo este viaje"}
                    </button>
                    <button
                      onClick={() => handleDelete(true)}
                      disabled={deleting}
                      className="w-full bg-red-600 text-white py-4 rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg"
                    >
                      {deleting ? "..." : t("page.myTrips.deleteAllRecurring") || "Todos los recurrentes"}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleDelete(false)}
                    disabled={deleting}
                    className="w-full bg-red-600 text-white py-4 rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg"
                  >
                    {deleting ? "..." : t("page.myTrips.deleteTrip") || "Confirmar eliminación"}
                  </button>
                )}
                
                <button
                  onClick={() => setDeleteModal({ isOpen: false, trip: null })}
                  disabled={deleting}
                  className="text-gray-500 font-bold hover:text-gray-700 transition-colors uppercase tracking-widest text-sm pt-2"
                >
                  {t("common.cancel") || "Cancelar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
