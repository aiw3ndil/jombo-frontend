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
    <div className="min-h-screen bg-green-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Título */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-green-900 mb-2">
            {t("page.createTrip.title") || "Publicar un viaje"}
          </h1>
          <p className="text-green-700 text-lg">Comparte tu ruta y ahorra en comunidad</p>
        </div>

        {/* Card del formulario */}
        <div className="form-card">
          <form onSubmit={handleSubmit} className="space-y-7">

            {/* Origen y Destino */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="form-label">{t("page.createTrip.from") || "Origen"} *</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-green-500">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                  </div>
                  <LocationInput
                    name="from"
                    value={formData.from}
                    onChange={(val: string) => setFormData((prev) => ({ ...prev, from: val }))}
                    className="form-input form-input-icon"
                    placeholder={t("page.createTrip.fromPlaceholder") || "Ciudad de salida"}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="form-label">{t("page.createTrip.to") || "Destino"} *</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-green-500">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                  </div>
                  <LocationInput
                    name="to"
                    value={formData.to}
                    onChange={(val: string) => setFormData((prev) => ({ ...prev, to: val }))}
                    className="form-input form-input-icon"
                    placeholder={t("page.createTrip.toPlaceholder") || "Ciudad de destino"}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Fecha, Hora, Asientos, Precio, Región */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              <div className="col-span-2 md:col-span-1">
                <label className="form-label">{t("page.createTrip.date") || "Fecha"} *</label>
                <input type="date" name="date" value={formData.date} onChange={handleChange} className="form-input" required />
              </div>
              <div className="col-span-2 md:col-span-1">
                <label className="form-label">{t("page.createTrip.time") || "Hora"} *</label>
                <input type="time" name="time" value={formData.time} onChange={handleChange} className="form-input" required />
              </div>
              <div className="col-span-1">
                <label className="form-label">{t("page.createTrip.availableSeats") || "Plazas"} *</label>
                <input type="number" name="availableSeats" value={formData.availableSeats} onChange={handleChange} min="1" max="8" className="form-input text-center" required />
              </div>
              <div className="col-span-1">
                <label className="form-label">{t("page.createTrip.pricePerSeat") || "Precio/plaza"} *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-green-600 font-bold">€</span>
                  <input type="number" name="pricePerSeat" value={formData.pricePerSeat} onChange={handleChange} min="0" step="0.01" className="form-input form-input-icon" required />
                </div>
              </div>
            </div>

            {/* Región */}
            <div className="max-w-xs">
              <label className="form-label">{t("page.createTrip.region") || "Región"} *</label>
              <div className="relative">
                <select name="region" value={formData.region} onChange={handleChange} className="form-select" required>
                  <option value="es">{t("page.createTrip.regionSpain") || "España"}</option>
                  <option value="fi">{t("page.createTrip.regionFinland") || "Finlandia"}</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500 pointer-events-none">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Descripción */}
            <div>
              <label className="form-label">{t("page.createTrip.description") || "Descripción (opcional)"}</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="form-input"
                placeholder={t("page.createTrip.descriptionPlaceholder") || "Añade información útil para los pasajeros..."}
              />
            </div>

            {/* Viaje recurrente */}
            <div className="section-pale">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-green-900 text-lg">{t("page.createTrip.recurring") || "Viaje recurrente"}</h3>
                  <p className="text-green-700 text-sm mt-1">{t("page.createTrip.recurrenceInfo") || "Este viaje se repite con regularidad"}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="is_recurring"
                    checked={formData.is_recurring}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-14 h-7 bg-green-200 rounded-full peer peer-checked:bg-green-600 after:content-[''] after:absolute after:top-[4px] after:start-[4px] after:bg-white after:rounded-full after:h-5 after:w-6 after:transition-all peer-checked:after:translate-x-full"></div>
                </label>
              </div>

              {formData.is_recurring && (
                <div className="grid md:grid-cols-2 gap-5 mt-5">
                  <div>
                    <label className="form-label">{t("page.createTrip.recurrencePattern") || "Frecuencia"}</label>
                    <div className="relative">
                      <select name="recurrence_pattern" value={formData.recurrence_pattern} onChange={handleChange} className="form-select">
                        <option value="daily">{t("page.createTrip.daily") || "Diario"}</option>
                        <option value="weekly">{t("page.createTrip.weekly") || "Semanal"}</option>
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500 pointer-events-none">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="form-label">{t("page.createTrip.until") || "Hasta la fecha"}</label>
                    <input
                      type="date"
                      name="recurrence_until"
                      value={formData.recurrence_until}
                      onChange={handleChange}
                      min={formData.date || new Date().toISOString().split("T")[0]}
                      className="form-input"
                      required={formData.is_recurring}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Botones */}
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-bold text-lg transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {t("page.createTrip.creating") || "Publicando..."}
                  </span>
                ) : t("page.createTrip.submit") || "Publicar Viaje"}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                disabled={loading}
                className="px-10 py-4 rounded-xl bg-white border-2 border-green-200 text-green-700 hover:bg-green-50 font-bold text-lg transition-colors disabled:opacity-50"
              >
                {t("page.createTrip.cancel") || "Cancelar"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}