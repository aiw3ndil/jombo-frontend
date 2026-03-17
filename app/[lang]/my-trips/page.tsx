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
    <div className="min-h-screen bg-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Cabecera */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-green-900 mb-2">
              {t("page.myTrips.title") || "Mis Viajes"}
            </h1>
            <p className="text-green-700 text-lg">
              {t("page.myTrips.subtitle") || "Gestiona los viajes que has publicado"}
            </p>
          </div>
          <Link href={`/${lang}/create-trip`} className="btn-primary px-8 py-4 text-base whitespace-nowrap">
            {t("page.myTrips.createTrip") || "Publicar viaje"}
          </Link>
        </div>

        {/* Lista de viajes */}
        {trips.length === 0 ? (
          <div className="text-center py-20 bg-green-50 rounded-[2.5rem] border-2 border-green-100">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </div>
            <p className="text-2xl text-green-900 font-bold mb-4">
              {t("page.myTrips.noTrips") || "No has publicado ningún viaje"}
            </p>
            <Link href={`/${lang}/create-trip`} className="text-green-600 font-bold underline text-lg">
              {t("page.myTrips.createTripInfo") || "¡Publica tu primer viaje ahora!"}
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {trips.map((trip) => (
              <div key={trip.id} className="result-card">
                <div className="flex flex-col lg:flex-row justify-between gap-8">
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-2 text-green-600 font-bold uppercase tracking-wider text-sm">
                      <span>{new Date(trip.departure_time).toLocaleDateString(lang, { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-green-300"></span>
                      <span className="text-green-800">{new Date(trip.departure_time).toLocaleTimeString(lang, { hour: '2-digit', minute: '2-digit' })} h</span>
                      {trip.is_recurring && (
                        <span className="ml-2 bg-green-100 text-green-700 px-3 py-1 rounded-full text-[10px] border border-green-200">RECURRENTE</span>
                      )}
                    </div>

                    <h3 className="text-3xl font-bold text-green-900 leading-tight">
                      {trip.departure_location} → {trip.arrival_location}
                    </h3>

                    <div className="flex flex-wrap gap-6 mt-4">
                      <div className="bg-green-50 rounded-xl px-5 py-3 border border-green-100">
                        <p className="text-xs font-bold text-green-500 uppercase tracking-widest mb-1">{t("page.myTrips.availableSeats") || "PLAZAS"}</p>
                        <p className={`text-xl font-bold ${trip.available_seats === 0 ? "text-red-500" : "text-green-900"}`}>
                          {trip.available_seats} <span className="text-sm">libres</span>
                        </p>
                      </div>

                      <div className="bg-green-50 rounded-xl px-5 py-3 border border-green-100">
                        <p className="text-xs font-bold text-green-500 uppercase tracking-widest mb-1">{t("page.myTrips.price") || "PRECIO"}</p>
                        <p className="text-xl font-bold text-green-900 italic">€{Number(trip.price).toFixed(2)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row lg:flex-col gap-3 min-w-[200px] justify-center">
                    <Link
                      href={`/${lang}/my-trips/${trip.id}`}
                      className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-bold text-center transition-all shadow-md"
                    >
                      {t("page.myTrips.manageTrip") || "Gestionar"}
                    </Link>
                    <button
                      onClick={() => setDeleteModal({ isOpen: true, trip })}
                      className="bg-white border-2 border-red-100 text-red-600 px-6 py-3 rounded-xl font-bold hover:bg-red-50 transition-all"
                    >
                      {t("page.myTrips.deleteTrip") || "Eliminar"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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
                  {deleteModal.trip.is_recurring ? "¿Eliminar recurrencia?" : "¿Eliminar viaje?"}
                </h2>
                <p className="text-gray-600 text-lg">
                  {t("page.myTrips.deleteConfirm") || "Esta acción borrará el viaje y todas sus reservas."}
                </p>
                <div className="text-green-800 font-bold bg-green-50 p-3 rounded-xl inline-block mt-4 border border-green-100">
                  {deleteModal.trip.departure_location} → {deleteModal.trip.arrival_location}
                </div>
              </div>

              <div className="flex flex-col gap-4 pt-6">
                {deleteModal.trip.is_recurring ? (
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
