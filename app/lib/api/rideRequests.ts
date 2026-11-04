import { apiFetch } from "./http";
import type { Verifications } from "./users";

export interface RideRequest {
  id: number;
  departure_location: string;
  arrival_location: string;
  departure_date: string;
  flexible_days: number;
  seats: number;
  max_price: string | number | null;
  note: string | null;
  status: "open" | "matched" | "closed";
  created_at: string;
  user: { id: number; name: string; verifications: Verifications };
}

export type RideRequestInput = Pick<RideRequest, "departure_location" | "arrival_location" | "departure_date" | "flexible_days" | "seats"> & {
  max_price?: number | null;
  note?: string;
};

export function getRideRequests(filters: { from?: string; to?: string; date?: string } = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => v && params.set(k, v));
  return apiFetch<RideRequest[]>(`/api/v1/ride_requests?${params.toString()}`);
}

export const getRideRequest = (id: number | string) => apiFetch<RideRequest>(`/api/v1/ride_requests/${id}`);
export const getMyRideRequests = () => apiFetch<RideRequest[]>("/api/v1/ride_requests/mine");
export const createRideRequest = (data: RideRequestInput) =>
  apiFetch<RideRequest>("/api/v1/ride_requests", { method: "POST", json: { ride_request: data } });
export const updateRideRequest = (id: number, data: Partial<RideRequestInput> & { status?: RideRequest["status"] }) =>
  apiFetch<RideRequest>(`/api/v1/ride_requests/${id}`, { method: "PATCH", json: { ride_request: data } });
export const deleteRideRequest = (id: number) => apiFetch<void>(`/api/v1/ride_requests/${id}`, { method: "DELETE" });
