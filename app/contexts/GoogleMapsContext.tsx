"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { useJsApiLoader } from "@react-google-maps/api";

interface GoogleMapsContextType {
    isLoaded: boolean;
    loadError: Error | undefined;
}

const GoogleMapsContext = createContext<GoogleMapsContextType | undefined>(undefined);

const libraries: any = ["places"];

export function GoogleMapsProvider({ children }: { children: ReactNode }) {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

    const { isLoaded, loadError } = useJsApiLoader({
        googleMapsApiKey: apiKey,
        libraries,
    });

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
