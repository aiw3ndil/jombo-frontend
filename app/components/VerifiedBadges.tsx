"use client";
import { useTranslation } from "@/app/hooks/useTranslation";
import type { ExperienceLevel, Verifications } from "@/app/lib/api/users";

const LEVEL_ICONS: Record<string, string> = { new: "🌱", regular: "🚗", experienced: "🌲", expert: "🏆" };
const LEVEL_FALLBACK: Record<string, string> = {
  new: "New member",
  regular: "Regular member",
  experienced: "Experienced member",
  expert: "Expert member",
};

/** Nivel de experiencia (viajes como conductor + como pasajero) */
export function ExperienceBadge({ level }: { level?: ExperienceLevel | string }) {
  const { t } = useTranslation();
  if (!level) return null;
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-[#c4d8b4] bg-[#ebf3e2] px-2.5 py-0.5 text-xs font-bold text-[var(--brand-dark)]">
      {LEVEL_ICONS[level] || "🚗"} {t(`profile.level.${level}`, LEVEL_FALLBACK[level] || level)}
    </span>
  );
}

/**
 * Insignias de verificación (email, teléfono, Google).
 * `compact`: una sola insignia para tarjetas pequeñas ("Verified", o los iconos de lo verificado).
 */
export default function VerifiedBadges({
  verifications,
  showMissing = false,
  compact = false,
}: {
  verifications?: Verifications;
  showMissing?: boolean;
  compact?: boolean;
}) {
  const { t } = useTranslation();
  if (!verifications) return null;
  const items = [
    { key: "email", icon: "✉️", ok: verifications.email, label: t("profile.verified.email", "Email verified") },
    { key: "phone", icon: "📱", ok: verifications.phone, label: t("profile.verified.phone", "Phone verified") },
    { key: "google", icon: "G", ok: verifications.google, label: t("profile.verified.google", "Google account") },
  ].filter((i) => i.ok || (showMissing && i.key !== "google"));
  if (items.length === 0) return null;

  if (compact) {
    const label = items.map((i) => i.label).join(" · ");
    return (
      <span
        title={label}
        aria-label={label}
        className="inline-flex items-center gap-1 rounded-full border border-[#9cc58a] bg-[#e4f1da] px-2 py-0.5 text-xs font-semibold text-[var(--brand-dark)]"
      >
        {verifications.verified ? `✓ ${t("profile.verified.member", "Verified")}` : items.map((i) => i.icon).join(" ")}
      </span>
    );
  }

  return (
    <ul className="flex flex-wrap gap-1.5">
      {items.map((i) => (
        <li
          key={i.key}
          className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
            i.ok ? "border-[#9cc58a] bg-[#e4f1da] text-[var(--brand-dark)]" : "border-[#e2c9c9] bg-white text-[#9a5a5a]"
          }`}
        >
          {i.ok ? "✓" : "○"} {i.ok ? i.label : t(`profile.unverified.${i.key}`, `${i.key} not verified`)}
        </li>
      ))}
    </ul>
  );
}
