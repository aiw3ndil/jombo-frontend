const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";

/** Foto de perfil con inicial de respaldo */
export default function Avatar({ name, url, size = 48 }: { name: string; url?: string | null; size?: number }) {
  const src = url ? (url.startsWith("http") ? url : `${API_BASE}${url}`) : null;
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-[#c4d8b4] bg-[#ebf3e2] font-black text-[var(--brand-neutral)]"
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {src ? <img src={src} alt="" className="h-full w-full object-cover" /> : (name || "?").charAt(0).toUpperCase()}
    </span>
  );
}
