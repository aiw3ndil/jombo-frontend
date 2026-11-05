"use client";
import { useState } from "react";
import { toast } from "sonner";
import { useTranslation } from "@/app/hooks/useTranslation";
import { REPORT_REASONS, reportUser, type ReportReason } from "@/app/lib/api/safety";

const REASON_FALLBACK: Record<ReportReason, string> = {
  no_show: "Didn't show up",
  unsafe_driving: "Unsafe driving",
  inappropriate: "Inappropriate behaviour",
  fake_profile: "Fake profile",
  other: "Something else",
};

/** Reportar a un usuario (o elegir a quién, si hay varios) */
export default function ReportUserModal({
  users,
  bookingId,
  onClose,
}: {
  users: { id: number; name: string }[];
  bookingId?: number;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const [userId, setUserId] = useState(users[0]?.id);
  const [reason, setReason] = useState<ReportReason>("no_show");
  const [comment, setComment] = useState("");
  const [sending, setSending] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    setSending(true);
    try {
      await reportUser({ reported_id: userId, reason, comment: comment.trim() || undefined, booking_id: bookingId });
      toast.success(t("report.sent", "Thanks — our team will review your report."));
      onClose();
    } catch (err: any) {
      toast.error(err?.message || t("report.error", "Could not send the report"));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1f3a2a]/50 p-4" role="dialog" aria-modal="true">
      <form onSubmit={submit} className="w-full max-w-md space-y-4 rounded-2xl border-2 border-[#c4d8b4] bg-white p-6 shadow-2xl">
        <div>
          <h3 className="text-xl font-bold text-[var(--brand-dark)]">⚑ {t("report.title", "Report a member")}</h3>
          <p className="text-sm text-[var(--brand-neutral)]">
            {t("report.subtitle", "Reports are confidential: the member won't know who reported them.")}
          </p>
        </div>

        {users.length > 1 && (
          <label className="block">
            <span className="form-label">{t("report.who", "Who do you want to report?")}</span>
            <select className="form-select" value={userId} onChange={(e) => setUserId(Number(e.target.value))}>
              {users.map((u) => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </label>
        )}

        <label className="block">
          <span className="form-label">{t("report.reason", "What happened?")}</span>
          <select className="form-select" value={reason} onChange={(e) => setReason(e.target.value as ReportReason)}>
            {REPORT_REASONS.map((r) => (
              <option key={r} value={r}>{t(`report.reasons.${r}`, REASON_FALLBACK[r])}</option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="form-label">{t("report.comment", "Details (optional)")}</span>
          <textarea className="form-input resize-y" rows={4} maxLength={2000} value={comment} onChange={(e) => setComment(e.target.value)} />
        </label>

        <p className="text-xs text-[var(--brand-neutral)]">
          {t("report.emergency", "In an emergency, call 112.")}
        </p>

        <div className="flex justify-end gap-3">
          <button type="button" onClick={onClose} className="btn-secondary px-5 py-2.5">{t("page.search.cancel", "Cancel")}</button>
          <button type="submit" disabled={sending} className="btn-primary px-5 py-2.5">{t("report.send", "Send report")}</button>
        </div>
      </form>
    </div>
  );
}
