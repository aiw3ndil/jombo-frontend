"use client";
import { useEffect, useState } from "react";
import { useTranslation } from "@/app/hooks/useTranslation";
import { toast } from "sonner";
import LocationInput from "@/app/components/LocationInput";
import VehicleSelector, { VehicleChoice, isVehicleInputComplete } from "@/app/components/VehicleSelector";
import TripPreferencesFields from "@/app/components/TripPreferencesFields";
import { useGoogleMaps } from "@/app/contexts/GoogleMapsContext";
import {
  DEFAULT_PREFERENCES,
  maxPriceFor,
  suggestedPriceFor,
  type CreateTripData,
  type Trip,
  type TripPreferencesData,
} from "@/app/lib/api/trips";

type StopRow = { location: string; date: string; time: string; price: string };

/** Valores iniciales opcionales (p. ej. al responder a una petición de viaje) */
export type TripFormInitial = {
  from?: string;
  to?: string;
  date?: string;
  seats?: number;
  price?: number;
  description?: string;
  preferences?: Partial<TripPreferencesData>;
  /** Paradas intermedias (solo el lugar; hora y precio los pone el conductor) */
  stops?: string[];
  vehicleId?: number | null;
};

/** Valores iniciales para publicar el viaje de vuelta de `trip`: ruta y paradas al revés, sin fecha */
export function returnTripInitial(trip: Trip): TripFormInitial {
  const preferences: Partial<TripPreferencesData> = {};
  (Object.keys(DEFAULT_PREFERENCES) as (keyof TripPreferencesData)[]).forEach((k) => {
    if (trip[k] !== undefined && trip[k] !== null) (preferences as any)[k] = trip[k];
  });
  return {
    from: trip.arrival_location,
    to: trip.departure_location,
    seats: trip.vehicle?.seats ? Math.max(trip.vehicle.seats - 1, 1) : Math.max(trip.available_seats, 1),
    price: Number(trip.price),
    description: trip.description ?? undefined,
    preferences,
    stops: (trip.stops || []).map((s) => s.location).reverse(),
    vehicleId: trip.vehicle?.id ?? null,
  };
}

/** Distancia (km) y duración (min) por tramo con Google Directions */
function useRouteMetrics(points: string[]) {
  const { isLoaded } = useGoogleMaps();
  const [legs, setLegs] = useState<{ km: number; minutes: number }[] | null>(null);
  const key = points.join("|");

  useEffect(() => {
    if (!isLoaded || points.length < 2 || points.some((p) => !p.trim()) || typeof google === "undefined") {
      setLegs(null);
      return;
    }
    const handle = setTimeout(() => {
      new google.maps.DirectionsService()
        .route({
          origin: points[0],
          destination: points[points.length - 1],
          waypoints: points.slice(1, -1).map((location) => ({ location, stopover: true })),
          travelMode: google.maps.TravelMode.DRIVING,
          region: "fi",
        })
        .then((res) => {
          const routeLegs = res.routes[0]?.legs || [];
          setLegs(routeLegs.map((l) => ({ km: Math.round((l.distance?.value || 0) / 1000), minutes: Math.round((l.duration?.value || 0) / 60) })));
        })
        .catch(() => setLegs(null));
    }, 700);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, key]);

  return legs;
}

const pad = (n: number) => String(n).padStart(2, "0");

/** Fecha y hora locales (yyyy-mm-dd / hh:mm) de una fecha ISO */
function toLocalParts(iso?: string) {
  if (!iso) return { date: "", time: "" };
  const d = new Date(iso);
  if (isNaN(d.getTime())) return { date: "", time: "" };
  return {
    date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
    time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
  };
}

/** Convierte fecha y hora locales del navegador a ISO con zona horaria */
function toIso(date: string, time: string) {
  return new Date(`${date}T${time}:00`).toISOString();
}

export default function TripForm({
  mode,
  trip,
  onSubmit,
  onCancel,
  initialValues,
}: {
  mode: "create" | "edit";
  trip?: Trip | null;
  onSubmit: (data: CreateTripData) => Promise<void>;
  onCancel: () => void;
  initialValues?: TripFormInitial;
}) {
  const { t } = useTranslation();
  const isEdit = mode === "edit";
  const initial = toLocalParts(trip?.departure_time);

  const [formData, setFormData] = useState({
    from: trip?.departure_location ?? initialValues?.from ?? "",
    to: trip?.arrival_location ?? initialValues?.to ?? "",
    date: initial.date || initialValues?.date || "",
    time: initial.time,
    availableSeats: trip?.available_seats ?? initialValues?.seats ?? 1,
    pricePerSeat: trip ? Number(trip.price) : initialValues?.price ?? 0,
    description: trip?.description ?? initialValues?.description ?? "",
    is_recurring: false,
    recurrence_pattern: "daily",
    recurrence_until: "",
  });
  const [loading, setLoading] = useState(false);
  const [vehicleChoice, setVehicleChoice] = useState<VehicleChoice>(null);
  const [prefs, setPrefs] = useState<TripPreferencesData>(() => {
    const base = { ...DEFAULT_PREFERENCES, ...initialValues?.preferences };
    if (trip) (Object.keys(base) as (keyof TripPreferencesData)[]).forEach((k) => {
      if (trip[k] !== undefined && trip[k] !== null) (base as any)[k] = trip[k];
    });
    return base;
  });
  const [stops, setStops] = useState<StopRow[]>(() =>
    trip
      ? (trip.stops || []).map((s) => {
          const parts = toLocalParts(s.departure_time);
          return { location: s.location, date: parts.date, time: parts.time, price: String(Number(s.price_from_origin)) };
        })
      : (initialValues?.stops || []).map((location) => ({ location, date: "", time: "", price: "" }))
  );

  const legs = useRouteMetrics([formData.from, ...stops.map((s) => s.location), formData.to]);
  const distanceKm = legs ? legs.reduce((sum, l) => sum + l.km, 0) : trip?.distance_km ?? null;
  const durationMinutes = legs ? legs.reduce((sum, l) => sum + l.minutes, 0) : trip?.duration_minutes ?? null;
  const suggestedPrice = suggestedPriceFor(distanceKm);
  const maxPrice = maxPriceFor(distanceKm);
  const priceTooHigh = maxPrice !== null && Number(formData.pricePerSeat) > maxPrice;
  // Precio sugerido hasta cada parada, según la distancia acumulada
  const stopSuggestion = (index: number) => {
    if (!legs || legs.length !== stops.length + 1) return null;
    const km = legs.slice(0, index + 1).reduce((sum, l) => sum + l.km, 0);
    return suggestedPriceFor(km);
  };

  const updateStop = (index: number, patch: Partial<StopRow>) =>
    setStops((prev) => prev.map((s, i) => (i === index ? { ...s, ...patch } : s)));
  const addStop = () =>
    setStops((prev) => (prev.length >= 5 ? prev : [...prev, { location: "", date: formData.date, time: "", price: "" }]));
  const removeStop = (index: number) => setStops((prev) => prev.filter((_, i) => i !== index));
  const moveStop = (index: number, dir: -1 | 1) =>
    setStops((prev) => {
      const next = [...prev];
      const target = index + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  // El conductor ocupa una plaza
  const maxPassengerSeats = vehicleChoice ? Math.max(vehicleChoice.vehicle.seats - 1, 1) : 8;

  const handleVehicleChange = (choice: VehicleChoice) => {
    setVehicleChoice(choice);
    if (choice) {
      const max = Math.max(choice.vehicle.seats - 1, 1);
      setFormData((prev) => (Number(prev.availableSeats) > max ? { ...prev, availableSeats: max } : prev));
    }
  };

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
    if (!vehicleChoice) {
      toast.error(t("vehicle.required", "Please choose or add a vehicle"));
      return;
    }
    if (vehicleChoice.mode === "new" && !isVehicleInputComplete(vehicleChoice.vehicle)) {
      toast.error(t("vehicle.incomplete", "Please complete the vehicle details"));
      return;
    }
    if (!isEdit && formData.is_recurring && !formData.recurrence_until) {
      toast.error(t("page.createTrip.recurrenceUntilRequired", "Please specify until when the trip repeats"));
      return;
    }
    const filledStops = stops.filter((s) => s.location.trim());
    if (filledStops.some((s) => !s.date || !s.time)) {
      toast.error(t("stops.timeRequired", "Add a time for every stop"));
      return;
    }
    if (priceTooHigh) {
      toast.error(t("price.tooHigh", "The price is above the cost-sharing limit for this distance"));
      return;
    }
    setLoading(true);
    try {
      await onSubmit({
        ...prefs,
        distance_km: distanceKm || undefined,
        duration_minutes: durationMinutes || undefined,
        stops: filledStops.map((s) => ({
          location: s.location,
          departure_time: toIso(s.date, s.time),
          price_from_origin: Number(s.price) || 0,
        })),
        departure_location: formData.from,
        arrival_location: formData.to,
        departure_time: toIso(formData.date, formData.time),
        available_seats: Number(formData.availableSeats),
        price: Number(formData.pricePerSeat),
        description: formData.description || (isEdit ? "" : undefined),
        ...(vehicleChoice.mode === "existing"
          ? { vehicle_id: vehicleChoice.vehicle.id }
          : { vehicle: vehicleChoice.vehicle }),
        ...(isEdit
          ? {}
          : {
              is_recurring: formData.is_recurring,
              recurrence_pattern: formData.is_recurring ? formData.recurrence_pattern : undefined,
              recurrence_until:
                formData.is_recurring && formData.recurrence_until
                  ? toIso(formData.recurrence_until, formData.time)
                  : undefined,
            }),
      });
    } catch (error) {
      const fallback = isEdit ? t("page.editTrip.error", "Error saving the trip") : (t("page.createTrip.error") || "Error publishing trip");
      toast.error((error as any)?.message || fallback);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--page-bg)]">
      {/* ── HERO ── */}
      <section className="bg-[#ebf3e2] border-b-2 border-[#c4d8b4] py-8 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-[#c4d8b4] border border-[#c4d8b4] text-[var(--brand-dark)] px-4 py-1.5 rounded-full text-xs font-bold mb-3 uppercase tracking-wide">
            <span className="w-2 h-2 rounded-full bg-[var(--brand-blue)] animate-pulse"></span>
            {isEdit ? t("page.editTrip.badge", "Edit trip") : (t("page.createTrip.badge") || "New trip")}
          </div>
          <h1 className="text-2xl md:text-2xl font-bold text-[var(--brand-dark)] leading-tight mb-2">
            {isEdit ? t("page.editTrip.title", "Edit your trip") : (t("page.createTrip.title") || "Publish a trip")}
          </h1>
          <p className="text-sm md:text-base text-[var(--brand-neutral)] max-w-3xl mx-auto leading-relaxed font-normal">
            {isEdit ? t("page.editTrip.subtitle", "Update the route, time, price or car. Passengers will see the changes.") : (t("page.createTrip.subtitle") || "Share your route, save on costs and help build a more sustainable community.")}
          </p>
        </div>
      </section>

      {/* ── FORMULARIO ── */}
      <section className="py-12 px-4 bg-white relative -mt-5">
        <div className="max-w-4xl mx-auto">
          <div className="form-card relative z-10">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-6">
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

                  {/* Paradas intermedias */}
                  <div className="rounded-2xl border-2 border-[#c4d8b4] bg-[#f7fbf3] p-4 md:p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h3 className="font-bold text-[var(--brand-dark)]">{t("stops.title", "Stops along the way")}</h3>
                        <p className="text-sm text-[var(--brand-neutral)]">{t("stops.help", "Passengers can get on or off at your stops and pay only for their part of the trip.")}</p>
                      </div>
                      <button type="button" onClick={addStop} disabled={stops.length >= 5} className="btn-secondary px-4 py-2 text-sm">
                        + {t("stops.add", "Add stop")}
                      </button>
                    </div>
                    {stops.length > 0 && (
                      <ol className="mt-4 space-y-3">
                        {stops.map((stop, i) => {
                          const suggestion = stopSuggestion(i);
                          return (
                            <li key={i} className="grid gap-3 rounded-xl border border-[#c4d8b4] bg-white p-3 md:grid-cols-[1fr_9rem_7rem_7rem_auto] md:items-end">
                              <div>
                                <label className="form-label">{t("stops.place", "Stop")} {i + 1}</label>
                                <LocationInput
                                  name={`stop-${i}`}
                                  value={stop.location}
                                  onChange={(val: string) => updateStop(i, { location: val })}
                                  className="form-input"
                                  placeholder={t("stops.placePlaceholder", "City or town")}
                                />
                              </div>
                              <div>
                                <label className="form-label">{t("page.createTrip.date") || "Date"}</label>
                                <input type="date" value={stop.date} onChange={(e) => updateStop(i, { date: e.target.value })} className="form-input" />
                              </div>
                              <div>
                                <label className="form-label">{t("page.createTrip.time") || "Time"}</label>
                                <input type="time" value={stop.time} onChange={(e) => updateStop(i, { time: e.target.value })} className="form-input" />
                              </div>
                              <div>
                                <label className="form-label">{t("stops.priceFromOrigin", "Price from origin")}</label>
                                <input
                                  type="number"
                                  min="0"
                                  step="0.5"
                                  value={stop.price}
                                  placeholder={suggestion ? String(suggestion) : "€"}
                                  onChange={(e) => updateStop(i, { price: e.target.value })}
                                  className="form-input"
                                />
                              </div>
                              <div className="flex gap-1">
                                <button type="button" onClick={() => moveStop(i, -1)} disabled={i === 0} className="rounded-lg border border-[#c4d8b4] px-2 py-2 text-sm disabled:opacity-30" aria-label={t("stops.moveUp", "Move up")}>↑</button>
                                <button type="button" onClick={() => moveStop(i, 1)} disabled={i === stops.length - 1} className="rounded-lg border border-[#c4d8b4] px-2 py-2 text-sm disabled:opacity-30" aria-label={t("stops.moveDown", "Move down")}>↓</button>
                                <button type="button" onClick={() => removeStop(i)} className="rounded-lg border border-red-200 px-2 py-2 text-sm text-red-600" aria-label={t("stops.remove", "Remove stop")}>✕</button>
                              </div>
                            </li>
                          );
                        })}
                      </ol>
                    )}
                  </div>

                  {distanceKm ? (
                    <p className="text-sm text-[var(--brand-neutral)]">
                      🛣️ {distanceKm} km
                      {durationMinutes ? ` · ⏱️ ${Math.floor(durationMinutes / 60)} h ${durationMinutes % 60} min` : ""}
                    </p>
                  ) : null}
                </div>

                <div className="h-px bg-[#ebf3e2] w-full"></div>

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
                          max={maxPassengerSeats} 
                          className="form-input text-center font-bold" 
                          required 
                        />
                      </div>
                    </div>
                    <div className="md:col-span-1">
                      <label className="form-label">{t("page.createTrip.pricePerSeat") || "Price per seat (€)"} *</label>
                      <div className="relative group">
                        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--brand-blue)] font-black text-lg z-10 group-focus-within:text-[var(--brand-dark)] transition-colors">€</span>
                        <input 
                          type="number" 
                          name="pricePerSeat" 
                          value={formData.pricePerSeat} 
                          onChange={handleChange} 
                          min="0" 
                          step="0.01" 
                          className="form-input pl-12 font-black text-lg text-[var(--brand-neutral)]" 
                          required 
                        />
                      </div>
                    </div>
                  </div>
                  {suggestedPrice !== null && (
                    <div className={`flex flex-wrap items-center gap-3 rounded-xl border-2 px-4 py-3 text-sm ${priceTooHigh ? "border-red-300 bg-red-50 text-red-700" : "border-[#c4d8b4] bg-[#f7fbf3] text-[var(--brand-dark)]"}`}>
                      <span>
                        💡 {t("price.suggested", "Suggested price")}: <strong>{suggestedPrice} €</strong>
                        <span className="text-[var(--brand-neutral)]"> · {t("price.max", "max")} {maxPrice} €</span>
                      </span>
                      {Number(formData.pricePerSeat) !== suggestedPrice && (
                        <button type="button" className="font-bold text-[var(--brand-blue)] underline" onClick={() => setFormData((prev) => ({ ...prev, pricePerSeat: suggestedPrice }))}>
                          {t("price.apply", "Use it")}
                        </button>
                      )}
                      {priceTooHigh && <span className="w-full">{t("price.tooHigh", "The price is above the cost-sharing limit for this distance")}</span>}
                    </div>
                  )}
                </div>

                <div className="h-px bg-[#ebf3e2] w-full"></div>

                {/* Paso 3: Vehículo */}
                <div className="space-y-6">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="w-10 h-10 rounded-full bg-[var(--brand-blue)] flex items-center justify-center text-white font-bold shadow-md">3</div>
                    <h2 className="text-2xl font-bold text-[var(--brand-dark)]">{t("vehicle.step", "Vehicle")}</h2>
                  </div>
                  <VehicleSelector value={vehicleChoice} onChange={handleVehicleChange} initialVehicleId={trip?.vehicle?.id ?? initialValues?.vehicleId ?? null} />
                </div>

                <div className="h-px bg-[#ebf3e2] w-full"></div>

                {/* Paso 4: Preferencias */}
                <div className="space-y-6">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="w-10 h-10 rounded-full bg-[var(--brand-blue)] flex items-center justify-center text-white font-bold shadow-md">4</div>
                    <h2 className="text-2xl font-bold text-[var(--brand-dark)]">{t("prefs.step", "Preferences and booking")}</h2>
                  </div>
                  <TripPreferencesFields value={prefs} onChange={setPrefs} />
                </div>

                <div className="h-px bg-[#ebf3e2] w-full"></div>

                {/* Paso 5: Información adicional */}
                <div className="space-y-6">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="w-10 h-10 rounded-full bg-[var(--brand-blue)] flex items-center justify-center text-white font-bold shadow-md">5</div>
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

                  {!isEdit && (<>
                  {/* Recurrencia */}
                  <div className="bg-[#ebf3e2]/50 border-2 border-[#c4d8b4] rounded-[2rem] p-8 md:p-6 transition-all hover:bg-[#ebf3e2]">
                    <div className="flex items-center justify-between gap-6">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-[var(--brand-dark)] mb-1 flex items-center gap-2">
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
                      <div className="grid md:grid-cols-2 gap-8 mt-10 pt-8 border-t border-[#c4d8b4] animate-in fade-in slide-in-from-top-4 duration-300">
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
                  </>)}
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex flex-col-reverse md:flex-row gap-6 pt-6">
                <button
                  type="button"
                  onClick={onCancel}
                  disabled={loading}
                  className="btn-secondary flex-1 py-4 shadow-sm border-2"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  {t("page.createTrip.cancel") || "Cancel"}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary flex-[2] py-4 shadow-2xl relative overflow-hidden group"
                >
                  <span className={`flex items-center justify-center gap-3 transition-all duration-300 ${loading ? 'opacity-0 scale-90' : 'opacity-100 scale-100'}`}>
                    <svg className="w-6 h-6 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    {isEdit ? t("page.editTrip.submit", "Save changes") : (t("page.createTrip.submit") || "Publish trip")}
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