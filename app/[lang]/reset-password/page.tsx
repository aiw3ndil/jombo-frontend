"use client";
import { useTranslation } from "@/app/hooks/useTranslation";
import { useState, FormEvent, useEffect } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { resetPassword } from "@/app/lib/api/auth";

export default function ResetPassword() {
  const { t, loading: translationsLoading } = useTranslation("login");
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const lang = (params?.lang as string) || "es";
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token && !translationsLoading) {
      setError("Token de recuperación inválido o expirado.");
    }
  }, [token, translationsLoading]);

  if (translationsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="spinner"></div>
      </div>
    );
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    if (!token) {
      setError("Token de recuperación no encontrado.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await resetPassword(token, password);
      setSuccess(true);
      setTimeout(() => { router.push(`/${lang}/login`); }, 3000);
    } catch (err: any) {
      setError(err.message || t("errorGeneric") || "Ha ocurrido un error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* ── HERO ── */}
      <section className="bg-green-50 border-b-2 border-green-100 py-20 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-green-100 border border-green-300 text-green-800 px-5 py-2 rounded-full text-sm font-bold mb-6 uppercase tracking-wide">
            {t("securityBadge") || "Actualización de seguridad"}
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-green-900 leading-tight mb-4">
            {t("resetPasswordTitle") || "Establece tu nueva clave"}
          </h1>
          <p className="text-xl text-green-700 max-w-2xl mx-auto font-medium opacity-80">
            {t("resetPasswordDescription") || "Elige una contraseña que no hayas usado antes y sea difícil de adivinar."}
          </p>
        </div>
      </section>

      {/* ── FORMULARIO ── */}
      <section className="py-20 px-4 bg-white relative -mt-10">
        <div className="max-w-md mx-auto">
          <div className="form-card relative z-10">
            {error && (
              <div className="form-error mb-8 animate-in shake-in duration-300">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                {error}
              </div>
            )}

            {success ? (
              <div className="space-y-10 text-center animate-in fade-in zoom-in duration-500">
                <div className="bg-green-50 border-2 border-green-100 rounded-[2.5rem] p-10 flex flex-col items-center gap-6 shadow-inner">
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg animate-bounce">
                    <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="space-y-2">
                    <p className="text-green-900 font-black text-2xl">{t("passwordResetSuccess") || "¡Clave actualizada!"}</p>
                    <p className="text-green-700 font-medium">Te estamos redirigiendo para que entres a tu cuenta...</p>
                  </div>
                </div>
              </div>
            ) : (
              <form className="space-y-8" onSubmit={handleSubmit}>
                <div className="space-y-6">
                  <div>
                    <label className="form-label">{t("newPassword") || "Nueva contraseña"}</label>
                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-green-400 group-focus-within:text-green-600 transition-colors z-10">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="form-input pl-12"
                        placeholder="••••••••"
                        required
                        minLength={6}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="form-label">{t("confirmPassword") || "Repite la nueva contraseña"}</label>
                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-green-400 group-focus-within:text-green-600 transition-colors z-10">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </div>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="form-input pl-12"
                        placeholder="••••••••"
                        required
                        minLength={6}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="btn-primary w-full py-6 shadow-2xl relative overflow-hidden group"
                    disabled={isLoading || !token}
                  >
                    <span className={`flex items-center justify-center gap-3 transition-all duration-300 ${isLoading ? 'opacity-0 scale-90' : 'opacity-100 scale-100'}`}>
                      {t("resetPasswordSubmit") || "Cambiar contraseña"}
                      <svg className="w-5 h-5 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </span>
                    {isLoading && (
                      <span className="absolute inset-0 flex items-center justify-center">
                        <div className="w-6 h-6 border-3 border-white/20 border-t-white rounded-full animate-spin"></div>
                      </span>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
