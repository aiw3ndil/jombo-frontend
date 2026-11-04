"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslation } from "@/app/hooks/useTranslation";
import { useAuth } from "@/app/contexts/AuthContext";
import { getRideRequests, type RideRequest } from "@/app/lib/api/rideRequests";
import { langPrefix } from "@/app/lib/i18n/config";
import LocationInput from "@/app/components/LocationInput";
import VerifiedBadges from "@/app/components/VerifiedBadges";

/** Tablón público de peticiones de viaje: los conductores pueden ofrecer su kyyti */
export default function RideRequestsPage() {
  const { t, loading: tLoading } = useTranslation();
  const { user } = useAuth();
  const lang = (useParams()?.lang as string) || "fi";
  const [filters, setFilters] = useState({ from: "", to: "", date: "" });
  const [applied, setApplied] = useState(filters);
  const [requests, setRequests] = useState<RideRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getRideRequests(applied)
      .then(setRequests)
      .catch(() => setRequests([]))
      .finally(() => setLoading(false));
  }, [applied]);

  if (tLoading) return <div className="spinner mx-auto my-24" />;

  const offerHref = (r: RideRequest) =>
    `${langPrefix(lang)}/create-trip?${new URLSearchParams({
      ride_request: String(r.id),
      from: r.departure_location,
      to: r.arrival_location,
      date: r.departure_date,
      seats: String(r.seats),
    })}`;

  return (
    <div className="min-h-screen bg-[var(--page-bg)]">
      <section className="border-b-2 border-[#c4d8b4] bg-[#ebf3e2] px-4 py-8">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[var(--brand-dark)] md:text-3xl">{t("rideRequests.title", "Looking for a ride")}</h1>
              <p className="max-w-2xl text-[var(--brand-neutral)]">
                {t("rideRequests.subtitle", "Passengers post where they need to go. Driving that way? Offer your ride and fill your empty seats.")}
              </p>
            </div>
            <Link href={`${langPrefix(lang)}/ride-requests/new`} className="btn-primary shrink-0 px-5 py-3">
              + {t("rideRequests.post", "Post a ride request")}
            </Link>
          </div>
          <form
            className="mt-6 grid gap-3 rounded-2xl border-2 border-[#c4d8b4] bg-white p-3 md:grid-cols-[1fr_1fr_10rem_auto]"
            onSubmit={(e) => {
              e.preventDefault();
              setApplied(filters);
            }}
          >
            <LocationInput value={filters.from} onChange={(v) => setFilters((f) => ({ ...f, from: v }))} placeholder={t("page.home.from", "From")} className="form-input" />
            <LocationInput value={filters.to} onChange={(v) => setFilters((f) => ({ ...f, to: v }))} placeholder={t("page.home.to", "To")} className="form-input" />
            <input type="date" value={filters.date} onChange={(e) => setFilters((f) => ({ ...f, date: e.target.value }))} className="form-input" aria-label={t("filters.date", "Date")} />
            <button type="submit" className="btn-primary px-5 py-2">{t("page.home.search", "Search")}</button>
          </form>
        </div>
      </section>

      <section className="px-4 py-8">
        <div className="mx-auto max-w-5xl">
          {loading ? (
            <div className="spinner mx-auto my-12" />
          ) : requests.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-[#c4d8b4] bg-white p-10 text-center">
              <p className="mb-2 text-lg font-bold text-[var(--brand-dark)]">{t("rideRequests.empty", "No ride requests here yet")}</p>
              <p className="text-[var(--brand-neutral)]">{t("rideRequests.emptyHint", "Be the first: post where you need to go and drivers will see it.")}</p>
            </div>
          ) : (
            <ul className="grid gap-4 md:grid-cols-2">
              {requests.map((r) => {
                const own = user?.id === r.user.id;
                return (
                  <li key={r.id} className="flex flex-col rounded-2xl border-2 border-[#c4d8b4] bg-white p-5">
                    <p className="text-sm font-bold uppercase tracking-wide text-[var(--brand-blue)]">
                      {new Date(r.departure_date).toLocaleDateString(lang, { weekday: "short", day: "numeric", month: "long" })}
                      {r.flexible_days > 0 && ` ± ${r.flexible_days} ${t("rideRequests.days", "d")}`}
                    </p>
                    <h2 className="text-xl font-bold text-[var(--brand-dark)]">
                      {r.departure_location} → {r.arrival_location}
                    </h2>
                    <p className="mt-1 text-sm text-[var(--brand-neutral)]">
                      👤 {r.user.name} · {r.seats} {r.seats === 1 ? t("page.search.seat", "seat") : t("page.search.seats", "seats")}
                      {r.max_price ? ` · ${t("rideRequests.upTo", "up to")} ${Number(r.max_price).toFixed(0)} €` : ""}
                    </p>
                    <div className="mt-2"><VerifiedBadges verifications={r.user.verifications} /></div>
                    {r.note && <p className="mt-3 text-[var(--brand-neutral)]">“{r.note}”</p>}
                    <div className="mt-auto pt-4">
                      {own ? (
                        <Link href={`${langPrefix(lang)}/alerts`} className="btn-secondary px-4 py-2 text-sm">{t("rideRequests.manage", "Manage my request")}</Link>
                      ) : (
                        <Link href={offerHref(r)} className="btn-primary px-4 py-2 text-sm">🚗 {t("rideRequests.offer", "Offer a ride")}</Link>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
