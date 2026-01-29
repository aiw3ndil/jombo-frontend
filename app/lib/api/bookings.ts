const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";

export interface Booking {
  id: number;
  user_id: number;
  trip_id: number;
  seats: number;
  status: "pending" | "confirmed" | "rejected" | "cancelled";
  created_at: string;
  updated_at: string;
  trip?: {
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
    };
  };
  user?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface CreateBookingData {
  trip_id: number;
  seats: number;
}

export async function createBooking(data: CreateBookingData): Promise<Booking> {
  const url = `${API_BASE}/api/v1/trips/${data.trip_id}/bookings`;
  
  console.log('📤 Creating booking:', data);
  
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      booking: {
        seats: data.seats,
      },
    }),
  });

  console.log('📥 Booking response status:', res.status);

  if (!res.ok) {
    let errorMessage = "Error al crear la reserva";
    
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
    }
    
    console.log('❌ Final error message:', errorMessage);
    throw new Error(errorMessage);
  }

  const booking = await res.json();
  console.log('✅ Booking created:', booking);
  return booking;
}

export async function getBookings(): Promise<Booking[]> {
  const url = `${API_BASE}/api/v1/bookings`;
  
  const res = await fetch(url, {
    method: "GET",
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Error al obtener las reservas");
  }

  return await res.json();
}

export async function confirmBooking(bookingId: number): Promise<Booking> {
  const url = `${API_BASE}/api/v1/bookings/${bookingId}/confirm`;
  
  const res = await fetch(url, {
    method: "PATCH",
    credentials: "include",
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || errorData.errors?.join(", ") || "Error al confirmar la reserva");
  }

  return await res.json();
}

export async function rejectBooking(bookingId: number): Promise<Booking> {
  const url = `${API_BASE}/api/v1/bookings/${bookingId}/reject`;
  
  const res = await fetch(url, {
    method: "PATCH",
    credentials: "include",
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || "Error al rechazar la reserva");
  }

  return await res.json();
}

export async function cancelBooking(bookingId: number): Promise<void> {
  const url = `${API_BASE}/api/v1/bookings/${bookingId}`;
  
  const res = await fetch(url, {
    method: "DELETE",
    credentials: "include",
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || "Error al cancelar la reserva");
  }
}

export default { createBooking, getBookings, confirmBooking, rejectBooking, cancelBooking };
