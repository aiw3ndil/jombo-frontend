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

export async function searchTrips(departureLocation: string, arrivalLocation?: string): Promise<Trip[]> {
  const params = new URLSearchParams();
  params.set("from", departureLocation);
  if (arrivalLocation) {
    params.set("to", arrivalLocation);
  }
  const url = `${API_BASE}/api/v1/trips/search/${encodeURIComponent(departureLocation)}?${params.toString()}`;
  
  const res = await fetch(url, {
    method: "GET",
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Error al buscar viajes");
  }

  const data = await res.json();
  return data;
}

export async function getMyTrips(): Promise<Trip[]> {
  const url = `${API_BASE}/api/v1/trips/my_trips`;
  
  const res = await fetch(url, {
    method: "GET",
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Error al obtener tus viajes");
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
