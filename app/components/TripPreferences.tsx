"use client";
import { useTranslation } from "@/app/hooks/useTranslation";
import type { Trip } from "@/app/lib/api/trips";

type Item = { key: string; icon: string; label: string; tone?: "on" | "off" };

/** Preferencias del viaje como etiquetas compactas */
export default function TripPreferences({ trip, compact = false }: { trip: Partial<Trip>; compact?: boolean }) {
  const { t } = useTranslation();
  const items: Item[] = [];

  if (trip.instant_booking) items.push({ key: "instant", icon: "⚡", label: t("prefs.instant", "Instant booking"), tone: "on" });
  items.push(
    trip.pets_allowed
      ? { key: "pets", icon: "🐾", label: t("prefs.pets", "Pets OK"), tone: "on" }
      : { key: "pets", icon: "🐾", label: t("prefs.noPets", "No pets"), tone: "off" }
  );
  items.push(
    trip.smoking_allowed
      ? { key: "smoke", icon: "🚬", label: t("prefs.smoking", "Smoking OK"), tone: "on" }
      : { key: "smoke", icon: "🚭", label: t("prefs.noSmoking", "No smoking"), tone: "off" }
  );
  if (trip.music_allowed) items.push({ key: "music", icon: "🎵", label: t("prefs.music", "Music on"), tone: "on" });
  if (trip.max_two_back) items.push({ key: "back", icon: "💺", label: t("prefs.maxTwoBack", "Max 2 in the back"), tone: "on" });
  if (trip.chattiness && trip.chattiness !== "normal") {
    items.push({
      key: "chat",
      icon: trip.chattiness === "quiet" ? "🤫" : "💬",
      label: t(`prefs.chattiness.${trip.chattiness}`, trip.chattiness === "quiet" ? "Quiet ride" : "Loves to chat"),
    });
  }
  if (trip.luggage_size) {
    items.push({ key: "luggage", icon: "🧳", label: t(`prefs.luggage.${trip.luggage_size}`, `${trip.luggage_size} luggage`) });
  }

  const shown = compact ? items.slice(0, 4) : items;

  return (
    <ul className="flex flex-wrap gap-1.5" aria-label={t("prefs.title", "Preferences")}>
      {shown.map((item) => (
        <li
          key={item.key}
          className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
            item.tone === "on"
              ? "border-[#9cc58a] bg-[#e4f1da] text-[var(--brand-dark)]"
              : "border-[#c4d8b4] bg-white text-[var(--brand-neutral)]"
          }`}
        >
          <span aria-hidden="true">{item.icon}</span>
          {item.label}
        </li>
      ))}
    </ul>
  );
}
