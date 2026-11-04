"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "@/app/hooks/useTranslation";
import {
  getMyVehicles,
  Vehicle,
  VehicleInput,
  VEHICLE_TYPES,
  FUEL_TYPES,
  VEHICLE_COLORS,
} from "@/app/lib/api/vehicles";

export type VehicleChoice =
  | { mode: "existing"; vehicle: Vehicle }
  | { mode: "new"; vehicle: VehicleInput }
  | null;

export const EMPTY_VEHICLE: VehicleInput = {
  brand: "",
  model: "",
  vehicle_type: "hatchback",
  color: "white",
  doors: 5,
  seats: 5,
  year: null,
  fuel_type: null,
};

export function isVehicleInputComplete(v: VehicleInput) {
  return v.brand.trim() !== "" && v.model.trim() !== "" && !!v.vehicle_type && !!v.color && v.doors > 0 && v.seats > 0;
}

/** Texto corto para mostrar un vehículo: "Toyota Corolla · Blue · Hatchback" */
export function useVehicleLabel() {
  const { t } = useTranslation();
  return (v: Pick<Vehicle, "brand" | "model" | "color" | "vehicle_type">) =>
    [
      `${v.brand} ${v.model}`.trim(),
      t(`vehicle.colors.${v.color}`, v.color),
      t(`vehicle.types.${v.vehicle_type}`, v.vehicle_type),
    ]
      .filter(Boolean)
      .join(" · ");
}

function CarIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 17h14M5 17a2 2 0 11-4 0 2 2 0 014 0zm14 0a2 2 0 104 0 2 2 0 00-4 0zM3 17v-5l2.5-5h13L21 12v5M3 12h18" />
    </svg>
  );
}

function SelectArrow() {
  return (
    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--brand-blue)] pointer-events-none">
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  );
}

export default function VehicleSelector({
  value,
  onChange,
  initialVehicleId = null,
}: {
  value: VehicleChoice;
  onChange: (choice: VehicleChoice) => void;
  /** Vehículo a preseleccionar (p. ej. el del viaje que se edita) */
  initialVehicleId?: number | null;
}) {
  const { t } = useTranslation();
  const vehicleLabel = useVehicleLabel();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState<VehicleInput>(EMPTY_VEHICLE);

  useEffect(() => {
    let cancelled = false;
    getMyVehicles()
      .then((list) => {
        if (cancelled) return;
        setVehicles(list);
        if (list.length > 0) {
          const initial = list.find((v) => v.id === initialVehicleId) ?? list[0];
          onChange({ mode: "existing", vehicle: initial });
        } else {
          setAdding(true);
          onChange({ mode: "new", vehicle: EMPTY_VEHICLE });
        }
      })
      .catch(() => {
        if (cancelled) return;
        setAdding(true);
        onChange({ mode: "new", vehicle: EMPTY_VEHICLE });
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateDraft = <K extends keyof VehicleInput>(key: K, val: VehicleInput[K]) => {
    const next = { ...draft, [key]: val };
    setDraft(next);
    onChange({ mode: "new", vehicle: next });
  };

  const startAdding = () => {
    setAdding(true);
    onChange({ mode: "new", vehicle: draft });
  };

  const cancelAdding = () => {
    setAdding(false);
    onChange(vehicles[0] ? { mode: "existing", vehicle: vehicles[0] } : null);
  };

  if (loading) {
    return <p className="text-[var(--brand-neutral)] font-medium">{t("vehicle.loading", "Loading vehicles...")}</p>;
  }

  return (
    <div className="space-y-6">
      {!adding && vehicles.length > 0 && (
        <>
          <p className="text-[var(--brand-neutral)] font-medium">{t("vehicle.select", "Choose the car for this trip")}</p>
          <div className="grid md:grid-cols-2 gap-4">
            {vehicles.map((v) => {
              const selected = value?.mode === "existing" && value.vehicle.id === v.id;
              return (
                <button
                  type="button"
                  key={v.id}
                  onClick={() => onChange({ mode: "existing", vehicle: v })}
                  aria-pressed={selected}
                  className={`text-left rounded-2xl border-2 p-5 flex items-start gap-4 transition-all ${
                    selected
                      ? "border-[var(--brand-blue)] bg-[#ebf3e2] shadow-md"
                      : "border-[#c4d8b4] hover:border-[var(--brand-blue)]/50"
                  }`}
                >
                  <span className={selected ? "text-[var(--brand-blue)]" : "text-[var(--brand-neutral)]"}>
                    <CarIcon className="w-8 h-8" />
                  </span>
                  <span>
                    <span className="block font-bold text-[var(--brand-dark)]">
                      {v.brand} {v.model} {v.year ? <span className="font-medium text-[var(--brand-neutral)]">({v.year})</span> : null}
                    </span>
                    <span className="block text-sm text-[var(--brand-neutral)] mt-1">
                      {t(`vehicle.colors.${v.color}`, v.color)} · {t(`vehicle.types.${v.vehicle_type}`, v.vehicle_type)}
                    </span>
                    <span className="block text-sm text-[var(--brand-neutral)]">
                      {v.doors} {t("vehicle.doorsShort", "doors")} · {v.seats} {t("vehicle.seatsShort", "seats")}
                      {v.fuel_type ? ` · ${t(`vehicle.fuels.${v.fuel_type}`, v.fuel_type)}` : ""}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
          <button type="button" onClick={startAdding} className="btn-secondary px-6 py-3 inline-flex items-center gap-2">
            <span className="text-lg leading-none">+</span> {t("vehicle.add", "Add vehicle")}
          </button>
        </>
      )}

      {adding && (
        <div className="bg-[#ebf3e2]/50 border-2 border-[#c4d8b4] rounded-[2rem] p-6 md:p-8 space-y-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <h3 className="text-lg font-bold text-[var(--brand-dark)] flex items-center gap-2">
              <CarIcon className="w-6 h-6 text-[var(--brand-blue)]" />
              {t("vehicle.newTitle", "New vehicle")}
            </h3>
            {vehicles.length > 0 && (
              <button type="button" onClick={cancelAdding} className="text-sm font-bold text-[var(--brand-blue)] underline underline-offset-4">
                {t("vehicle.cancelAdd", "Use an existing vehicle")}
              </button>
            )}
          </div>
          {vehicles.length === 0 && (
            <p className="text-[var(--brand-neutral)] font-medium">{t("vehicle.none", "You don't have any vehicles yet. Add the car you will drive.")}</p>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="form-label">{t("vehicle.brand", "Brand")} *</label>
              <input
                type="text"
                value={draft.brand}
                onChange={(e) => updateDraft("brand", e.target.value)}
                className="form-input"
                placeholder={t("vehicle.brandPlaceholder", "e.g. Toyota")}
                maxLength={50}
                required
              />
            </div>
            <div>
              <label className="form-label">{t("vehicle.model", "Model")} *</label>
              <input
                type="text"
                value={draft.model}
                onChange={(e) => updateDraft("model", e.target.value)}
                className="form-input"
                placeholder={t("vehicle.modelPlaceholder", "e.g. Corolla")}
                maxLength={50}
                required
              />
            </div>
            <div>
              <label className="form-label">{t("vehicle.type", "Car type")} *</label>
              <div className="relative">
                <select value={draft.vehicle_type} onChange={(e) => updateDraft("vehicle_type", e.target.value)} className="form-select pr-12 font-bold" required>
                  {VEHICLE_TYPES.map((type) => (
                    <option key={type} value={type}>{t(`vehicle.types.${type}`, type)}</option>
                  ))}
                </select>
                <SelectArrow />
              </div>
            </div>
            <div>
              <label className="form-label">{t("vehicle.color", "Colour")} *</label>
              <div className="relative">
                <select value={draft.color} onChange={(e) => updateDraft("color", e.target.value)} className="form-select pr-12 font-bold" required>
                  {VEHICLE_COLORS.map((color) => (
                    <option key={color} value={color}>{t(`vehicle.colors.${color}`, color)}</option>
                  ))}
                </select>
                <SelectArrow />
              </div>
            </div>
            <div>
              <label className="form-label">{t("vehicle.doors", "Doors")} *</label>
              <div className="relative">
                <select value={draft.doors} onChange={(e) => updateDraft("doors", Number(e.target.value))} className="form-select pr-12 font-bold" required>
                  {[2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
                <SelectArrow />
              </div>
            </div>
            <div>
              <label className="form-label">{t("vehicle.seats", "Seats (incl. driver)")} *</label>
              <div className="relative">
                <select value={draft.seats} onChange={(e) => updateDraft("seats", Number(e.target.value))} className="form-select pr-12 font-bold" required>
                  {[2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
                <SelectArrow />
              </div>
            </div>
            <div>
              <label className="form-label">{t("vehicle.year", "Year (optional)")}</label>
              <input
                type="number"
                value={draft.year ?? ""}
                onChange={(e) => updateDraft("year", e.target.value ? Number(e.target.value) : null)}
                className="form-input"
                min={1950}
                max={new Date().getFullYear() + 1}
                placeholder="2020"
              />
            </div>
            <div>
              <label className="form-label">{t("vehicle.fuel", "Fuel (optional)")}</label>
              <div className="relative">
                <select value={draft.fuel_type ?? ""} onChange={(e) => updateDraft("fuel_type", e.target.value || null)} className="form-select pr-12 font-bold">
                  <option value="">{t("vehicle.fuelNone", "Not specified")}</option>
                  {FUEL_TYPES.map((fuel) => (
                    <option key={fuel} value={fuel}>{t(`vehicle.fuels.${fuel}`, fuel)}</option>
                  ))}
                </select>
                <SelectArrow />
              </div>
            </div>
          </div>
        </div>
      )}

      {value && (
        <p className="text-sm text-[var(--brand-neutral)] font-medium">
          {value.mode === "existing" && vehicleLabel(value.vehicle)}
          {value.mode === "existing" && " — "}
          {t("vehicle.seatsLimit", "This car has room for {{count}} passengers").replace("{{count}}", String(Math.max(value.vehicle.seats - 1, 0)))}
        </p>
      )}
    </div>
  );
}

/** Línea compacta con el coche de un viaje, para tarjetas y detalles */
export function VehicleSummary({ vehicle, className = "" }: { vehicle?: Vehicle | null; className?: string }) {
  const { t } = useTranslation();
  if (!vehicle) return null;
  return (
    <p className={`flex items-center gap-2 text-[var(--brand-neutral)] font-semibold ${className}`}>
      <CarIcon className="w-5 h-5 text-[var(--brand-blue)] flex-shrink-0" />
      <span>
        <span className="text-[var(--brand-dark)] font-bold">{vehicle.brand} {vehicle.model}</span>
        {" · "}{t(`vehicle.colors.${vehicle.color}`, vehicle.color)}
        {" · "}{t(`vehicle.types.${vehicle.vehicle_type}`, vehicle.vehicle_type)}
        {" · "}{vehicle.doors} {t("vehicle.doorsShort", "doors")}
        {vehicle.fuel_type ? ` · ${t(`vehicle.fuels.${vehicle.fuel_type}`, vehicle.fuel_type)}` : ""}
      </span>
    </p>
  );
}
