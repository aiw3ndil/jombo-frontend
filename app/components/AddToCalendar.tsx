"use client";
import { useTranslation } from "@/app/hooks/useTranslation";
import { downloadIcs, googleCalendarUrl, type CalendarEvent } from "@/app/lib/calendar";

/** Botones para añadir un viaje al calendario: Google Calendar o archivo .ics (Apple, Outlook…) */
export default function AddToCalendar({ event, className = "" }: { event: CalendarEvent; className?: string }) {
  const { t } = useTranslation();
  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <span className="text-sm font-semibold text-[var(--brand-neutral)]">📅 {t("calendar.add", "Add to calendar")}:</span>
      <a
        href={googleCalendarUrl(event)}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-full border-2 border-[#c4d8b4] bg-white px-3 py-1 text-sm font-semibold text-[var(--brand-dark)] hover:bg-[#f3f7ed]"
      >
        Google
      </a>
      <button
        type="button"
        onClick={() => downloadIcs(event, `jombo-${event.uid}.ics`)}
        className="rounded-full border-2 border-[#c4d8b4] bg-white px-3 py-1 text-sm font-semibold text-[var(--brand-dark)] hover:bg-[#f3f7ed]"
      >
        {t("calendar.ics", "Apple / Outlook (.ics)")}
      </button>
    </div>
  );
}
