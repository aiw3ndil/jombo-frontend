"use client";
import { useMemo, useRef } from "react";
import { Autocomplete } from "@react-google-maps/api";
import { useGoogleMaps } from "@/app/contexts/GoogleMapsContext";

export interface MeetingPoint {
  address: string;
  lat: number | null;
  lng: number | null;
}

/**
 * Punto de encuentro exacto: direcciones y lugares (estaciones, centros comerciales…) en Finlandia.
 * Si se escribe a mano sin elegir una sugerencia, se guarda solo el texto (sin coordenadas).
 */
export default function MeetingPointInput({
  value,
  onChange,
  placeholder,
}: {
  value: MeetingPoint;
  onChange: (value: MeetingPoint) => void;
  placeholder?: string;
}) {
  const { isLoaded, loadError } = useGoogleMaps();
  const ref = useRef<google.maps.places.Autocomplete | null>(null);
  const options = useMemo(
    () => ({ componentRestrictions: { country: "FI" }, fields: ["name", "formatted_address", "geometry"] }),
    []
  );

  const onPlaceChanged = () => {
    const place = ref.current?.getPlace();
    if (!place) return;
    const location = place.geometry?.location;
    // Nombre del lugar + dirección, p. ej. "Kamppi, Urho Kekkosen katu 1, Helsinki"
    const address =
      place.name && place.formatted_address && !place.formatted_address.startsWith(place.name)
        ? `${place.name}, ${place.formatted_address}`
        : place.formatted_address || place.name || value.address;
    onChange({ address: address.replace(/, Finland$|, Suomi$/, ""), lat: location?.lat() ?? null, lng: location?.lng() ?? null });
  };

  const input = (
    <input
      type="text"
      value={value.address}
      onChange={(e) => onChange({ address: e.target.value, lat: null, lng: null })}
      maxLength={200}
      className="form-input"
      placeholder={placeholder}
      autoComplete="off"
    />
  );

  if (loadError || !isLoaded) return input;
  return (
    <Autocomplete onLoad={(a) => (ref.current = a)} onPlaceChanged={onPlaceChanged} options={options}>
      {input}
    </Autocomplete>
  );
}
