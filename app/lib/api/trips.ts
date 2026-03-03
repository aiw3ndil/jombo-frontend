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
  start_time: string;
  end_time: string;
}

export interface ExternalOption {
  type: "external_transport";
  start_time: string;
  end_time: string;
  duration: number;
  legs: ExternalLeg[];
  is_external: true;
  price?: number;
}

export interface Trip {
  id: number;
  departure_location: string;
  arrival_location: string;
  departure_time: string;
  available_seats: number;
  price: number;
  driver: {
    id: number;
    name: string;
    email: string;
    picture_url?: string;
  };
  created_at: string;
  updated_at: string;
}

export interface SearchResponse {
  trips: Trip[];
  external_options: ExternalOption[];
  source: 'local' | 'digitransit';
  is_fallback: boolean;
}

export async function searchTrips(
  departureLocation?: string,
  arrivalLocation?: string,
  region?: string
): Promise<SearchResponse> {
  const params = new URLSearchParams();
  if (departureLocation) params.set("departure_location", departureLocation);
  if (arrivalLocation) params.set("arrival_location", arrivalLocation);
  if (region) params.set("region", region);

  let url = `${API_BASE}/api/v1/trips/search?${params.toString()}`;
  if (departureLocation && arrivalLocation) {
    const seoPath = `${departureLocation.toLowerCase()}-${arrivalLocation.toLowerCase()}`;
    url = `${API_BASE}/api/v1/trips/${seoPath}`;
  }

  const res = await fetch(url, {
    method: "GET",
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Error al buscar viajes");
  }

  const data = await res.json();
  
  // Normalizamos la respuesta
  const trips = data.trips || (Array.isArray(data) ? data : []);
  const external_options = (data.external_options || []).map((opt: any) => ({
    ...opt,
    is_external: true
  }));

  const response: SearchResponse = {
    trips,
    external_options,
    source: external_options.length > 0 && trips.length === 0 ? 'digitransit' : 'local',
    is_fallback: external_options.length > 0 && trips.length === 0
  };
  
  return response;
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
    throw new Error(`Error al obtener tus viajes (Status: ${status}) - ${errorDetail}`);
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
    throw new Error("Error al obtener las reservas del viaje");
  }

  const data = await res.json();
  return data;
}

export interface CreateTripData {
  departure_location: string;
  arrival_location: string;
  departure_time: string;
  available_seats: number;
  price: number;
  description?: string;
  region?: string;
}

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
    let errorMessage = "Error al crear el viaje";

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

export default { searchTrips, getMyTrips, getTripBookings, createTrip };
