"use client";
import { useTranslation } from "@/app/hooks/useTranslation";
import useAuth from "@/app/hooks/useAuth";
import { useState, FormEvent } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import GoogleLoginButton from "@/app/components/GoogleLoginButton";

export default function Login() {
  const { t, loading: translationsLoading } = useTranslation("login");
  const params = useParams();
  const searchParams = useSearchParams();
  const lang = (params?.lang as string) || "es";
  const redirect = searchParams.get("redirect");
  const { login, loading: isLoading, error } = useAuth() as any;
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [oauthError, setOauthError] = useState<string | null>(null);

  // Wait for translations to load
  if (translationsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 rounded-full border-4 border-white/5 border-t-brand-cyan animate-spin"></div>
          <div className="absolute inset-2 rounded-full border-4 border-white/5 border-t-brand-purple animate-spin" style={{ animationDuration: '1.5s' }}></div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await login(email, password);
      const destination = redirect || `/${lang}`;
      window.location.href = destination;
    } catch (err) {
      console.error('🔵 Login page: Login error:', err);
    }
  };

  const handleOAuthError = (errorMsg: string) => {
    setOauthError(errorMsg);
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4 sm:px-0 relative">
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[300px] h-[300px] bg-brand-cyan/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-8 md:p-10 shadow-2xl relative overflow-hidden text-center">
        <div className="absolute inset-0 bg-hacker-dots opacity-5 pointer-events-none"></div>

        <div className="relative mb-10">
          <h2 className="text-4xl font-black text-white tracking-tightest uppercase italic mb-2">
            {t("title") || "Login"}
          </h2>
          <p className="text-brand-gray font-medium uppercase tracking-[0.2em] text-[10px]">
            Ingresa a la red de carpooling tecnológica
          </p>
        </div>

        {error && (
          <div className="relative bg-brand-pink/10 border border-brand-pink/20 text-brand-pink px-4 py-3 rounded-2xl text-xs font-bold mb-6 flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {String(error)}
          </div>
        )}
        {oauthError && (
          <div className="relative bg-brand-pink/10 border border-brand-pink/20 text-brand-pink px-4 py-3 rounded-2xl text-xs font-bold mb-6 flex items-center justify-center gap-2">
            {oauthError}
          </div>
        )}

        <div className="relative space-y-6">
          <GoogleLoginButton
            redirect={redirect}
            onError={handleOAuthError}
          />

          <div className="relative py-2 flex items-center">
            <div className="flex-grow border-t border-white/5"></div>
            <span className="flex-shrink mx-4 text-brand-gray/40 font-black uppercase tracking-widest text-[10px]">{t("or")}</span>
            <div className="flex-grow border-t border-white/5"></div>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2 text-left">
              <label className="block text-[10px] font-black text-brand-gray uppercase tracking-[0.2em] ml-4">{t("email")}</label>
              <div className="relative group/input">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-gray group-focus-within/input:text-brand-cyan transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black/20 border border-white/5 rounded-2xl pl-14 pr-6 py-4 text-white placeholder:text-brand-gray/30 focus:border-brand-cyan/50 focus:ring-0 transition-all outline-none font-bold italic"
                  placeholder="name@example.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2 text-left">
              <label className="block text-[10px] font-black text-brand-gray uppercase tracking-[0.2em] ml-4">{t("password")}</label>
              <div className="relative group/input">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-gray group-focus-within/input:text-brand-purple transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black/20 border border-white/5 rounded-2xl pl-14 pr-6 py-4 text-white placeholder:text-brand-gray/30 focus:border-brand-purple/50 focus:ring-0 transition-all outline-none font-bold italic"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-brand-gradient text-white py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs transition-all hover:scale-[1.03] active:scale-95 shadow-2xl shadow-brand-cyan/20 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed mt-4"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {t("loading") || "..."}
                </span>
              ) : t("submit") || "Entrar"}
            </button>
          </form>

          <p className="mt-8 text-brand-gray/60 font-medium text-[10px] uppercase tracking-[0.15em]">
            {t("noAccount")} <Link href={`/${lang}/register`} className="text-brand-cyan hover:text-white font-black transition-colors underline decoration-brand-cyan/30 underline-offset-4">{t("registerLink")}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
