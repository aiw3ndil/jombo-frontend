"use client";

import React, { createContext, useContext, ReactNode } from "react";
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
// 500. Por eso cargamos Google Maps solo en el cliente (ssr: false).
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
    return (
        <GoogleMapsContext.Provider value={{ isLoaded: false, loadError: undefined }}>
            <MapsScriptLoader language={language} region={region}>
                {children}
            </MapsScriptLoader>
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
