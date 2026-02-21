"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { useJsApiLoader } from "@react-google-maps/api";

interface GoogleMapsContextType {
    isLoaded: boolean;
    loadError: Error | undefined;
}

const GoogleMapsContext = createContext<GoogleMapsContextType | undefined>(undefined);

// Static libraries and global variable for options
const LIBRARIES: any = ["places"];
let globalLoaderOptions: any = null;

export function GoogleMapsProvider({ 
    children, 
    language = 'es',
    region = 'ES' 
}: { 
    children: ReactNode;
    language?: string;
    region?: string;
}) {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
    
    if (!globalLoaderOptions) {
        globalLoaderOptions = {
            googleMapsApiKey: apiKey,
            libraries: LIBRARIES,
            language,
            region,
        };
    }

    const { isLoaded, loadError } = useJsApiLoader(globalLoaderOptions);

    return (
        <GoogleMapsContext.Provider value={{ isLoaded, loadError }}>
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
