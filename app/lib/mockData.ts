export let mockTrips = [
  {
    id: 1,
    departure_location: "Madrid",
    arrival_location: "Barcelona",
    departure_time: "2025-12-01T09:00:00Z",
    available_seats: 3,
    price: 25.50,
    driver: {
      id: 1,
      name: "Juan Pérez",
      email: "juan@example.com"
    },
    created_at: "2025-11-20T08:00:00Z",
    updated_at: "2025-11-20T08:00:00Z"
  },
  {
    id: 2,
    departure_location: "Madrid",
    arrival_location: "Valencia",
    departure_time: "2025-12-01T14:00:00Z",
    available_seats: 2,
    price: 20.00,
    driver: {
      id: 2,
      name: "María García",
      email: "maria@example.com"
    },
    created_at: "2025-11-20T08:00:00Z",
    updated_at: "2025-11-20T08:00:00Z"
  },
  {
    id: 3,
    departure_location: "Barcelona",
    arrival_location: "Valencia",
    departure_time: "2025-12-02T10:00:00Z",
    available_seats: 4,
    price: 18.75,
    driver: {
      id: 3,
      name: "Carlos López",
      email: "carlos@example.com"
    },
    created_at: "2025-11-20T08:00:00Z",
    updated_at: "2025-11-20T08:00:00Z"
  },
  {
    id: 4,
    departure_location: "Helsinki",
    arrival_location: "Rovaniemi",
    departure_time: "2025-12-03T08:00:00Z",
    available_seats: 4,
    price: 50.00,
    driver: {
      id: 4,
      name: "Mika Häkkinen",
      email: "mika@example.com"
    },
    created_at: "2025-11-20T08:00:00Z",
    updated_at: "2025-11-20T08:00:00Z"
  }
];

export let mockBookings = [
  {
    id: 1,
    user_id: 1,
    trip_id: 1,
    seats: 1,
    status: "confirmed",
    created_at: "2025-11-20T10:00:00Z",
    updated_at: "2025-11-20T10:00:00Z",
    trip: { ...mockTrips[0], price: 25.50 }, // Deep copy and add price for consistency
    user: {
      id: 1,
      name: "Test User",
      email: "test@example.com"
    }
  },
  {
    id: 2,
    user_id: 1,
    trip_id: 4, 
    seats: 2,
    status: "pending",
    created_at: "2025-11-25T12:00:00Z",
    updated_at: "2025-11-25T12:00:00Z",
    trip: { ...mockTrips[3], price: 50.00 }, // Deep copy and add price for consistency
    user: {
      id: 1,
      name: "Test User",
      email: "test@example.com"
    }
  }
];
