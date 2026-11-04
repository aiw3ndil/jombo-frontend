"use client";
import { useTranslation } from "@/app/hooks/useTranslation";
import { localePath, langPrefix } from "@/app/lib/i18n/config";
import useAuth from "@/app/hooks/useAuth";
import { useState, FormEvent } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import GoogleLoginButton from "@/app/components/GoogleLoginButton";

export default function Login() {
  const { t, loading: translationsLoading } = useTranslation("login");
  const params = useParams();
  const searchParams = useSearchParams();
  const lang = (params?.lang as string) || "fi";
  const redirect = searchParams.get("redirect");
  const { login, loading: isLoading, error } = useAuth() as any;
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
      await login(email, password);
      const destination = redirect || localePath(lang);
      window.location.href = destination;
    } catch (err) {
      console.error("Login error:", err);
    }
  };

  const handleOAuthError = (errorMsg: string) => {
    setOauthError(errorMsg);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* ── HERO ── */}
      <section className="bg-[#f2f7ec] border-b-2 border-[#dde9d3] py-8 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-[#dde9d3] border border-[#dde9d3] text-[var(--brand-dark)] px-4 py-1.5 rounded-full text-xs font-bold mb-3 uppercase tracking-wide">
            {t("loginBadge") || "Welcome back"}
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-[var(--brand-dark)] leading-tight mb-2">
            {t("loginTitle") || "Log in"}
          </h1>
          <p className="text-sm md:text-base text-[var(--brand-neutral)] max-w-2xl mx-auto font-medium opacity-80">
            {t("loginSubtitle") || "Access your account and keep saving with Jombo."}
          </p>
        </div>
      </section>

      {/* ── FORMULARIO ── */}
      <section className="py-20 px-4 bg-white relative -mt-5">
        <div className="max-w-xl mx-auto">
          <div className="form-card relative z-10">
            <div className="space-y-10">
              {/* Google Login */}
              <div className="space-y-4">
                <GoogleLoginButton redirect={redirect} onError={handleOAuthError} />
                <p className="text-center text-xs font-bold text-[var(--brand-neutral)] uppercase tracking-widest flex items-center gap-4">
                  <span className="flex-1 h-px bg-[#dde9d3]"></span>
                  {t("or") || "or"}
                  <span className="flex-1 h-px bg-[#dde9d3]"></span>
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
              <form className="space-y-8" onSubmit={handleSubmit}>
                <div className="space-y-6">
                  <div>
                    <label className="form-label">{t("email") || "Email"}</label>
                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--brand-neutral)] group-focus-within:text-[var(--brand-blue)] transition-colors z-10">
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
                    <div className="flex justify-between items-center mb-1">
                      <label className="form-label mb-0">{t("password") || "Password"}</label>
                      <Link
                        href={`${langPrefix(lang)}/forgot-password`}
                        className="text-[var(--brand-blue)] hover:text-[var(--brand-dark)] font-bold text-xs uppercase tracking-widest transition-colors"
                      >
                        {t("forgotPassword") || "Forgot your password?"}
                      </Link>
                    </div>
                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--brand-neutral)] group-focus-within:text-[var(--brand-blue)] transition-colors z-10">
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
                </div>

                <button
                  type="submit"
                  className="btn-primary w-full py-6 shadow-2xl relative overflow-hidden group"
                  disabled={isLoading}
                >
                  <span className={`flex items-center justify-center gap-3 transition-all duration-300 ${isLoading ? 'opacity-0 scale-90' : 'opacity-100 scale-100'}`}>
                    {t("submit") || "Create Account"}
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
              </form>

              <div className="pt-6 border-t border-green-50 text-center">
                <p className="text-[var(--brand-neutral)] font-medium">
                  {t("noAccount") || "Don't have an account?"}{" "}
                  <Link href={`${langPrefix(lang)}/register`} className="text-[var(--brand-blue)] hover:text-[var(--brand-dark)] font-black underline decoration-2 underline-offset-4 transition-all">
                    {t("registerLink") || "Register here"}
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
