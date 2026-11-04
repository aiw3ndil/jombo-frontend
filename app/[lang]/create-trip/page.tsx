"use client";
import { useState, useEffect } from "react";
import { localePath, langPrefix } from "@/app/lib/i18n/config";
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
  const lang = (params?.lang as string) || "fi";
  const { user, loading: authLoading } = useAuth();

  const [formData, setFormData] = useState({
    from: "",
    to: "",
    date: "",
    time: "",
    availableSeats: 1,
    pricePerSeat: 0,
    description: "",
    is_recurring: false,
    recurrence_pattern: "daily",
    recurrence_until: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`${langPrefix(lang)}/login?redirect=${langPrefix(lang)}/create-trip`);
    }
  }, [user, authLoading, router, lang]);

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
      toast.error(t("page.createTrip.requiredFields") || "Please complete all required fields");
      return;
    }
    if (formData.is_recurring && !formData.recurrence_until) {
      toast.error("Please specify until when the trip repeats");
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
        is_recurring: formData.is_recurring,
        recurrence_pattern: formData.is_recurring ? formData.recurrence_pattern : undefined,
        recurrence_until:
          formData.is_recurring && formData.recurrence_until
            ? `${formData.recurrence_until}T${formData.time}:00`
            : undefined,
      });
      toast.success(t("page.createTrip.success") || "Trip published successfully");
      router.push(localePath(lang));
    } catch (error) {
      const errorMessage = (error as any)?.message || t("page.createTrip.error") || "Error publishing trip";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* ── HERO ── */}
      <section className="bg-[#f0f4f8] border-b-2 border-[#e2e8f0] py-8 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-[#e2e8f0] border border-[#e2e8f0] text-[var(--brand-dark)] px-4 py-1.5 rounded-full text-xs font-bold mb-3 uppercase tracking-wide">
            <span className="w-2 h-2 rounded-full bg-[var(--brand-blue)] animate-pulse"></span>
            {t("page.createTrip.badge") || "New trip"}
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-[var(--brand-dark)] leading-tight mb-2">
            {t("page.createTrip.title") || "Publish a trip"}
          </h1>
          <p className="text-sm md:text-base text-[var(--brand-neutral)] max-w-3xl mx-auto leading-relaxed font-normal">
            {t("page.createTrip.subtitle") || "Share your route, save on costs and help build a more sustainable community."}
          </p>
        </div>
      </section>

      {/* ── FORMULARIO ── */}
      <section className="py-24 px-4 bg-white relative -mt-5">
        <div className="max-w-4xl mx-auto">
          <div className="form-card relative z-10">
            <form onSubmit={handleSubmit} className="space-y-12">
              <div className="space-y-10">
                {/* Paso 1: Ruta */}
                <div className="space-y-6">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="w-10 h-10 rounded-full bg-[var(--brand-blue)] flex items-center justify-center text-white font-bold shadow-md">1</div>
                    <h2 className="text-2xl font-bold text-[var(--brand-dark)]">{t("page.createTrip.routeStep") || "Route details"}</h2>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <label className="form-label">{t("page.createTrip.from") || "Origin"} *</label>
                      <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--brand-neutral)] group-focus-within:text-[var(--brand-blue)] transition-colors z-10">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          </svg>
                        </div>
                        <LocationInput
                          name="from"
                          value={formData.from}
                          onChange={(val: string) => setFormData((prev) => ({ ...prev, from: val }))}
                          className="form-input pl-14"
                          placeholder={t("page.createTrip.fromPlaceholder") || "Origin city"}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="form-label">{t("page.createTrip.to") || "Destination"} *</label>
                      <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--brand-neutral)] group-focus-within:text-[var(--brand-blue)] transition-colors z-10">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          </svg>
                        </div>
                        <LocationInput
                          name="to"
                          value={formData.to}
                          onChange={(val: string) => setFormData((prev) => ({ ...prev, to: val }))}
                          className="form-input pl-14"
                          placeholder={t("page.createTrip.toPlaceholder") || "Destination city"}
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="h-px bg-[#f0f4f8] w-full"></div>

                {/* Paso 2: Horario y Plazas */}
                <div className="space-y-6">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="w-10 h-10 rounded-full bg-[var(--brand-blue)] flex items-center justify-center text-white font-bold shadow-md">2</div>
                    <h2 className="text-2xl font-bold text-[var(--brand-dark)]">{t("page.createTrip.timeStep") || "Date, time and price"}</h2>
                  </div>

                  <div className="grid md:grid-cols-4 gap-6">
                    <div className="md:col-span-1">
                      <label className="form-label">{t("page.createTrip.date") || "Date"} *</label>
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
                      <label className="form-label">{t("page.createTrip.time") || "Time"} *</label>
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
                      <label className="form-label">{t("page.createTrip.availableSeats") || "Available seats"} *</label>
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
                      <label className="form-label">{t("page.createTrip.pricePerSeat") || "Price per seat (€)"} *</label>
                      <div className="relative group">
                        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--brand-blue)] font-black text-xl z-10 group-focus-within:text-[var(--brand-dark)] transition-colors">€</span>
                        <input 
                          type="number" 
                          name="pricePerSeat" 
                          value={formData.pricePerSeat} 
                          onChange={handleChange} 
                          min="0" 
                          step="0.01" 
                          className="form-input pl-12 font-black text-xl text-[var(--brand-neutral)]" 
                          required 
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="h-px bg-[#f0f4f8] w-full"></div>

                {/* Paso 3: Información adicional */}
                <div className="space-y-6">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="w-10 h-10 rounded-full bg-[var(--brand-blue)] flex items-center justify-center text-white font-bold shadow-md">3</div>
                    <h2 className="text-2xl font-bold text-[var(--brand-dark)]">{t("page.createTrip.additionalStep") || "Advanced settings"}</h2>
                  </div>

                  <div className="grid gap-8">
                    <div>
                      <label className="form-label">{t("page.createTrip.description") || "Description (optional)"}</label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={1}
                        className="form-input resize-none py-4"
                        placeholder={t("page.createTrip.descriptionPlaceholder") || "Add details about the trip, meeting point, etc."}
                      />
                    </div>
                  </div>

                  {/* Recurrencia */}
                  <div className="bg-[#f0f4f8]/50 border-2 border-[#e2e8f0] rounded-[2rem] p-8 md:p-10 transition-all hover:bg-[#f0f4f8]">
                    <div className="flex items-center justify-between gap-6">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-[var(--brand-dark)] mb-1 flex items-center gap-2">
                          <svg className="w-6 h-6 text-[var(--brand-blue)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          {t("page.createTrip.recurring") || "Recurring trip"}
                        </h3>
                        <p className="text-[var(--brand-neutral)] font-medium">{t("page.createTrip.recurrenceInfo") || "Copies of this trip will be created automatically based on chosen frequency (max. 3 months)."}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer scale-125">
                        <input
                          type="checkbox"
                          name="is_recurring"
                          checked={formData.is_recurring}
                          onChange={handleChange}
                          className="sr-only peer"
                        />
                        <div className="w-12 h-6 bg-green-200 rounded-full peer peer-checked:bg-[var(--brand-blue)] after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
                      </label>
                    </div>

                    {formData.is_recurring && (
                      <div className="grid md:grid-cols-2 gap-8 mt-10 pt-8 border-t border-[#e2e8f0] animate-in fade-in slide-in-from-top-4 duration-300">
                        <div>
                          <label className="form-label">{t("page.createTrip.recurrencePattern") || "Frequency"}</label>
                          <div className="relative">
                            <select 
                              name="recurrence_pattern" 
                              value={formData.recurrence_pattern} 
                              onChange={handleChange} 
                              className="form-select pr-12 font-bold"
                            >
                              <option value="daily">{t("page.createTrip.daily") || "Daily"}</option>
                              <option value="weekly">{t("page.createTrip.weekly") || "Weekly"}</option>
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--brand-blue)] pointer-events-none">
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </div>
                          </div>
                        </div>
                        <div>
                          <label className="form-label">{t("page.createTrip.until") || "Repeat until"}</label>
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
                  {t("page.createTrip.cancel") || "Cancel"}
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
                    {t("page.createTrip.submit") || "Publish trip"}
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