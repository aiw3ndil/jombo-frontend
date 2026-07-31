"use client";

import { useEffect, useMemo } from "react";
import { useJsApiLoader } from "@react-google-maps/api";
import type { Library } from "@googlemaps/js-api-loader";
import type { GoogleMapsContextType } from "./GoogleMapsContext";

// Static libraries
const LIBRARIES: Library[] = ["places"];

// Este componente se monta solo en el cliente (ver GoogleMapsContext).
// El Loader de @react-google-maps/api usa un singleton a nivel de módulo
// (Loader.instance). Durante el SSR cada petición con distinto idioma/región
// crea el Loader con opciones distintas y la segunda lanza "Loader must not be
// called again with different options", provocando un error 500.
export default function MapsScriptLoader({
    language,
    region,
    onStateChange,
}: {
    language: string;
    region: string;
    onStateChange: (state: GoogleMapsContextType) => void;
}) {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

    const loaderOptions = useMemo(() => ({
        googleMapsApiKey: apiKey,
        libraries: LIBRARIES,
        language,
        region,
    }), [apiKey, language, region]);

    const { isLoaded, loadError } = useJsApiLoader(loaderOptions);

    useEffect(() => {
        onStateChange({ isLoaded, loadError });
    }, [isLoaded, loadError, onStateChange]);

    return null;
}
