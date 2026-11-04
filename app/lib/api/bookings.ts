const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";

export interface Booking {
  id: number;
  user_id: number;
  trip_id: number;
  seats: number;
  status: "pending" | "confirmed" | "rejected" | "cancelled";
  pickup_location?: string | null;
  dropoff_location?: string | null;
  price_per_seat?: number | string | null;
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
      picture_url?: string;
    };
  };
  user?: {
    id: number;
    name: string;
    email: string;
    picture_url?: string;
  };
}

export interface CreateBookingData {
  trip_id: number;
  seats: number;
  pickup_location?: string;
  dropoff_location?: string;
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
        pickup_location: data.pickup_location,
        dropoff_location: data.dropoff_location,
      },
    }),
  });

  console.log('📥 Booking response status:', res.status);

  if (!res.ok) {
    let errorMessage = "Error creating booking";

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
    throw new Error("Error fetching bookings");
  }

  return await res.json();
}

export async function confirmBooking(tripId: number, bookingId: number): Promise<Booking> {
  const url = `${API_BASE}/api/v1/trips/${tripId}/bookings/${bookingId}/confirm`;

  const res = await fetch(url, {
    method: "PUT",
    credentials: "include",
  });

  if (!res.ok) {
    let errorData = null;
    try {
      errorData = await res.json();
    } catch (e) {
      console.error("Error parsing error response for confirmBooking:", e);
    }
    throw new Error(errorData?.error || errorData?.errors?.join(", ") || "Error confirming booking");
  }

  // Handle 204 No Content for successful operations that don't return a body
  if (res.status === 204) {
    return {} as Booking; // Or a more appropriate empty/success object
  }

  try {
    return await res.json();
  } catch (e) {
    console.error("Error parsing success response for confirmBooking:", e);
    throw new Error("Invalid server response when confirming the booking.");
  }
}

export async function rejectBooking(tripId: number, bookingId: number): Promise<Booking> {
  const url = `${API_BASE}/api/v1/trips/${tripId}/bookings/${bookingId}/reject`;

  const res = await fetch(url, {
    method: "PUT",
    credentials: "include",
  });

  if (!res.ok) {
    let errorData = null;
    try {
      errorData = await res.json();
    } catch (e) {
      console.error("Error parsing error response for rejectBooking:", e);
    }
    throw new Error(errorData?.error || "Error rejecting booking");
  }

  // Handle 204 No Content for successful operations that don't return a body
  if (res.status === 204) {
    return {} as Booking; // Or a more appropriate empty/success object
  }

  try {
    return await res.json();
  } catch (e) {
    console.error("Error parsing success response for rejectBooking:", e);
    throw new Error("Invalid server response when rejecting the booking.");
  }
}

export async function cancelBooking(bookingId: number): Promise<void> {
  const url = `${API_BASE}/api/v1/bookings/${bookingId}`;

  const res = await fetch(url, {
    method: "DELETE",
    credentials: "include",
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || "Error cancelling booking");
  }
}

export default { createBooking, getBookings, confirmBooking, rejectBooking, cancelBooking };
