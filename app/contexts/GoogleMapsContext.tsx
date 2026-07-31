"use client";

import React, { createContext, useContext, ReactNode, useState } from "react";
import dynamic from "next/dynamic";

export interface GoogleMapsContextType {
    isLoaded: boolean;
    loadError: Error | undefined;
}

export const GoogleMapsContext = createContext<GoogleMapsContextType | undefined>(undefined);

// El Loader de @react-google-maps/api usa un singleton a nivel de módulo
// (Loader.instance). Durante el renderizado en servidor (SSR) cada petición con
// distinto idioma/región crea el Loader con opciones distintas y la segunda lanza
// "Loader must not be called again with different options", provocando un error
// 500. Por eso cargamos Google Maps solo en el cliente (ssr: false). El loader
// NO envuelve a {children}, de modo que el resto de la app se sigue renderizando
// en el servidor.
const MapsScriptLoader = dynamic(
    () => import("./MapsScriptLoader"),
    { ssr: false }
);

export function GoogleMapsProvider({ 
    children, 
    language = 'es',
    region = 'ES' 
}: { 
    children: ReactNode;
    language?: string;
    region?: string;
}) {
    const [maps, setMaps] = useState<GoogleMapsContextType>({ isLoaded: false, loadError: undefined });

    return (
        <GoogleMapsContext.Provider value={maps}>
            <MapsScriptLoader language={language} region={region} onStateChange={setMaps} />
            {children}
        </GoogleMapsContext.Provider>
    );
}

export function useGoogleMaps() {
    const context = useContext(GoogleMapsContext);
    if (context === undefined) {
        throw new Error("useGoogleMaps must be used within a GoogleMapsProvider");
    }
    return context;
}
