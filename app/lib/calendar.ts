/** Evento de calendario para un viaje */
export interface CalendarEvent {
  uid: string;
  title: string;
  start: Date;
  durationMinutes?: number | null;
  location?: string;
  description?: string;
  url?: string;
}

const DEFAULT_DURATION = 120;

function endOf(event: CalendarEvent) {
  return new Date(event.start.getTime() + (event.durationMinutes || DEFAULT_DURATION) * 60_000);
}

/** Fecha en UTC con el formato de iCalendar: 20261107T083000Z */
function icsDate(date: Date) {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

/** Escapa texto según RFC 5545 */
function icsText(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/[,;]/g, (c) => `\\${c}`);
}

export function buildIcs(event: CalendarEvent): string {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Jombo//Trips//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${event.uid}@jombo.fi`,
    `DTSTAMP:${icsDate(new Date())}`,
    `DTSTART:${icsDate(event.start)}`,
    `DTEND:${icsDate(endOf(event))}`,
    `SUMMARY:${icsText(event.title)}`,
    event.location ? `LOCATION:${icsText(event.location)}` : null,
    event.description || event.url ? `DESCRIPTION:${icsText([event.description, event.url].filter(Boolean).join("\n"))}` : null,
    event.url ? `URL:${event.url}` : null,
    // Aviso 1 hora antes
    "BEGIN:VALARM",
    "TRIGGER:-PT1H",
    "ACTION:DISPLAY",
    `DESCRIPTION:${icsText(event.title)}`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter(Boolean);
  return lines.join("\r\n");
}

export function downloadIcs(event: CalendarEvent, filename = "jombo-trip.ics") {
  const blob = new Blob([buildIcs(event)], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function googleCalendarUrl(event: CalendarEvent) {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${icsDate(event.start)}/${icsDate(endOf(event))}`,
  });
  if (event.location) params.set("location", event.location);
  const details = [event.description, event.url].filter(Boolean).join("\n");
  if (details) params.set("details", details);
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
