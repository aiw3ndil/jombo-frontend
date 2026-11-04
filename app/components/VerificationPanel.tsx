"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { useTranslation } from "@/app/hooks/useTranslation";
import { useAuth } from "@/app/contexts/AuthContext";
import { confirmPhoneCode, getAppConfig, sendEmailVerification, sendPhoneCode, type Verifications } from "@/app/lib/api/users";
import { langPrefix } from "@/app/lib/i18n/config";
import VerifiedBadges from "@/app/components/VerifiedBadges";

/** Estado de verificación del usuario con acciones para verificar email y teléfono */
export default function VerificationPanel() {
  const { t } = useTranslation();
  const { user, updateUser } = useAuth();
  const lang = (useParams()?.lang as string) || "fi";
  const [smsEnabled, setSmsEnabled] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    getAppConfig().then((c) => setSmsEnabled(c.sms_enabled)).catch(() => setSmsEnabled(false));
  }, []);

  if (!user) return null;
  const v: Verifications = user.verifications || { email: false, phone: false, google: false };

  const run = async (key: string, fn: () => Promise<void>) => {
    setBusy(key);
    try {
      await fn();
    } catch (e: any) {
      toast.error(e?.message || t("verify.error", "Something went wrong"));
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="form-card">
      <div className="mb-6 flex flex-col gap-3 border-b-2 border-green-50 pb-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="mb-1 text-2xl font-bold text-[var(--brand-dark)]">{t("verify.title", "Trust and verification")}</h2>
          <p className="text-[var(--brand-neutral)]">{t("verify.subtitle", "Verified members get more bookings. Your phone number and email are never shown publicly.")}</p>
        </div>
        <Link href={`${langPrefix(lang)}/users/${user.id}`} className="btn-secondary shrink-0 px-4 py-2 text-sm">
          {t("profile.viewPublic", "View my public profile")}
        </Link>
      </div>

      <VerifiedBadges verifications={v} showMissing />

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border-2 border-[#c4d8b4] p-4">
          <p className="font-bold text-[var(--brand-dark)]">📧 {t("verify.email", "Email")}</p>
          {v.email ? (
            <p className="text-sm text-[var(--brand-neutral)]">{t("verify.emailDone", "Your email is verified.")}</p>
          ) : (
            <>
              <p className="mb-3 text-sm text-[var(--brand-neutral)]">{t("verify.emailHelp", "We'll send you a link to confirm your address.")}</p>
              <button
                type="button"
                className="btn-primary px-4 py-2 text-sm"
                disabled={busy === "email"}
                onClick={() => run("email", async () => {
                  await sendEmailVerification();
                  toast.success(t("verify.emailSent", "Check your inbox for the confirmation link."));
                })}
              >
                {t("verify.sendLink", "Send link")}
              </button>
            </>
          )}
        </div>

        <div className="rounded-xl border-2 border-[#c4d8b4] p-4">
          <p className="font-bold text-[var(--brand-dark)]">📱 {t("verify.phone", "Phone")}</p>
          {v.phone ? (
            <p className="text-sm text-[var(--brand-neutral)]">{t("verify.phoneDone", "Your phone number is verified.")}</p>
          ) : !user.phone ? (
            <p className="text-sm text-[var(--brand-neutral)]">{t("verify.phoneAddFirst", "Add your phone number above and save to verify it.")}</p>
          ) : !smsEnabled ? (
            <p className="text-sm text-[var(--brand-neutral)]">{t("verify.phoneUnavailable", "Phone verification is coming soon.")}</p>
          ) : (
            <>
              <p className="mb-3 text-sm text-[var(--brand-neutral)]">
                {t("verify.phoneHelp", "We'll text a 6-digit code to")} {user.phone}
              </p>
              {codeSent ? (
                <form
                  className="flex gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    run("confirm", async () => {
                      const res = await confirmPhoneCode(code);
                      updateUser({ ...user, verifications: res.verifications });
                      toast.success(t("verify.phoneDone", "Your phone number is verified."));
                    });
                  }}
                >
                  <input
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                    className="form-input w-32 text-center tracking-widest"
                    aria-label={t("verify.code", "Code")}
                  />
                  <button type="submit" className="btn-primary px-4 py-2 text-sm" disabled={code.length !== 6 || busy === "confirm"}>
                    {t("verify.confirm", "Confirm")}
                  </button>
                </form>
              ) : (
                <button
                  type="button"
                  className="btn-primary px-4 py-2 text-sm"
                  disabled={busy === "phone"}
                  onClick={() => run("phone", async () => {
                    await sendPhoneCode();
                    setCodeSent(true);
                    toast.success(t("verify.codeSent", "Code sent by SMS."));
                  })}
                >
                  {t("verify.sendCode", "Send code")}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
