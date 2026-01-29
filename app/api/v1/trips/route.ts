import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { mockTrips } from '@/app/lib/mockData';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { trip } = body; // Expecting { trip: { ...data } }

    // Simulate driver ID for now (e.g., from an authenticated user session)
    // In a real application, this would come from the authentication context
    const driverId = 1; 
    const driverName = "Juan Pérez"; // Placeholder
    const driverEmail = "juan@example.com"; // Placeholder

    const newTrip = {
      id: mockTrips.length > 0 ? Math.max(...mockTrips.map(t => t.id)) + 1 : 1,
      departure_location: trip.departure_location,
      arrival_location: trip.arrival_location,
      departure_time: trip.departure_time,
      available_seats: Number(trip.available_seats),
      price: Number(trip.price),
      description: trip.description,
      driver: {
        id: driverId,
        name: driverName,
        email: driverEmail,
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    mockTrips.push(newTrip);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return NextResponse.json(newTrip, { status: 201 });
  } catch (error) {
    console.error('Create trip error:', error);
    return NextResponse.json(
      { error: 'Error al crear el viaje' },
      { status: 500 }
    );
  }
}
