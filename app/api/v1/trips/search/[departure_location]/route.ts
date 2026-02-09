import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ departure_location: string }> }
) {
  try {
    const { departure_location } = await params;
    const { searchParams } = new URL(request.url);
    const arrival_location_param = searchParams.get("to"); // Use a distinct variable name to avoid confusion

    const queryParams = new URLSearchParams();
    queryParams.set("departure_location", departure_location); // Backend expects 'departure_location'

    if (arrival_location_param) {
      queryParams.set("arrival_location", arrival_location_param); // Backend expects 'arrival_location'
    }

    const url = `${API_BASE}/api/v1/trips/search?${queryParams.toString()}`;

    const res = await fetch(url, {
      method: "GET",
      credentials: "include",
    });

    if (!res.ok) {
      const errorDetail = await res.text();
      console.error(`Backend search trips failed with status ${res.status}:`, errorDetail);
      return NextResponse.json(
        { error: `Error al buscar viajes en el backend: ${errorDetail}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Search trips API route error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor al buscar viajes' },
      { status: 500 }
    );
  }
}

