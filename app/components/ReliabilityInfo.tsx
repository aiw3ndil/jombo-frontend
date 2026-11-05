"use client";
import { useTranslation } from "@/app/hooks/useTranslation";
import type { Reliability } from "@/app/lib/api/users";

function responseLabel(hours: number, t: (k: string, d?: string) => string) {
  if (hours < 1) return t("reliability.withinHour", "Usually replies within an hour");
  if (hours < 24) return t("reliability.withinHours", "Usually replies within {{n}} h").replace("{{n}}", String(Math.ceil(hours)));
  return t("reliability.withinDays", "Usually replies within {{n}} days").replace("{{n}}", String(Math.ceil(hours / 24)));
}

/** Tiempo de respuesta y tasa de cancelación del conductor (solo si hay datos suficientes) */
export default function ReliabilityInfo({ reliability, className = "" }: { reliability?: Reliability; className?: string }) {
  const { t } = useTranslation();
  if (!reliability) return null;
  const { response_hours, cancellation_rate } = reliability;
  if (response_hours == null && cancellation_rate == null) return null;

  return (
    <ul className={`space-y-0.5 text-sm text-[var(--brand-neutral)] ${className}`}>
      {response_hours != null && <li>⏱️ {responseLabel(response_hours, t)}</li>}
      {cancellation_rate != null && (
        <li>
          {cancellation_rate === 0
            ? `✅ ${t("reliability.neverCancelled", "Has never cancelled a ride")}`
            : `↩️ ${t("reliability.cancelled", "Cancelled {{n}}% of rides").replace("{{n}}", String(cancellation_rate))}`}
        </li>
      )}
    </ul>
  );
}
