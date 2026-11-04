"use client";
import { useTranslation } from "@/app/hooks/useTranslation";
import type { ExperienceLevel, Verifications } from "@/app/lib/api/users";

export function ExperienceBadge({ level }: { level?: ExperienceLevel | string }) {
  const { t } = useTranslation();
  if (!level) return null;
  const icons: Record<string, string> = { new: "🌱", regular: "🚗", experienced: "🌲", expert: "🏆" };
  const fallback: Record<string, string> = { new: "New member", regular: "Regular driver", experienced: "Experienced driver", expert: "Expert driver" };
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-[#c4d8b4] bg-[#ebf3e2] px-2.5 py-0.5 text-xs font-bold text-[var(--brand-dark)]">
      {icons[level] || "🚗"} {t(`profile.level.${level}`, fallback[level] || level)}
    </span>
  );
}

/** Insignias de verificación (email, teléfono, Google) */
export default function VerifiedBadges({ verifications, showMissing = false }: { verifications?: Verifications; showMissing?: boolean }) {
  const { t } = useTranslation();
  if (!verifications) return null;
  const items = [
    { key: "email", ok: verifications.email, label: t("profile.verified.email", "Email verified") },
    { key: "phone", ok: verifications.phone, label: t("profile.verified.phone", "Phone verified") },
    { key: "google", ok: verifications.google, label: t("profile.verified.google", "Google account") },
  ].filter((i) => i.ok || (showMissing && i.key !== "google"));
  if (items.length === 0) return null;
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
