"use client";
import { useState } from "react";
import { useTranslation } from "@/app/hooks/useTranslation";
import type { SearchFilters } from "@/app/lib/api/trips";

/** Lee los filtros de búsqueda desde los parámetros de la URL */
export function filtersFromParams(params: URLSearchParams): SearchFilters {
  const bool = (k: string) => params.get(k) === "true";
  const num = (k: string) => (params.get(k) ? Number(params.get(k)) : undefined);
  return {
    date: params.get("date") || undefined,
    time_of_day: (params.get("time_of_day") as SearchFilters["time_of_day"]) || undefined,
    min_seats: num("min_seats"),
    instant_booking: bool("instant_booking"),
    pets: bool("pets"),
    no_smoking: bool("no_smoking"),
    max_two_back: bool("max_two_back"),
    max_price: num("max_price"),
    sort: (params.get("sort") as SearchFilters["sort"]) || undefined,
  };
}

export function activeFilterCount(f: SearchFilters) {
  return [f.date, f.time_of_day, f.min_seats, f.instant_booking, f.pets, f.no_smoking, f.max_two_back, f.max_price].filter(Boolean).length;
}

const chip = (active: boolean) =>
  `rounded-full border-2 px-3 py-1.5 text-sm font-semibold transition-colors ${
    active ? "border-[var(--brand-blue)] bg-[var(--brand-blue)] text-white" : "border-[#c4d8b4] bg-white text-[var(--brand-dark)] hover:bg-[#f3f7ed]"
  }`;

/** Filtros y orden de resultados (desplegable en móvil) */
export default function SearchFiltersBar({ value, onChange }: { value: SearchFilters; onChange: (f: SearchFilters) => void }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const set = <K extends keyof SearchFilters>(key: K, v: SearchFilters[K]) => onChange({ ...value, [key]: v });
  const count = activeFilterCount(value);

  return (
    <div className="mb-6 rounded-2xl border-2 border-[#c4d8b4] bg-white p-4">
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={() => setOpen((o) => !o)} className="btn-secondary px-4 py-2 text-sm md:hidden" aria-expanded={open}>
          ⚙️ {t("filters.title", "Filters")}
          {count > 0 && ` (${count})`}
        </button>
        <label className="ml-auto flex items-center gap-2 text-sm font-semibold text-[var(--brand-neutral)] md:order-last">
          {t("filters.sort", "Sort by")}
          <select value={value.sort || "departure_time"} onChange={(e) => set("sort", e.target.value as SearchFilters["sort"])} className="form-select py-1.5 text-sm">
            <option value="departure_time">{t("filters.sortTime", "Earliest departure")}</option>
            <option value="price">{t("filters.sortPrice", "Lowest price")}</option>
            <option value="duration">{t("filters.sortDuration", "Shortest trip")}</option>
          </select>
        </label>
        <div className={`${open ? "flex" : "hidden"} w-full flex-wrap items-center gap-2 md:flex md:w-auto md:flex-1`}>
          <input
            type="date"
            value={value.date || ""}
            onChange={(e) => set("date", e.target.value || undefined)}
            className="form-input w-auto py-1.5 text-sm"
            aria-label={t("filters.date", "Date")}
          />
          <select
            value={value.time_of_day || ""}
            onChange={(e) => set("time_of_day", (e.target.value || undefined) as SearchFilters["time_of_day"])}
            className="form-select w-auto py-1.5 text-sm"
            aria-label={t("filters.timeOfDay", "Departure time")}
          >
            <option value="">{t("filters.anyTime", "Any time")}</option>
            <option value="morning">{t("filters.morning", "Before 12:00")}</option>
            <option value="afternoon">{t("filters.afternoon", "12:00–18:00")}</option>
            <option value="evening">{t("filters.evening", "After 18:00")}</option>
          </select>
          <select
            value={value.min_seats || ""}
            onChange={(e) => set("min_seats", e.target.value ? Number(e.target.value) : undefined)}
            className="form-select w-auto py-1.5 text-sm"
            aria-label={t("filters.seats", "Seats")}
          >
            <option value="">{t("filters.anySeats", "Any seats")}</option>
            {[2, 3, 4].map((n) => (
              <option key={n} value={n}>
                {n}+ {t("page.search.seats", "seats")}
              </option>
            ))}
          </select>
          <button type="button" className={chip(!!value.instant_booking)} onClick={() => set("instant_booking", !value.instant_booking)}>
            ⚡ {t("prefs.instant", "Instant booking")}
          </button>
          <button type="button" className={chip(!!value.pets)} onClick={() => set("pets", !value.pets)}>
            🐾 {t("prefs.pets", "Pets OK")}
          </button>
          <button type="button" className={chip(!!value.no_smoking)} onClick={() => set("no_smoking", !value.no_smoking)}>
            🚭 {t("prefs.noSmoking", "No smoking")}
          </button>
          <button type="button" className={chip(!!value.max_two_back)} onClick={() => set("max_two_back", !value.max_two_back)}>
            💺 {t("prefs.maxTwoBack", "Max 2 in the back")}
          </button>
          {count > 0 && (
            <button type="button" className="text-sm font-bold text-[var(--brand-blue)] underline" onClick={() => onChange({ sort: value.sort })}>
              {t("filters.clear", "Clear")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
