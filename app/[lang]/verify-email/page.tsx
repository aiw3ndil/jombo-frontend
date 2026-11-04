"use client";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useTranslation } from "@/app/hooks/useTranslation";
import { useAuth } from "@/app/contexts/AuthContext";
import { confirmEmail } from "@/app/lib/api/users";
import { langPrefix, localePath } from "@/app/lib/i18n/config";

function VerifyEmail() {
  const { t } = useTranslation();
  const { user, updateUser } = useAuth();
  const lang = (useParams()?.lang as string) || "fi";
  const token = useSearchParams().get("token") || "";
  const [state, setState] = useState<"loading" | "ok" | "error">("loading");

  useEffect(() => {
    if (!token) {
      setState("error");
      return;
    }
    confirmEmail(token)
      .then((res) => {
        setState("ok");
        if (user) updateUser({ ...user, verifications: res.verifications });
      })
      .catch(() => setState("error"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-[var(--page-bg)] px-4 py-12">
      <div className="form-card max-w-md text-center">
        {state === "loading" && <div className="spinner mx-auto" />}
        {state === "ok" && (
          <>
            <p className="mb-2 text-4xl">✅</p>
            <h1 className="mb-2 text-2xl font-bold text-[var(--brand-dark)]">{t("verify.emailConfirmedTitle", "Email confirmed")}</h1>
            <p className="mb-6 text-[var(--brand-neutral)]">{t("verify.emailConfirmedText", "Thanks! Your profile now shows a verified email badge.")}</p>
            <Link href={localePath(lang, "/")} className="btn-primary px-6 py-3">{t("verify.findRide", "Find a ride")}</Link>
          </>
        )}
        {state === "error" && (
          <>
            <p className="mb-2 text-4xl">⚠️</p>
            <h1 className="mb-2 text-2xl font-bold text-[var(--brand-dark)]">{t("verify.linkInvalidTitle", "This link is not valid")}</h1>
            <p className="mb-6 text-[var(--brand-neutral)]">{t("verify.linkInvalidText", "The link may have been used already. You can request a new one from your profile.")}</p>
            <Link href={`${langPrefix(lang)}/profile`} className="btn-primary px-6 py-3">{t("verify.goProfile", "Go to my profile")}</Link>
          </>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="spinner mx-auto my-24" />}>
      <VerifyEmail />
    </Suspense>
  );
}
