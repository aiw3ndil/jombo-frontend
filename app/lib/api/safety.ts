import { apiFetch } from "./http";

export const REPORT_REASONS = ["no_show", "unsafe_driving", "inappropriate", "fake_profile", "other"] as const;
export type ReportReason = (typeof REPORT_REASONS)[number];

export const reportUser = (data: { reported_id: number; reason: ReportReason; comment?: string; booking_id?: number }) =>
  apiFetch<{ message: string }>("/api/v1/reports", { method: "POST", json: data });

export const blockUser = (userId: number) => apiFetch<{ blocked: boolean }>(`/api/v1/users/${userId}/block`, { method: "POST" });
export const unblockUser = (userId: number) => apiFetch<{ blocked: boolean }>(`/api/v1/users/${userId}/block`, { method: "DELETE" });
