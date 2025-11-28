const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";

export interface Trip {
  id: number;
  departure_location: string;
  arrival_location: string;
  departure_time: string;
  available_seats: number;
  price_per_seat: number;
  driver: {
    id: number;
    name: string;
    email: string;
  };
}

export async function searchTrips(departureLocation: string): Promise<Trip[]> {
  const url = `${API_BASE}/api/v1/trips/search/${encodeURIComponent(departureLocation)}`;
  
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

export default { searchTrips };
