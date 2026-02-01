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
  });

  const [loading, setLoading] = useState(false);

  // Redirigir al login si no está autenticado
  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/${lang}/login?redirect=/${lang}/create-trip`);
    }
  }, [user, authLoading, router, lang]);

  // Wait for translations to load
  if (translationsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 rounded-full border-4 border-white/5 border-t-brand-cyan animate-spin"></div>
          <div className="absolute inset-2 rounded-full border-4 border-white/5 border-t-brand-purple animate-spin" style={{ animationDuration: '1.5s' }}></div>
        </div>
      </div>
    );
  }

  if (authLoading) {
    return (
      <div className="max-w-2xl mx-auto py-24 px-6 flex flex-col items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 bg-white/5 rounded-full mb-4"></div>
          <p className="text-brand-gray uppercase tracking-widest text-xs font-black">{t("page.createTrip.loading") || "Cargando..."}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.from || !formData.to || !formData.date || !formData.time) {
      toast.error(t("page.createTrip.requiredFields") || "Por favor completa todos los campos requeridos");
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
      });
      toast.success(t("page.createTrip.success") || "Viaje creado exitosamente");
      router.push(`/${lang}`);
    } catch (error) {
      console.error("Error creating trip:", error);
      const errorMessage = (error as any)?.message || t("page.createTrip.error") || "Error al crear el viaje";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 relative">
      <div className="absolute top-0 left-0 -translate-y-1/2 -translate-x-1/4 w-[400px] h-[400px] bg-brand-purple/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-hacker-dots opacity-5 pointer-events-none"></div>

        <div className="relative mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tightest uppercase italic mb-4">
            {t("page.createTrip.title")}
          </h1>
          <p className="text-brand-gray font-medium uppercase tracking-[0.2em] text-xs">
            Comparte tu viaje y ahorra en comunidad
          </p>
        </div>

        <form onSubmit={handleSubmit} className="relative space-y-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-brand-gray uppercase tracking-[0.2em] ml-4">
                {t("page.createTrip.from")} *
              </label>
              <div className="relative group/input">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-gray group-focus-within/input:text-brand-cyan transition-colors z-10">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                </div>
                <LocationInput
                  name="from"
                  value={formData.from}
                  onChange={(val: string) => setFormData(prev => ({ ...prev, from: val }))}
                  className="w-full bg-black/20 border border-white/5 rounded-2xl pl-14 pr-6 py-4 text-white placeholder:text-brand-gray/30 focus:border-brand-cyan/50 focus:ring-0 transition-all outline-none font-bold italic"
                  placeholder={t("page.createTrip.fromPlaceholder")}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-black text-brand-gray uppercase tracking-[0.2em] ml-4">
                {t("page.createTrip.to")} *
              </label>
              <div className="relative group/input">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-gray group-focus-within/input:text-brand-purple transition-colors z-10">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                </div>
                <LocationInput
                  name="to"
                  value={formData.to}
                  onChange={(val: string) => setFormData(prev => ({ ...prev, to: val }))}
                  className="w-full bg-black/20 border border-white/5 rounded-2xl pl-14 pr-6 py-4 text-white placeholder:text-brand-gray/30 focus:border-brand-purple/50 focus:ring-0 transition-all outline-none font-bold italic"
                  placeholder={t("page.createTrip.toPlaceholder")}
                  required
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="space-y-2 col-span-2 md:col-span-1">
              <label className="block text-[10px] font-black text-brand-gray uppercase tracking-[0.2em] ml-4">
                {t("page.createTrip.date")} *
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full bg-black/20 border border-white/5 rounded-2xl px-6 py-4 text-white focus:border-brand-cyan/50 focus:ring-0 transition-all outline-none font-bold italic"
                required
              />
            </div>

            <div className="space-y-2 col-span-2 md:col-span-1">
              <label className="block text-[10px] font-black text-brand-gray uppercase tracking-[0.2em] ml-4">
                {t("page.createTrip.time")} *
              </label>
              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                className="w-full bg-black/20 border border-white/5 rounded-2xl px-6 py-4 text-white focus:border-brand-cyan/50 focus:ring-0 transition-all outline-none font-bold italic"
                required
              />
            </div>

            <div className="space-y-2 col-span-2 md:col-span-1">
              <label className="block text-[10px] font-black text-brand-gray uppercase tracking-[0.2em] ml-4">
                {t("page.createTrip.availableSeats")} *
              </label>
              <input
                type="number"
                name="availableSeats"
                value={formData.availableSeats}
                onChange={handleChange}
                min="1"
                max="8"
                className="w-full bg-black/20 border border-white/5 rounded-2xl px-6 py-4 text-white focus:border-brand-cyan/50 focus:ring-0 transition-all outline-none font-bold italic text-center"
                required
              />
            </div>

            <div className="space-y-2 col-span-2 md:col-span-1">
              <label className="block text-[10px] font-black text-brand-gray uppercase tracking-[0.2em] ml-4">
                {t("page.createTrip.pricePerSeat")} *
              </label>
              <div className="relative">
                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-cyan font-black text-sm">€</span>
                <input
                  type="number"
                  name="pricePerSeat"
                  value={formData.pricePerSeat}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="w-full bg-black/20 border border-white/5 rounded-2xl pl-12 pr-6 py-4 text-white focus:border-brand-cyan/50 focus:ring-0 transition-all outline-none font-bold italic"
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] font-black text-brand-gray uppercase tracking-[0.2em] ml-4">
              {t("page.createTrip.description")}
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full bg-black/20 border border-white/5 rounded-3xl px-6 py-4 text-white placeholder:text-brand-gray/30 focus:border-brand-cyan/50 focus:ring-0 transition-all outline-none font-medium italic resize-none"
              placeholder={t("page.createTrip.descriptionPlaceholder")}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-6 pt-8">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-brand-gradient text-white px-8 py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs transition-all hover:scale-[1.03] active:scale-95 shadow-2xl shadow-brand-cyan/20 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed group"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {t("page.createTrip.creating") || "Procesando..."}
                </span>
              ) : t("page.createTrip.submit") || "Publicar Viaje"}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              disabled={loading}
              className="px-12 py-5 rounded-[2rem] bg-white/5 text-brand-gray hover:text-white hover:bg-white/10 border border-white/5 transition-all font-black uppercase tracking-[0.2em] text-xs disabled:opacity-50"
            >
              {t("page.createTrip.cancel")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
