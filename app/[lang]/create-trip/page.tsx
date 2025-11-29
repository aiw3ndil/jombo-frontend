"use client";
import { useState, useEffect } from "react";
import { useTranslation } from "@/app/hooks/useTranslation";
import { useRouter, useParams } from "next/navigation";
import { createTrip } from "@/app/lib/api/trips";
import { useAuth } from "@/app/contexts/AuthContext";

export default function CreateTrip() {
  const { t } = useTranslation();
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

  // Mostrar loading mientras se verifica la autenticación
  if (authLoading) {
    return (
      <div className="max-w-2xl mx-auto">
        <p className="text-gray-100">{t("page.createTrip.loading") || "Cargando..."}</p>
      </div>
    );
  }

  // No mostrar nada si no está autenticado (mientras redirige)
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
    
    // Validar campos requeridos
    if (!formData.from || !formData.to || !formData.date || !formData.time) {
      alert(t("page.createTrip.requiredFields") || "Por favor completa todos los campos requeridos");
      return;
    }

    setLoading(true);

    try {
      // Combinar fecha y hora en formato ISO
      const departureTime = `${formData.date}T${formData.time}:00`;

      await createTrip({
        departure_location: formData.from,
        arrival_location: formData.to,
        departure_time: departureTime,
        available_seats: Number(formData.availableSeats),
        price: Number(formData.pricePerSeat),
        description: formData.description || undefined,
      });
      
      alert(t("page.createTrip.success") || "Viaje creado exitosamente");
      router.push(`/${lang}`);
    } catch (error) {
      console.error("Error creating trip:", error);
      const errorMessage = (error as any)?.message || t("page.createTrip.error") || "Error al crear el viaje";
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-100 mb-6">
        {t("page.createTrip.title")}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-100 mb-2">
            {t("page.createTrip.from")} *
          </label>
          <input
            type="text"
            name="from"
            value={formData.from}
            onChange={handleChange}
            className="w-full border border-gray-300 p-2 rounded text-gray-100 placeholder:text-gray-400"
            placeholder={t("page.createTrip.fromPlaceholder")}
            required
          />
        </div>

        <div>
          <label className="block text-gray-100 mb-2">
            {t("page.createTrip.to")} *
          </label>
          <input
            type="text"
            name="to"
            value={formData.to}
            onChange={handleChange}
            className="w-full border border-gray-300 p-2 rounded text-gray-100 placeholder:text-gray-400"
            placeholder={t("page.createTrip.toPlaceholder")}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-100 mb-2">
              {t("page.createTrip.date")} *
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full border border-gray-300 p-2 rounded text-gray-100"
              required
            />
          </div>

          <div>
            <label className="block text-gray-100 mb-2">
              {t("page.createTrip.time")} *
            </label>
            <input
              type="time"
              name="time"
              value={formData.time}
              onChange={handleChange}
              className="w-full border border-gray-300 p-2 rounded text-gray-100"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-100 mb-2">
              {t("page.createTrip.availableSeats")} *
            </label>
            <input
              type="number"
              name="availableSeats"
              value={formData.availableSeats}
              onChange={handleChange}
              min="1"
              max="8"
              className="w-full border border-gray-300 p-2 rounded text-gray-100"
              required
            />
          </div>

          <div>
            <label className="block text-gray-100 mb-2">
              {t("page.createTrip.pricePerSeat")} *
            </label>
            <input
              type="number"
              name="pricePerSeat"
              value={formData.pricePerSeat}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="w-full border border-gray-300 p-2 rounded text-gray-100"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-gray-100 mb-2">
            {t("page.createTrip.description")}
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="w-full border border-gray-300 p-2 rounded text-gray-100 placeholder:text-gray-400"
            placeholder={t("page.createTrip.descriptionPlaceholder")}
          />
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
          >
            {loading ? t("page.createTrip.creating") || "Creando..." : t("page.createTrip.submit")}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            disabled={loading}
            className="flex-1 bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {t("page.createTrip.cancel")}
          </button>
        </div>
      </form>
    </div>
  );
}
