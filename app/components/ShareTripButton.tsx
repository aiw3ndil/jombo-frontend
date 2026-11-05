"use client";
import { toast } from "sonner";
import { useTranslation } from "@/app/hooks/useTranslation";

/** Comparte los datos del viaje con un contacto de confianza (hoja de compartir o portapapeles) */
export default function ShareTripButton({ text, url, className = "" }: { text: string; url: string; className?: string }) {
  const { t } = useTranslation();

  const share = async () => {
    const title = t("share.title", "My Jombo ride");
    try {
      if (navigator.share) {
        await navigator.share({ title, text, url });
        return;
      }
      await navigator.clipboard.writeText(`${text}\n${url}`);
      toast.success(t("share.copied", "Trip details copied — paste them to a friend or family member."));
    } catch (e: any) {
      if (e?.name !== "AbortError") toast.error(t("share.error", "Could not share the trip"));
    }
  };

  return (
    <button type="button" onClick={share} className={`rounded-full border-2 border-[#c4d8b4] bg-white px-3 py-1 text-sm font-semibold text-[var(--brand-dark)] hover:bg-[#f3f7ed] ${className}`}>
      📤 {t("share.button", "Share trip with a contact")}
    </button>
  );
}
