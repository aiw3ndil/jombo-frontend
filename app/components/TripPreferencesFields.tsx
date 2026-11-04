"use client";
import { useTranslation } from "@/app/hooks/useTranslation";
import type { Chattiness, LuggageSize, TripPreferencesData } from "@/app/lib/api/trips";

type BoolKey = "instant_booking" | "pets_allowed" | "smoking_allowed" | "music_allowed" | "max_two_back";

function Toggle({ checked, onChange, label, help }: { checked: boolean; onChange: (v: boolean) => void; label: string; help?: string }) {
  return (
    <label className={`flex cursor-pointer items-start gap-3 rounded-xl border-2 p-3 transition-colors ${checked ? "border-[var(--brand-blue)] bg-[#eef6e7]" : "border-[#c4d8b4] bg-white hover:bg-[#f7fbf3]"}`}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-1 h-4 w-4 accent-[var(--brand-blue)]" />
      <span>
        <span className="block font-semibold text-[var(--brand-dark)]">{label}</span>
        {help && <span className="block text-xs text-[var(--brand-neutral)]">{help}</span>}
      </span>
    </label>
  );
}

/** Campos de preferencias y modo de reserva del formulario de viaje */
export default function TripPreferencesFields({ value, onChange }: { value: TripPreferencesData; onChange: (v: TripPreferencesData) => void }) {
  const { t } = useTranslation();
  const set = <K extends keyof TripPreferencesData>(key: K, v: TripPreferencesData[K]) => onChange({ ...value, [key]: v });
  const toggles: { key: BoolKey; label: string; help?: string }[] = [
    { key: "pets_allowed", label: t("prefs.form.pets", "Pets are welcome") },
    { key: "smoking_allowed", label: t("prefs.form.smoking", "Smoking allowed") },
    { key: "music_allowed", label: t("prefs.form.music", "Music during the ride") },
    { key: "max_two_back", label: t("prefs.form.maxTwoBack", "Max. 2 in the back seat"), help: t("prefs.form.maxTwoBackHelp", "More comfort for passengers") },
  ];

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-2">
        <Toggle
          checked={value.instant_booking}
          onChange={(v) => set("instant_booking", v)}
          label={`⚡ ${t("prefs.form.instant", "Instant booking")}`}
          help={t("prefs.form.instantHelp", "Passengers are confirmed automatically. Turn off to approve each request yourself.")}
        />
        {toggles.map((item) => (
          <Toggle key={item.key} checked={value[item.key]} onChange={(v) => set(item.key, v)} label={item.label} help={item.help} />
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="form-label">{t("prefs.form.chattiness", "Conversation")}</label>
          <select value={value.chattiness} onChange={(e) => set("chattiness", e.target.value as Chattiness)} className="form-select">
            <option value="quiet">{t("prefs.chattiness.quiet", "Quiet ride")}</option>
            <option value="normal">{t("prefs.chattiness.normal", "A bit of chat")}</option>
            <option value="chatty">{t("prefs.chattiness.chatty", "Loves to chat")}</option>
          </select>
        </div>
        <div>
          <label className="form-label">{t("prefs.form.luggage", "Luggage per passenger")}</label>
          <select value={value.luggage_size} onChange={(e) => set("luggage_size", e.target.value as LuggageSize)} className="form-select">
            <option value="small">{t("prefs.luggage.small", "Small bag")}</option>
            <option value="medium">{t("prefs.luggage.medium", "Medium suitcase")}</option>
            <option value="large">{t("prefs.luggage.large", "Large suitcase")}</option>
          </select>
        </div>
      </div>
    </div>
  );
}
