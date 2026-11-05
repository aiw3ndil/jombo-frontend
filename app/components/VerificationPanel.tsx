"use client";
import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { useTranslation } from "@/app/hooks/useTranslation";
import { useAuth } from "@/app/contexts/AuthContext";
import { sendEmailVerification, type Verifications } from "@/app/lib/api/users";
import { langPrefix } from "@/app/lib/i18n/config";
import VerifiedBadges from "@/app/components/VerifiedBadges";

/** Estado de verificación del usuario con la acción para verificar el email */
export default function VerificationPanel() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const lang = (useParams()?.lang as string) || "fi";
  const [busy, setBusy] = useState(false);

  if (!user) return null;
  const v: Verifications = user.verifications || { email: false, google: false };

  const sendLink = async () => {
    setBusy(true);
    try {
      await sendEmailVerification();
      toast.success(t("verify.emailSent", "Check your inbox for the confirmation link."));
    } catch (e: any) {
      toast.error(e?.message || t("verify.error", "Something went wrong"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="form-card">
      <div className="mb-6 flex flex-col gap-3 border-b-2 border-green-50 pb-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="mb-1 text-2xl font-bold text-[var(--brand-dark)]">{t("verify.title", "Trust and verification")}</h2>
          <p className="text-[var(--brand-neutral)]">{t("verify.subtitle", "Verified members get more bookings. Your email is never shown publicly.")}</p>
        </div>
        <Link href={`${langPrefix(lang)}/users/${user.id}`} className="btn-secondary shrink-0 px-4 py-2 text-sm">
          {t("profile.viewPublic", "View my public profile")}
        </Link>
      </div>

      <VerifiedBadges verifications={v} showMissing />

      <div className="mt-6 rounded-xl border-2 border-[#c4d8b4] p-4">
        <p className="font-bold text-[var(--brand-dark)]">📧 {t("verify.email", "Email")}</p>
        {v.email ? (
          <p className="text-sm text-[var(--brand-neutral)]">{t("verify.emailDone", "Your email is verified.")}</p>
        ) : (
          <>
            <p className="mb-3 text-sm text-[var(--brand-neutral)]">{t("verify.emailHelp", "We'll send you a link to confirm your address.")}</p>
            <button type="button" className="btn-primary px-4 py-2 text-sm" disabled={busy} onClick={sendLink}>
              {t("verify.sendLink", "Send link")}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
