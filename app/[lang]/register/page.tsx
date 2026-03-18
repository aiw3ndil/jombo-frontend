"use client";
import { useTranslation } from "@/app/hooks/useTranslation";
import useAuth from "@/app/hooks/useAuth";
import { useState, FormEvent } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import GoogleLoginButton from "@/app/components/GoogleLoginButton";

export default function Register() {
  const { t, loading: translationsLoading } = useTranslation("register");
  const params = useParams();
  const searchParams = useSearchParams();
  const lang = (params?.lang as string) || "es";
  const redirect = searchParams.get("redirect");
  const { register, loading: isLoading, error } = useAuth() as any;
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [region, setRegion] = useState(lang === "fi" ? "fi" : "es");
  const [oauthError, setOauthError] = useState<string | null>(null);

  if (translationsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="spinner"></div>
      </div>
    );
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await register(name, email, password, passwordConfirmation, lang, region);
      window.location.href = `/${lang}`;
    } catch (err) {}
  };

  const handleOAuthError = (errorMsg: string) => {
    setOauthError(errorMsg);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* ── HERO ── */}
      <section className="bg-green-50 border-b-2 border-green-100 py-20 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-green-100 border border-green-300 text-green-800 px-5 py-2 rounded-full text-sm font-bold mb-6 uppercase tracking-wide">
            {t("joinBadge") || "Únete a la revolución"}
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-green-900 leading-tight mb-4">
            {t("title") || "Tu viaje empieza aquí"}
          </h1>
          <p className="text-xl text-green-700 max-w-2xl mx-auto font-medium opacity-80">
            {t("subtitle") || "Regístrate en Jombo y empieza a ahorrar compartiendo trayectos con personas de confianza."}
          </p>
        </div>
      </section>

      {/* ── FORMULARIO ── */}
      <section className="py-20 px-4 bg-white relative -mt-10">
        <div className="max-w-md mx-auto">
          <div className="form-card relative z-10">
            <div className="space-y-10">
              {/* Google Register */}
              <div className="space-y-4">
                <GoogleLoginButton redirect={redirect} onError={handleOAuthError} />
                <p className="text-center text-xs font-bold text-green-400 uppercase tracking-widest flex items-center gap-4">
                  <span className="flex-1 h-px bg-green-100"></span>
                  {t("or") || "O crea tu cuenta con email"}
                  <span className="flex-1 h-px bg-green-100"></span>
                </p>
              </div>

              {/* Errores */}
              {(error || oauthError) && (
                <div className="form-error animate-in shake-in duration-300">
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  {String(error || oauthError)}
                </div>
              )}

              {/* Formulario */}
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="space-y-5">
                  <div>
                    <label className="form-label">{t("name") || "Nombre completo"}</label>
                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-green-400 group-focus-within:text-green-600 transition-colors z-10">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="form-input pl-12"
                        placeholder="Juan Pérez"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="form-label">{t("email") || "Correo electrónico"}</label>
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
                        placeholder="tu@email.com"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="form-label">{t("region") || "Región"}</label>
                    <div className="relative">
                      <select
                        value={region}
                        onChange={(e) => setRegion(e.target.value)}
                        className="form-select pr-12 font-bold"
                        required
                      >
                        <option value="es">🇪🇸 {t("regionSpain") || "España"}</option>
                        <option value="fi">🇫🇮 {t("regionFinland") || "Finlandia"}</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500 pointer-events-none">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-5">
                    <div>
                      <label className="form-label">{t("password") || "Contraseña"}</label>
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
                        />
                      </div>
                    </div>

                    <div>
                      <label className="form-label">{t("passwordConfirmation") || "Confirma tu contraseña"}</label>
                      <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-green-400 group-focus-within:text-green-600 transition-colors z-10">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                        </div>
                        <input
                          type="password"
                          value={passwordConfirmation}
                          onChange={(e) => setPasswordConfirmation(e.target.value)}
                          className="form-input pl-12"
                          placeholder="••••••••"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    className="btn-primary w-full py-6 shadow-2xl relative overflow-hidden group"
                    disabled={isLoading}
                  >
                    <span className={`flex items-center justify-center gap-3 transition-all duration-300 ${isLoading ? 'opacity-0 scale-90' : 'opacity-100 scale-100'}`}>
                      {t("submit") || "Crear mi cuenta"}
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
                </div>
              </form>

              <div className="pt-6 border-t border-green-50 text-center">
                <p className="text-green-700 font-medium">
                  {t("haveAccount") || "¿Ya usas Jombo?"}{" "}
                  <Link href={`/${lang}/login`} className="text-green-600 hover:text-green-800 font-black underline decoration-2 underline-offset-4 transition-all">
                    {t("loginLink") || "Inicia sesión aquí"}
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
