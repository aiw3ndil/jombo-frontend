"use client";
import { useTranslation } from "@/app/hooks/useTranslation";

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

/** Lugar como texto para la Maps Embed API (se añade el país para evitar ambigüedades) */
function place(name: string) {
  return /finland|suomi/i.test(name) ? name : `${name}, Finland`;
}

/**
 * Mapa de la ruta con la Maps Embed API (iframe gratuito y sin límite de peticiones).
 * Requiere que la clave tenga habilitada la "Maps Embed API" en Google Cloud.
 */
export default function RouteMap({
  from,
  to,
  stops = [],
  origin,
}: {
  from: string;
  to: string;
  stops?: string[];
  /** Punto de salida exacto (punto de encuentro), si lo hay */
  origin?: { lat: number; lng: number } | null;
}) {
  const { t } = useTranslation();
  if (!API_KEY) return null;

  const params = new URLSearchParams({
    key: API_KEY,
    origin: origin ? `${origin.lat},${origin.lng}` : place(from),
    destination: place(to),
    mode: "driving",
  });
  if (stops.length) params.set("waypoints", stops.map(place).join("|"));

  return (
    <div className="overflow-hidden rounded-2xl border-2 border-[#c4d8b4] bg-[#ebf3e2]">
      <iframe
        title={t("trip.mapTitle", "Route map")}
        src={`https://www.google.com/maps/embed/v1/directions?${params.toString()}`}
        className="block h-72 w-full md:h-80"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      />
    </div>
  );
}
