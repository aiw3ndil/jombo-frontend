"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTranslation } from "@/app/hooks/useTranslation";
import { useAuth } from "@/app/contexts/AuthContext";
import { deleteAlert, getAlerts, type SearchAlert } from "@/app/lib/api/alerts";
import { deleteRideRequest, getMyRideRequests, updateRideRequest, type RideRequest } from "@/app/lib/api/rideRequests";
import { langPrefix } from "@/app/lib/i18n/config";

/** Mis alertas de búsqueda y mis peticiones de viaje */
export default function AlertsPage() {
  const { t } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const lang = (useParams()?.lang as string) || "fi";
  const [alerts, setAlerts] = useState<SearchAlert[]>([]);
  const [requests, setRequests] = useState<RideRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push(`${langPrefix(lang)}/login?redirect=${langPrefix(lang)}/alerts`);
      return;
    }
    Promise.all([getAlerts(), getMyRideRequests()])
      .then(([a, r]) => {
        setAlerts(a);
        setRequests(r);
      })
      .catch(() => toast.error(t("alerts.loadError", "Could not load your alerts")))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user]);

  if (authLoading || loading) return <div className="spinner mx-auto my-24" />;

  const searchHref = (from: string, to: string, date?: string | null) =>
    `${langPrefix(lang)}/search?${new URLSearchParams({ from, to, ...(date ? { date } : {}) })}`;
  const fmtDate = (d: string) => new Date(d).toLocaleDateString(lang, { weekday: "short", day: "numeric", month: "long" });

  return (
    <div className="min-h-screen bg-[var(--page-bg)] px-4 py-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-[var(--brand-dark)]">{t("alerts.title", "My alerts and requests")}</h1>
          <p className="text-[var(--brand-neutral)]">{t("alerts.subtitle", "We email you when a matching ride is published.")}</p>
        </div>

        <section className="form-card">
          <h2 className="mb-4 text-xl font-bold text-[var(--brand-dark)]">🔔 {t("alerts.searchAlerts", "Search alerts")}</h2>
          {alerts.length === 0 ? (
            <p className="text-[var(--brand-neutral)]">{t("alerts.none", "No alerts yet. Search for a route and tap “Create alert”.")}</p>
          ) : (
            <ul className="divide-y divide-[#e3eed9]">
              {alerts.map((a) => (
                <li key={a.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <Link href={searchHref(a.departure_location, a.arrival_location, a.date)} className="hover:text-[var(--brand-blue)]">
                    <span className="font-semibold text-[var(--brand-dark)]">{a.departure_location} → {a.arrival_location}</span>
                    <span className="block text-sm text-[var(--brand-neutral)]">{a.date ? fmtDate(a.date) : t("alerts.anyDate", "Any date")}</span>
                  </Link>
                  <button
                    type="button"
                    className="text-sm font-bold text-red-600 hover:underline"
                    onClick={async () => {
                      await deleteAlert(a.id);
                      setAlerts((list) => list.filter((x) => x.id !== a.id));
                    }}
                  >
                    {t("alerts.delete", "Delete")}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="form-card">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-bold text-[var(--brand-dark)]">🙋 {t("alerts.myRequests", "My ride requests")}</h2>
            <Link href={`${langPrefix(lang)}/ride-requests/new`} className="btn-secondary px-4 py-2 text-sm">+ {t("rideRequests.post", "Post a ride request")}</Link>
          </div>
          {requests.length === 0 ? (
            <p className="text-[var(--brand-neutral)]">{t("alerts.noRequests", "You haven't posted any ride requests.")}</p>
          ) : (
            <ul className="divide-y divide-[#e3eed9]">
              {requests.map((r) => (
                <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <div>
                    <span className="font-semibold text-[var(--brand-dark)]">{r.departure_location} → {r.arrival_location}</span>
                    <span className="block text-sm text-[var(--brand-neutral)]">
                      {fmtDate(r.departure_date)}
                      {r.flexible_days > 0 && ` ± ${r.flexible_days}`} · {t(`rideRequests.status.${r.status}`, r.status)}
                    </span>
                  </div>
                  <div className="flex gap-3 text-sm font-bold">
                    {r.status === "open" && (
                      <button
                        type="button"
                        className="text-[var(--brand-blue)] hover:underline"
                        onClick={async () => {
                          const updated = await updateRideRequest(r.id, { status: "closed" });
                          setRequests((list) => list.map((x) => (x.id === r.id ? updated : x)));
                        }}
                      >
                        {t("rideRequests.close", "I found a ride")}
                      </button>
                    )}
                    <button
                      type="button"
                      className="text-red-600 hover:underline"
                      onClick={async () => {
                        await deleteRideRequest(r.id);
                        setRequests((list) => list.filter((x) => x.id !== r.id));
                      }}
                    >
                      {t("alerts.delete", "Delete")}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
