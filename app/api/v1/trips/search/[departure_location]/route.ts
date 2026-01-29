import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { mockTrips } from '@/app/lib/mockData';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ departure_location: string }> }
) {
  try {
    const { departure_location } = await params;
    const { searchParams } = new URL(request.url);
    const arrival_location = searchParams.get("to");

    const decodedDepartureLocation = decodeURIComponent(departure_location).toLowerCase();
    
    let results = mockTrips.filter(trip => 
      trip.departure_location.toLowerCase().includes(decodedDepartureLocation)
    );

    if (arrival_location) {
      const decodedArrivalLocation = decodeURIComponent(arrival_location).toLowerCase();
      results = results.filter(trip => 
        trip.arrival_location.toLowerCase().includes(decodedArrivalLocation)
      );
    }
    
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
