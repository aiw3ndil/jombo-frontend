"use client";
import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTranslation } from "@/app/hooks/useTranslation";
import { useAuth } from "@/app/contexts/AuthContext";
import { createAlert } from "@/app/lib/api/alerts";
import { langPrefix } from "@/app/lib/i18n/config";

/** Crear una alerta para la ruta buscada o publicar una petición de viaje */
export default function SearchAlertCta({ from, to, date, hasResults }: { from: string; to: string; date?: string; hasResults: boolean }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const router = useRouter();
  const lang = (useParams()?.lang as string) || "fi";
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const requestHref = `${langPrefix(lang)}/ride-requests/new?${new URLSearchParams({ from, to, ...(date ? { date } : {}) }).toString()}`;

  const handleAlert = async () => {
    if (!user) {
      router.push(`${langPrefix(lang)}/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`);
      return;
    }
    setSaving(true);
    try {
      await createAlert({ departure_location: from, arrival_location: to, date: date || null });
      setSaved(true);
      toast.success(t("alerts.created", "Alert saved. We'll let you know when a ride is published."));
    } catch (e: any) {
      if (String(e?.message).includes("already exists")) setSaved(true);
      else toast.error(e?.message || t("alerts.error", "Could not save the alert"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={`mb-6 flex flex-col gap-3 rounded-2xl border-2 p-4 md:flex-row md:items-center ${hasResults ? "border-[#c4d8b4] bg-white" : "border-[var(--brand-blue)] bg-[#eef6e7]"}`}>
      <div className="flex-1">
        <p className="font-bold text-[var(--brand-dark)]">
          🔔 {hasResults ? t("alerts.ctaTitleResults", "Not the right time?") : t("alerts.ctaTitle", "No ride yet? Get notified.")}
        </p>
        <p className="text-sm text-[var(--brand-neutral)]">
          {t("alerts.ctaText", "We'll email you as soon as a driver publishes a ride for {{from}} → {{to}}.")
            .replace("{{from}}", from)
            .replace("{{to}}", to)}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={handleAlert} disabled={saving || saved} className="btn-primary px-4 py-2 text-sm">
          {saved ? `✓ ${t("alerts.saved", "Alert on")}` : t("alerts.create", "Create alert")}
        </button>
        <Link href={requestHref} className="btn-secondary px-4 py-2 text-sm">
          {t("rideRequests.post", "Post a ride request")}
        </Link>
      </div>
    </div>
  );
}
