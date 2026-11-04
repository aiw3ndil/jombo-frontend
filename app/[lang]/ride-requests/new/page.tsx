"use client";
import { Suspense, useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useTranslation } from "@/app/hooks/useTranslation";
import { useAuth } from "@/app/contexts/AuthContext";
import { createRideRequest } from "@/app/lib/api/rideRequests";
import { langPrefix } from "@/app/lib/i18n/config";
import LocationInput from "@/app/components/LocationInput";

function NewRideRequest() {
  const { t } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const lang = (useParams()?.lang as string) || "fi";
  const q = useSearchParams();
  const today = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState({
    departure_location: q.get("from") || "",
    arrival_location: q.get("to") || "",
    departure_date: q.get("date") || "",
    flexible_days: 0,
    seats: 1,
    max_price: "",
    note: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`${langPrefix(lang)}/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`);
    }
  }, [authLoading, user, router, lang]);

  if (authLoading || !user) return <div className="spinner mx-auto my-24" />;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.departure_location || !form.arrival_location || !form.departure_date) {
      toast.error(t("page.createTrip.requiredFields", "Please complete all required fields"));
      return;
    }
    setSaving(true);
    try {
      await createRideRequest({
        ...form,
        flexible_days: Number(form.flexible_days),
        seats: Number(form.seats),
        max_price: form.max_price ? Number(form.max_price) : null,
      });
      toast.success(t("rideRequests.created", "Request posted. We'll email you when a driver offers a ride."));
      router.push(`${langPrefix(lang)}/alerts`);
    } catch (err: any) {
      toast.error(err?.message || t("rideRequests.error", "Could not post the request"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--page-bg)] px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-1 text-2xl font-bold text-[var(--brand-dark)]">{t("rideRequests.newTitle", "Post a ride request")}</h1>
        <p className="mb-6 text-[var(--brand-neutral)]">{t("rideRequests.newSubtitle", "Tell drivers where and when you need to go. Matching rides are sent to your email.")}</p>
        <form onSubmit={submit} className="form-card space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="form-label">{t("page.createTrip.from", "Origin")} *</label>
              <LocationInput value={form.departure_location} onChange={(v) => setForm((f) => ({ ...f, departure_location: v }))} className="form-input" required />
            </div>
            <div>
              <label className="form-label">{t("page.createTrip.to", "Destination")} *</label>
              <LocationInput value={form.arrival_location} onChange={(v) => setForm((f) => ({ ...f, arrival_location: v }))} className="form-input" required />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="form-label">{t("page.createTrip.date", "Date")} *</label>
              <input type="date" min={today} value={form.departure_date} onChange={(e) => setForm((f) => ({ ...f, departure_date: e.target.value }))} className="form-input" required />
            </div>
            <div>
              <label className="form-label">{t("rideRequests.flexible", "Flexibility")}</label>
              <select value={form.flexible_days} onChange={(e) => setForm((f) => ({ ...f, flexible_days: Number(e.target.value) }))} className="form-select">
                <option value={0}>{t("rideRequests.exactDate", "Exact date")}</option>
                {[1, 2, 3].map((n) => (
                  <option key={n} value={n}>± {n} {t("rideRequests.daysLong", "days")}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="form-label">{t("filters.seats", "Seats")}</label>
              <input type="number" min={1} max={8} value={form.seats} onChange={(e) => setForm((f) => ({ ...f, seats: Number(e.target.value) }))} className="form-input" />
            </div>
          </div>
          <div>
            <label className="form-label">{t("rideRequests.maxPrice", "Max price per seat (€, optional)")}</label>
            <input type="number" min={0} step="1" value={form.max_price} onChange={(e) => setForm((f) => ({ ...f, max_price: e.target.value }))} className="form-input" />
          </div>
          <div>
            <label className="form-label">{t("rideRequests.note", "Message to drivers (optional)")}</label>
            <textarea maxLength={500} rows={3} value={form.note} onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))} className="form-input resize-y" placeholder={t("rideRequests.notePlaceholder", "E.g. I have a small backpack and can meet anywhere in the centre.")} />
          </div>
          <div className="flex flex-col-reverse gap-3 md:flex-row">
            <button type="button" onClick={() => router.back()} className="btn-secondary flex-1">{t("page.createTrip.cancel", "Cancel")}</button>
            <button type="submit" disabled={saving} className="btn-primary flex-[2]">{saving ? "…" : t("rideRequests.submit", "Post request")}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function NewRideRequestPage() {
  return (
    <Suspense fallback={<div className="spinner mx-auto my-24" />}>
      <NewRideRequest />
    </Suspense>
  );
}
