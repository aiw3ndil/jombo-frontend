import type { Vehicle, VehicleInput } from "./vehicles";
import type { ExperienceLevel, Reliability, Verifications } from "./users";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('authToken'); // Assuming token is stored in localStorage
  if (token) {
    return {
      'Authorization': `Bearer ${token}`,
    };
  }
  return {};
}

export interface ExternalLeg {
  mode: string;
  from: string;
  to: string;
  start_time?: string;
  end_time?: string;
}

export interface ExternalOption {
  type: "external_transport";
  start_time: string;
  end_time: string;
  duration: number;
  legs: ExternalLeg[];
  is_external: true;
  price: number;
  currency: string;
  url: string;
}

export type Chattiness = "quiet" | "normal" | "chatty";
export type LuggageSize = "small" | "medium" | "large";

export interface TripPreferencesData {
  instant_booking: boolean;
  pets_allowed: boolean;
  smoking_allowed: boolean;
  music_allowed: boolean;
  max_two_back: boolean;
  chattiness: Chattiness;
  luggage_size: LuggageSize;
}

export const DEFAULT_PREFERENCES: TripPreferencesData = {
  instant_booking: false,
  pets_allowed: false,
  smoking_allowed: false,
  music_allowed: false,
  max_two_back: false,
  chattiness: "normal",
  luggage_size: "medium",
};

export interface TripStop {
  id?: number;
  location: string;
  position?: number;
  departure_time: string;
  price_from_origin: number | string;
}

/** Tramo del viaje que corresponde a la búsqueda (solo si no es el viaje completo) */
export interface TripSegment {
  from: string;
  to: string;
  departure_time: string;
  arrival_time?: string | null;
  price: number;
  partial: boolean;
}

export interface TripDriver {
  id: number;
  name: string;
  picture_url?: string | null;
  average_rating?: number;
  total_reviews?: number;
  experience_level?: ExperienceLevel;
  verifications?: Verifications;
  reliability?: Reliability;
}

export interface Trip extends Partial<TripPreferencesData> {
  id: number;
  departure_location: string;
  arrival_location: string;
  departure_time: string;
  available_seats: number;
  price: number;
  driver: TripDriver;
  description?: string | null;
  stops?: TripStop[];
  segment?: TripSegment;
  distance_km?: number | null;
  duration_minutes?: number | null;
  max_price?: number | null;
  suggested_price?: number | null;
  vehicle?: Vehicle | null;
  is_recurring?: boolean;
  parent_id?: number | null;
  cancelled_at?: string | null;
  meeting_point?: string | null;
  meeting_lat?: number | string | null;
  meeting_lng?: number | string | null;
  meeting_point_url?: string | null;
  created_at: string;
  updated_at: string;
}

export interface SearchResponse {
  trips: Trip[];
  external_options: ExternalOption[];
  source: 'local' | 'digitransit';
  is_fallback: boolean;
}

export interface SearchFilters {
  date?: string;
  time_of_day?: "morning" | "afternoon" | "evening" | "";
  min_seats?: number;
  instant_booking?: boolean;
  pets?: boolean;
  no_smoking?: boolean;
  max_two_back?: boolean;
  max_price?: number;
  verified?: boolean;
  sort?: "departure_time" | "price" | "duration" | "";
}

export const FILTER_KEYS: (keyof SearchFilters)[] = [
  "date", "time_of_day", "min_seats", "instant_booking", "pets", "no_smoking", "max_two_back", "max_price", "verified", "sort",
];

export async function searchTrips(
  departureLocation?: string,
  arrivalLocation?: string,
  filters: SearchFilters = {}
): Promise<SearchResponse> {
  const params = new URLSearchParams();
  if (departureLocation) params.set("departure_location", departureLocation);
  if (arrivalLocation) params.set("arrival_location", arrivalLocation);
  for (const key of FILTER_KEYS) {
    const value = filters[key];
    if (value !== undefined && value !== "" && value !== false && value !== 0) params.set(key, String(value));
  }

  const url = `${API_BASE}/api/v1/trips/search?${params.toString()}`;

  const res = await fetch(url, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Error searching trips");
  }

  const data = await res.json();
  
  let trips: Trip[] = [];
  let external_options: ExternalOption[] = [];

  // Manejamos el caso de que la respuesta sea directamente un objeto de transporte externo
  if (data && data.type === 'external_transport') {
    external_options = [{ ...data, is_external: true }];
  } 
  // Caso de array directo (pueden ser trips locales o externos)
  else if (Array.isArray(data)) {
    trips = data.filter((item: any) => item.type !== 'external_transport');
    const external = data.filter((item: any) => item.type === 'external_transport');
    external_options = external.map((opt: any) => ({ ...opt, is_external: true }));
  }
  // Caso de objeto con claves (formato estándar)
  else if (data && typeof data === 'object') {
    trips = data.trips || [];
    const rawExternal = data.external_options || [];
    external_options = rawExternal.map((opt: any) => ({ ...opt, is_external: true }));
  }

  const response: SearchResponse = {
    trips,
    external_options,
    source: (external_options.length > 0 && trips.length === 0) ? 'digitransit' : 'local',
    is_fallback: (external_options.length > 0 && trips.length === 0)
  };
  
  return response;
}

export async function getTrip(tripId: number | string): Promise<Trip | null> {
  const res = await fetch(`${API_BASE}/api/v1/trips/${tripId}`, { credentials: "include", cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Error loading trip");
  return res.json();
}

/** Precio orientativo por plaza para compartir gastos (igual que el backend) */
export function suggestedPriceFor(distanceKm?: number | null) {
  if (!distanceKm) return null;
  return Math.max(Math.round(distanceKm * 0.065), 1);
}

export function maxPriceFor(distanceKm?: number | null) {
  if (!distanceKm) return null;
  return Math.max(Math.ceil(distanceKm * 0.12), 2);
}

export async function getMyTrips(): Promise<Trip[]> {
  const url = `${API_BASE}/api/v1/trips/my_trips`;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      ...getAuthHeaders(),
    },
    credentials: "include",
  });

  if (!res.ok) {
    const status = res.status;
    let errorDetail = "";
    try {
      const errorJson = await res.json();
      errorDetail = JSON.stringify(errorJson);
    } catch {
      errorDetail = await res.text();
    }
    console.error(`❌ getMyTrips failed with status ${status}:`, errorDetail);
    throw new Error(`Error fetching your trips (Status: ${status}) - ${errorDetail}`);
  }

  const data = await res.json();
  return data;
}

export async function getTripBookings(tripId: number): Promise<any[]> {
  const url = `${API_BASE}/api/v1/trips/${tripId}/bookings`;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      ...getAuthHeaders(),
    },
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Error fetching trip bookings");
  }

  const data = await res.json();
  return data;
}

export type CreateTripData = {
  departure_location: string;
  arrival_location: string;
  departure_time: string;
  available_seats: number;
  price: number;
  description?: string;
  /** Vehículo existente del conductor */
  vehicle_id?: number;
  /** Vehículo nuevo que se crea junto con el viaje */
  vehicle?: VehicleInput;
  is_recurring?: boolean;
  recurrence_pattern?: string;
  recurrence_until?: string;
  distance_km?: number | null;
  duration_minutes?: number | null;
  /** Lista completa de paradas; sustituye a las existentes */
  stops?: Omit<TripStop, "id" | "position">[];
  /** Petición de viaje a la que responde este viaje */
  ride_request_id?: number;
  /** Punto de encuentro exacto (público); vacío para quitarlo */
  meeting_point?: string;
  meeting_lat?: number | null;
  meeting_lng?: number | null;
} & Partial<TripPreferencesData>;

export async function createTrip(tripData: CreateTripData): Promise<Trip> {
  const url = `${API_BASE}/api/v1/trips`;

  console.log('📤 Creating trip with data:', tripData);

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    credentials: "include",
    body: JSON.stringify({ trip: tripData }),
  });

  console.log('📥 Response status:', res.status);

  if (!res.ok) {
    let errorMessage = "Error creating trip";

    try {
      const errorData = await res.json();
      console.log('❌ Error data:', errorData);

      if (errorData.errors && Array.isArray(errorData.errors)) {
        errorMessage = errorData.errors.join(", ");
      } else if (errorData.error) {
        errorMessage = errorData.error;
      } else if (errorData.message) {
        errorMessage = errorData.message;
      }
    } catch (e) {
      console.log('❌ Could not parse error JSON');
      const text = await res.text();
      console.log('❌ Error text:', text);
    }

    console.log('❌ Final error message:', errorMessage);
    throw new Error(errorMessage);
  }

  const data = await res.json();
  console.log('✅ Trip created:', data);
  return data;
}

export async function updateTrip(tripId: number, tripData: Partial<CreateTripData>): Promise<Trip> {
  const res = await fetch(`${API_BASE}/api/v1/trips/${tripId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    credentials: "include",
    body: JSON.stringify({ trip: tripData }),
  });

  if (!res.ok) {
    let errorMessage = "Error saving the trip";
    try {
      const errorData = await res.json();
      errorMessage = errorData.errors?.join(", ") || errorData.error || errorMessage;
    } catch {
      // keep default message
    }
    throw new Error(errorMessage);
  }

  return res.json();
}

export async function deleteTrip(tripId: number, allRecurring: boolean = false): Promise<void> {
  const url = `${API_BASE}/api/v1/trips/${tripId}${allRecurring ? '?all_recurring=true' : ''}`;

  console.log('🗑️ Deleting trip:', { tripId, allRecurring, url });

  const res = await fetch(url, {
    method: "DELETE",
    headers: {
      ...getAuthHeaders(),
    },
    credentials: "include",
  });

  if (!res.ok) {
    let errorMessage = "Error deleting trip";
    try {
      const errorData = await res.json();
      errorMessage = errorData.error || errorData.message || errorMessage;
    } catch (e) {
      // Use default message
    }
    throw new Error(errorMessage);
  }
}

export default { searchTrips, getMyTrips, getTripBookings, createTrip, updateTrip, deleteTrip };
