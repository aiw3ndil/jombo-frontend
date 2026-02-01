const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";

export interface Review {
  id: number;
  booking_id: number;
  reviewer_id: number;
  reviewee_id: number;
  rating: number;
  comment: string | null;
  created_at: string;
  updated_at: string;
  reviewer?: {
    id: number;
    name: string;
    email: string;
    picture_url?: string;
  };
  reviewee?: {
    id: number;
    name: string;
    email: string;
    picture_url?: string;
  };
}

export interface CreateReviewData {
  rating: number;
  comment?: string;
}

export async function createReview(bookingId: number, data: CreateReviewData): Promise<Review> {
  const url = `${API_BASE}/api/v1/bookings/${bookingId}/reviews`;

  console.log('📤 Creating review:', { bookingId, data });

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      review: {
        rating: data.rating,
        comment: data.comment || null,
      },
    }),
  });

  console.log('📥 Review response status:', res.status);

  if (!res.ok) {
    let errorMessage = "Error al crear la reseña";

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

  const review = await res.json();
  console.log('✅ Review created:', review);
  return review;
}

export async function getBookingReviews(bookingId: number): Promise<Review[]> {
  const url = `${API_BASE}/api/v1/bookings/${bookingId}/reviews`;

  const res = await fetch(url, {
    method: "GET",
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Error al obtener las reseñas");
  }

  return await res.json();
}

export async function getUserReviews(userId: number): Promise<Review[]> {
  const url = `${API_BASE}/api/v1/users/${userId}/reviews`;

  const res = await fetch(url, {
    method: "GET",
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Error al obtener las reseñas del usuario");
  }

  return await res.json();
}

export default { createReview, getBookingReviews, getUserReviews };
