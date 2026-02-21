"use client";

import React, { useRef, useMemo } from "react";
import { Autocomplete } from "@react-google-maps/api";
import { useGoogleMaps } from "@/app/contexts/GoogleMapsContext";
import { useParams } from "next/navigation";

interface LocationInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    name?: string;
    required?: boolean;
}

export default function LocationInput({
    value,
    onChange,
    placeholder,
    className,
    name,
    required,
}: LocationInputProps) {
    const { isLoaded, loadError } = useGoogleMaps();
    const params = useParams();
    const lang = (params?.lang as string) || "es";

    const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

    // Get country code from lang
    const countryCode = useMemo(() => {
        switch (lang) {
            case 'fi': return 'FI';
            case 'en': return 'US';
            case 'es':
            default: return 'ES';
        }
    }, [lang]);

    const options = useMemo(() => ({
        componentRestrictions: { country: countryCode },
        types: ['(cities)'], // Restrict to cities for better experience in a ride-sharing app
    }), [countryCode]);

    const onLoad = (autocomplete: google.maps.places.Autocomplete) => {
        autocompleteRef.current = autocomplete;
    };

    const onPlaceChanged = () => {
        if (autocompleteRef.current !== null) {
            const place = autocompleteRef.current.getPlace();

            if (!place) return;

            // Try to extract city/locality from address_components
            let cityName = "";
            if (place.address_components) {
                const locality = place.address_components.find(c =>
                    c.types.includes("locality")
                );
                const adminArea = place.address_components.find(c =>
                    c.types.includes("administrative_area_level_2")
                );
                const subLocality = place.address_components.find(c =>
                    c.types.includes("sublocality_level_1")
                );

                cityName = locality?.long_name || adminArea?.long_name || subLocality?.long_name || "";
            }

            // Fallback to formatted_address (first part before comma) if no city found
            if (!cityName && place.formatted_address) {
                cityName = place.formatted_address.split(',')[0];
            } else if (!cityName && place.name) {
                cityName = place.name;
            }

            if (cityName) {
                onChange(cityName);
            }
        }
    };

    if (loadError) {
        return (
            <input
                type="text"
                name={name}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className={className}
                required={required}
            />
        );
    }

    if (!isLoaded) {
        return (
            <div className="relative">
                <input
                    type="text"
                    disabled
                    placeholder="Cargando mapa..."
                    className={`${className} opacity-50`}
                />
            </div>
        );
    }

    return (
        <Autocomplete onLoad={onLoad} onPlaceChanged={onPlaceChanged} options={options}>
            <input
                type="text"
                name={name}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className={className}
                required={required}
            />
        </Autocomplete>
    );
}
