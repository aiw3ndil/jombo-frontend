import { apiFetch } from "./http";

export type ExperienceLevel = "new" | "regular" | "experienced" | "expert";

export interface Verifications {
  email: boolean;
  google: boolean;
  /** Email verificado */
  verified?: boolean;
}

export interface PublicProfile {
  id: number;
  name: string;
  picture_url: string | null;
  bio: string | null;
  member_since: string;
  experience_level: ExperienceLevel;
  average_rating: number;
  total_reviews: number;
  trips_driven: number;
  rides_taken: number;
  verifications: Verifications;
  upcoming_trips: {
    id: number;
    departure_location: string;
    arrival_location: string;
    departure_time: string;
    price: string | number;
    available_seats: number;
    instant_booking: boolean;
    stops: { location: string }[];
  }[];
  reviews: { id: number; rating: number; comment: string | null; created_at: string; reviewer: { id: number; name: string } }[];
}

export async function getPublicProfile(id: number | string): Promise<PublicProfile | null> {
  try {
    return await apiFetch<PublicProfile>(`/api/v1/users/${id}`);
  } catch (e: any) {
    if (e?.status === 404) return null;
    throw e;
  }
}

export const sendEmailVerification = () => apiFetch<{ message: string }>("/api/v1/verification/email", { method: "POST" });
export const confirmEmail = (token: string) =>
  apiFetch<{ message: string; verifications: Verifications }>("/api/v1/verification/email/confirm", { method: "POST", json: { token } });

