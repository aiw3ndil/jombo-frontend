"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useTranslation } from "@/app/hooks/useTranslation";
import { useAuth } from "@/app/contexts/AuthContext";
import { getPublicProfile } from "@/app/lib/api/users";
import { blockUser, unblockUser } from "@/app/lib/api/safety";
import ReportUserModal from "@/app/components/ReportUserModal";

/** Reportar y bloquear a un usuario desde su perfil (solo con sesión y si no es uno mismo) */
export default function UserSafetyActions({ userId, userName }: { userId: number; userName: string }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [blocked, setBlocked] = useState<boolean | null>(null);
  const [reporting, setReporting] = useState(false);
  const [busy, setBusy] = useState(false);
  const canAct = !!user && user.id !== userId;

  // El perfil se renderiza en el servidor sin sesión: el estado de bloqueo se pide desde el navegador
  useEffect(() => {
    if (!canAct) return;
    getPublicProfile(userId)
      .then((p) => setBlocked(!!p?.blocked))
      .catch(() => setBlocked(false));
  }, [canAct, userId]);

  if (!canAct) return null;

  const toggleBlock = async () => {
    if (!blocked && !confirm(t("block.confirm", "Block {{name}}? You won't be able to book each other's rides or send messages.").replace("{{name}}", userName))) return;
    setBusy(true);
    try {
      const res = blocked ? await unblockUser(userId) : await blockUser(userId);
      setBlocked(res.blocked);
      toast.success(res.blocked ? t("block.done", "Member blocked") : t("block.undone", "Member unblocked"));
    } catch (e: any) {
      toast.error(e?.message || t("verify.error", "Something went wrong"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-wrap justify-center gap-2 md:justify-end">
      <button type="button" onClick={() => setReporting(true)} className="rounded-full border-2 border-[#e2c9c9] bg-white px-3 py-1 text-sm font-semibold text-[#9a5a5a] hover:bg-red-50">
        ⚑ {t("report.button", "Report")}
      </button>
      <button
        type="button"
        onClick={toggleBlock}
        disabled={busy || blocked === null}
        className="rounded-full border-2 border-[#e2c9c9] bg-white px-3 py-1 text-sm font-semibold text-[#9a5a5a] hover:bg-red-50"
      >
        🚫 {blocked ? t("block.unblock", "Unblock") : t("block.block", "Block")}
      </button>
      {reporting && <ReportUserModal users={[{ id: userId, name: userName }]} onClose={() => setReporting(false)} />}
    </div>
  );
}
