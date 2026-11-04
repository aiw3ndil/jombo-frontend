"use client";
import { useTranslation } from "@/app/hooks/useTranslation";
import type { Trip } from "@/app/lib/api/trips";

const fmtTime = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : null;

/** Recorrido del viaje (origen, paradas, destino) resaltando el tramo buscado */
export default function RouteTimeline({ trip }: { trip: Trip }) {
  const { t } = useTranslation();
  const arrival = trip.duration_minutes
    ? new Date(new Date(trip.departure_time).getTime() + trip.duration_minutes * 60000).toISOString()
    : null;
  const points = [
    { location: trip.departure_location, time: trip.departure_time },
    ...(trip.stops || []).map((s) => ({ location: s.location, time: s.departure_time })),
    { location: trip.arrival_location, time: arrival },
  ];
  const seg = trip.segment;
  const start = seg ? points.findIndex((p) => p.location === seg.from) : 0;
  const endIdx = seg ? points.findIndex((p, i) => i > start && p.location === seg.to) : points.length - 1;

  return (
    <ol className="relative space-y-3">
      {points.map((p, i) => {
        const inSegment = i >= start && i <= endIdx;
        const isStop = i > 0 && i < points.length - 1;
        return (
          <li key={`${p.location}-${i}`} className="relative flex items-start gap-3 pl-1">
            {i < points.length - 1 && (
              <span
                className={`absolute left-[9px] top-5 h-[calc(100%+0.25rem)] w-0.5 ${inSegment && i < endIdx ? "bg-[var(--brand-blue)]" : "bg-[#c4d8b4]"}`}
                aria-hidden="true"
              />
            )}
            <span
              className={`relative z-10 mt-1 h-3.5 w-3.5 shrink-0 rounded-full border-2 ${
                inSegment ? "border-[var(--brand-blue)] bg-white" : "border-[#c4d8b4] bg-[#ebf3e2]"
              } ${isStop ? "" : "ring-2 ring-offset-1 ring-[#c4d8b4]"}`}
            />
            <div className={`flex-1 ${inSegment ? "" : "opacity-60"}`}>
              <div className="flex items-baseline gap-2">
                <span className="w-12 shrink-0 text-sm font-bold text-[var(--brand-dark)]">{fmtTime(p.time) ?? "—"}</span>
                <span className="font-semibold text-[var(--brand-dark)]">{p.location}</span>
              </div>
              {isStop && <span className="ml-14 text-xs text-[var(--brand-neutral)]">{t("stops.stop", "Stop")}</span>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
