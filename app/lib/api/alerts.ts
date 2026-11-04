import { apiFetch } from "./http";

export interface SearchAlert {
  id: number;
  departure_location: string;
  arrival_location: string;
  date: string | null;
  active: boolean;
  last_notified_at: string | null;
  created_at: string;
}

export const getAlerts = () => apiFetch<SearchAlert[]>("/api/v1/search_alerts");
export const createAlert = (data: { departure_location: string; arrival_location: string; date?: string | null }) =>
  apiFetch<SearchAlert>("/api/v1/search_alerts", { method: "POST", json: { search_alert: data } });
export const deleteAlert = (id: number) => apiFetch<void>(`/api/v1/search_alerts/${id}`, { method: "DELETE" });
