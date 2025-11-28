import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Mock de viajes para pruebas
const mockTrips = [
  {
    id: 1,
    departure_location: "Madrid",
    arrival_location: "Barcelona",
    departure_time: "2025-12-01T09:00:00Z",
    available_seats: 3,
    price_per_seat: 25.50,
    driver: {
      id: 1,
      name: "Juan Pérez",
      email: "juan@example.com"
    }
  },
  {
    id: 2,
    departure_location: "Madrid",
    arrival_location: "Valencia",
    departure_time: "2025-12-01T14:00:00Z",
    available_seats: 2,
    price_per_seat: 20.00,
    driver: {
      id: 2,
      name: "María García",
      email: "maria@example.com"
    }
  },
  {
    id: 3,
    departure_location: "Barcelona",
    arrival_location: "Valencia",
    departure_time: "2025-12-02T10:00:00Z",
    available_seats: 4,
    price_per_seat: 18.75,
    driver: {
      id: 3,
      name: "Carlos López",
      email: "carlos@example.com"
    }
  }
];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ departure_location: string }> }
) {
  try {
    const { departure_location } = await params;
    const location = decodeURIComponent(departure_location).toLowerCase();
    
    // Filtrar viajes por ubicación de salida
    const results = mockTrips.filter(trip => 
      trip.departure_location.toLowerCase().includes(location)
    );
    
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return NextResponse.json(results);
  } catch (error) {
    console.error('Search trips error:', error);
    return NextResponse.json(
      { error: 'Error al buscar viajes' },
      { status: 500 }
    );
  }
}
