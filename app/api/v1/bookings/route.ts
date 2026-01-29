import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { mockTrips, mockBookings } from '@/app/lib/mockData';

export async function GET(request: NextRequest) {
  try {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return NextResponse.json(mockBookings);
  } catch (error) {
    console.error('Get bookings error:', error);
    return NextResponse.json(
      { error: 'Error al obtener las reservas' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { trip_id, booking: { seats } } = body;

    // Find the trip to associate with the booking
    // This is a simplified example; in a real app, you'd fetch from a DB
    const trip = mockTrips.find(t => t.id === trip_id);

    if (!trip) {
      return NextResponse.json(
        { error: 'Trip not found' },
        { status: 404 }
      );
    }

    // Simulate booking creation
    const newBooking = {
      id: mockBookings.length + 1, // Simple unique ID generation
      user_id: 1, // Mock user ID
      trip_id: trip_id,
      seats: seats,
      status: "pending", // New bookings are pending by default
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      trip: trip,
      user: {
        id: 1,
        name: "Test User",
        email: "test@example.com"
      }
    };
    
    // Add new booking to mock list (for subsequent GET requests in the same session)
    mockBookings.push(newBooking);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return NextResponse.json(newBooking, { status: 201 });
  } catch (error) {
    console.error('Create booking error:', error);
    return NextResponse.json(
      { error: 'Error al crear la reserva' },
      { status: 500 }
    );
  }
}

