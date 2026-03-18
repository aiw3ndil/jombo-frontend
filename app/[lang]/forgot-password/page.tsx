"use client";
import { useTranslation } from "@/app/hooks/useTranslation";
import { useState, FormEvent } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { forgotPassword } from "@/app/lib/api/auth";

export default function ForgotPassword() {
  const { t, loading: translationsLoading } = useTranslation("login");
  const params = useParams();
  const lang = (params?.lang as string) || "es";

  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (translationsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="spinner"></div>
      </div>
    );
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await forgotPassword(email);
      setSuccess(true);
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
            {t("securityBadge") || "Seguridad de tu cuenta"}
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-green-900 leading-tight mb-4">
            {t("forgotPasswordTitle") || "¿Necesitas una nueva clave?"}
          </h1>
          <p className="text-xl text-green-700 max-w-2xl mx-auto font-medium opacity-80">
            {t("forgotPasswordDescription") || "No te preocupes, nos pasa a todos. Introduce tu email y te ayudaremos a recuperarla."}
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
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg transform rotate-6 hover:rotate-0 transition-transform">
                    <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="space-y-2">
                    <p className="text-green-900 font-black text-2xl">{t("instructionsSent") || "¡Correo enviado!"}</p>
                    <p className="text-green-700 font-medium">Revisa tu bandeja de entrada para seguir los pasos.</p>
                  </div>
                </div>
                <Link
                  href={`/${lang}/login`}
                  className="btn-secondary w-full py-6 text-lg"
                >
                  {t("backToLogin") || "Volver al inicio"}
                </Link>
              </div>
            ) : (
              <form className="space-y-8" onSubmit={handleSubmit}>
                <div className="space-y-6">
                  <div>
                    <label className="form-label">{t("email") || "Tu correo electrónico"}</label>
                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-green-400 group-focus-within:text-green-600 transition-colors z-10">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.206" />
                        </svg>
                      </div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="form-input pl-12"
                        placeholder="ejemplo@jombo.es"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2 space-y-6 text-center">
                  <button
                    type="submit"
                    className="btn-primary w-full py-6 shadow-2xl relative overflow-hidden group"
                    disabled={isLoading}
                  >
                    <span className={`flex items-center justify-center gap-3 transition-all duration-300 ${isLoading ? 'opacity-0 scale-90' : 'opacity-100 scale-100'}`}>
                      {t("sendInstructions") || "Recuperar mi cuenta"}
                      <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </span>
                    {isLoading && (
                      <span className="absolute inset-0 flex items-center justify-center">
                        <div className="w-6 h-6 border-3 border-white/20 border-t-white rounded-full animate-spin"></div>
                      </span>
                    )}
                  </button>

                  <Link
                    href={`/${lang}/login`}
                    className="inline-block text-green-600 hover:text-green-800 font-black text-sm uppercase tracking-widest underline decoration-2 underline-offset-8 decoration-green-200 hover:decoration-green-600 transition-all"
                  >
                    {t("backToLogin") || "O inicia sesión"}
                  </Link>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
