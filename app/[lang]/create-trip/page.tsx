"use client";
import { useState, useEffect } from "react";
import { useTranslation } from "@/app/hooks/useTranslation";
import { useRouter, useParams } from "next/navigation";
import { createTrip } from "@/app/lib/api/trips";
import { useAuth } from "@/app/contexts/AuthContext";
import { toast } from "sonner";
import LocationInput from "@/app/components/LocationInput";

export default function CreateTrip() {
  const { t, loading: translationsLoading } = useTranslation();
  const router = useRouter();
  const params = useParams();
  const lang = (params?.lang as string) || "es";
  const { user, loading: authLoading } = useAuth();

  const [formData, setFormData] = useState({
    from: "",
    to: "",
    date: "",
    time: "",
    availableSeats: 1,
    pricePerSeat: 0,
    description: "",
    region: "",
    is_recurring: false,
    recurrence_pattern: "daily",
    recurrence_until: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/${lang}/login?redirect=/${lang}/create-trip`);
    } else if (user && !formData.region) {
      setFormData((prev) => ({ ...prev, region: user.region || (lang === "fi" ? "fi" : "es") }));
    }
  }, [user, authLoading, router, lang, formData.region]);

  if (translationsLoading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!user) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === "checkbox" ? (e.target as HTMLInputElement).checked : value;
    setFormData((prev) => ({ ...prev, [name]: val }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.from || !formData.to || !formData.date || !formData.time) {
      toast.error(t("page.createTrip.requiredFields") || "Por favor completa todos los campos requeridos");
      return;
    }
    if (formData.is_recurring && !formData.recurrence_until) {
      toast.error("Por favor indica hasta cuándo se repite el viaje");
      return;
    }
    setLoading(true);
    try {
      const departureTime = `${formData.date}T${formData.time}:00`;
      await createTrip({
        departure_location: formData.from,
        arrival_location: formData.to,
        departure_time: departureTime,
        available_seats: Number(formData.availableSeats),
        price: Number(formData.pricePerSeat),
        description: formData.description || undefined,
        region: formData.region,
        is_recurring: formData.is_recurring,
        recurrence_pattern: formData.is_recurring ? formData.recurrence_pattern : undefined,
        recurrence_until:
          formData.is_recurring && formData.recurrence_until
            ? `${formData.recurrence_until}T${formData.time}:00`
            : undefined,
      });
      toast.success(t("page.createTrip.success") || "Viaje creado exitosamente");
      router.push(`/${lang}`);
    } catch (error) {
      const errorMessage = (error as any)?.message || t("page.createTrip.error") || "Error al crear el viaje";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* ── HERO ── */}
      <section className="bg-green-50 border-b-2 border-green-100 py-24 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-green-100 border border-green-300 text-green-800 px-5 py-2 rounded-full text-sm font-bold mb-6 uppercase tracking-wide">
            <span className="w-2 h-2 rounded-full bg-green-600 animate-pulse"></span>
            {t("page.createTrip.badge") || "Nuevo Trayecto"}
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-green-900 leading-tight mb-6">
            {t("page.createTrip.title") || "Publicar un viaje"}
          </h1>
          <p className="text-xl md:text-2xl text-green-700 max-w-3xl mx-auto leading-relaxed font-normal">
            {t("page.createTrip.subtitle") || "Comparte tu ruta, ahorra gastos y ayuda a construir una comunidad más sostenible."}
          </p>
        </div>
      </section>

      {/* ── FORMULARIO ── */}
      <section className="py-24 px-4 bg-white relative -mt-10">
        <div className="max-w-4xl mx-auto">
          <div className="form-card relative z-10">
            <form onSubmit={handleSubmit} className="space-y-12">
              <div className="space-y-10">
                {/* Paso 1: Ruta */}
                <div className="space-y-6">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="w-10 h-10 rounded-full bg-green-700 flex items-center justify-center text-white font-bold shadow-md">1</div>
                    <h2 className="text-2xl font-bold text-green-900">{t("page.createTrip.routeStep") || "Detalles de la ruta"}</h2>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <label className="form-label">{t("page.createTrip.from") || "Punto de Origen"} *</label>
                      <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-green-400 group-focus-within:text-green-600 transition-colors z-10">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          </svg>
                        </div>
                        <LocationInput
                          name="from"
                          value={formData.from}
                          onChange={(val: string) => setFormData((prev) => ({ ...prev, from: val }))}
                          className="form-input pl-14"
                          placeholder={t("page.createTrip.fromPlaceholder") || "¿Desde dónde sales?"}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="form-label">{t("page.createTrip.to") || "Punto de Destino"} *</label>
                      <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-green-400 group-focus-within:text-green-600 transition-colors z-10">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          </svg>
                        </div>
                        <LocationInput
                          name="to"
                          value={formData.to}
                          onChange={(val: string) => setFormData((prev) => ({ ...prev, to: val }))}
                          className="form-input pl-14"
                          placeholder={t("page.createTrip.toPlaceholder") || "¿A dónde vas?"}
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="h-px bg-green-50 w-full"></div>

                {/* Paso 2: Horario y Plazas */}
                <div className="space-y-6">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="w-10 h-10 rounded-full bg-green-700 flex items-center justify-center text-white font-bold shadow-md">2</div>
                    <h2 className="text-2xl font-bold text-green-900">{t("page.createTrip.timeStep") || "Fecha, hora y precio"}</h2>
                  </div>

                  <div className="grid md:grid-cols-4 gap-6">
                    <div className="md:col-span-1">
                      <label className="form-label">{t("page.createTrip.date") || "Fecha"} *</label>
                      <input 
                        type="date" 
                        name="date" 
                        value={formData.date} 
                        onChange={handleChange} 
                        className="form-input cursor-pointer" 
                        required 
                      />
                    </div>
                    <div className="md:col-span-1">
                      <label className="form-label">{t("page.createTrip.time") || "Hora"} *</label>
                      <input 
                        type="time" 
                        name="time" 
                        value={formData.time} 
                        onChange={handleChange} 
                        className="form-input cursor-pointer" 
                        required 
                      />
                    </div>
                    <div className="md:col-span-1">
                      <label className="form-label">{t("page.createTrip.availableSeats") || "Asientos"} *</label>
                      <div className="relative">
                         <input 
                          type="number" 
                          name="availableSeats" 
                          value={formData.availableSeats} 
                          onChange={handleChange} 
                          min="1" 
                          max="8" 
                          className="form-input text-center font-bold" 
                          required 
                        />
                      </div>
                    </div>
                    <div className="md:col-span-1">
                      <label className="form-label">{t("page.createTrip.pricePerSeat") || "Precio"} *</label>
                      <div className="relative group">
                        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-green-600 font-black text-xl z-10 group-focus-within:text-green-800 transition-colors">€</span>
                        <input 
                          type="number" 
                          name="pricePerSeat" 
                          value={formData.pricePerSeat} 
                          onChange={handleChange} 
                          min="0" 
                          step="0.01" 
                          className="form-input pl-12 font-black text-xl text-green-700" 
                          required 
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="h-px bg-green-50 w-full"></div>

                {/* Paso 3: Información adicional */}
                <div className="space-y-6">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="w-10 h-10 rounded-full bg-green-700 flex items-center justify-center text-white font-bold shadow-md">3</div>
                    <h2 className="text-2xl font-bold text-green-900">{t("page.createTrip.additionalStep") || "Configuración avanzada"}</h2>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <label className="form-label">{t("page.createTrip.region") || "Región del viaje"} *</label>
                      <div className="relative">
                        <select 
                          name="region" 
                          value={formData.region} 
                          onChange={handleChange} 
                          className="form-select pr-12 font-bold"
                          required
                        >
                          <option value="es">🇪🇸 {t("page.createTrip.regionSpain") || "España"}</option>
                          <option value="fi">🇫🇮 {t("page.createTrip.regionFinland") || "Finlandia"}</option>
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500 pointer-events-none">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="form-label">{t("page.createTrip.description") || "Mensaje para pasajeros"}</label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={1}
                        className="form-input resize-none py-4"
                        placeholder={t("page.createTrip.descriptionPlaceholder") || "¿Algo que deban saber?"}
                      />
                    </div>
                  </div>

                  {/* Recurrencia */}
                  <div className="bg-green-50/50 border-2 border-green-100 rounded-[2rem] p-8 md:p-10 transition-all hover:bg-green-50">
                    <div className="flex items-center justify-between gap-6">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-green-900 mb-1 flex items-center gap-2">
                          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          {t("page.createTrip.recurring") || "Viaje recurrente"}
                        </h3>
                        <p className="text-green-700 font-medium">{t("page.createTrip.recurrenceInfo") || "Automatiza la publicación de este viaje según una frecuencia."}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer scale-125">
                        <input
                          type="checkbox"
                          name="is_recurring"
                          checked={formData.is_recurring}
                          onChange={handleChange}
                          className="sr-only peer"
                        />
                        <div className="w-12 h-6 bg-green-200 rounded-full peer peer-checked:bg-green-700 after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
                      </label>
                    </div>

                    {formData.is_recurring && (
                      <div className="grid md:grid-cols-2 gap-8 mt-10 pt-8 border-t border-green-200 animate-in fade-in slide-in-from-top-4 duration-300">
                        <div>
                          <label className="form-label">{t("page.createTrip.recurrencePattern") || "Frecuencia"}</label>
                          <div className="relative">
                            <select 
                              name="recurrence_pattern" 
                              value={formData.recurrence_pattern} 
                              onChange={handleChange} 
                              className="form-select pr-12 font-bold"
                            >
                              <option value="daily">{t("page.createTrip.daily") || "Todos los días"}</option>
                              <option value="weekly">{t("page.createTrip.weekly") || "Una vez a la semana"}</option>
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500 pointer-events-none">
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </div>
                          </div>
                        </div>
                        <div>
                          <label className="form-label">{t("page.createTrip.until") || "Finalizar repetición"}</label>
                          <input
                            type="date"
                            name="recurrence_until"
                            value={formData.recurrence_until}
                            onChange={handleChange}
                            min={formData.date || new Date().toISOString().split("T")[0]}
                            className="form-input font-bold"
                            required={formData.is_recurring}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex flex-col-reverse md:flex-row gap-6 pt-6">
                <button
                  type="button"
                  onClick={() => router.back()}
                  disabled={loading}
                  className="btn-secondary flex-1 py-6 shadow-sm border-2"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  {t("page.createTrip.cancel") || "Volver atrás"}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary flex-[2] py-6 shadow-2xl relative overflow-hidden group"
                >
                  <span className={`flex items-center justify-center gap-3 transition-all duration-300 ${loading ? 'opacity-0 scale-90' : 'opacity-100 scale-100'}`}>
                    <svg className="w-6 h-6 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    {t("page.createTrip.submit") || "Publicar mi viaje"}
                  </span>
                  {loading && (
                    <span className="absolute inset-0 flex items-center justify-center">
                      <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                    </span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}