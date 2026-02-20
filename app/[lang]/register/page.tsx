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
      await register(name, email, password, passwordConfirmation, lang, region);
      window.location.href = `/${lang}`;
    } catch (err) { }
  };

  const handleOAuthError = (errorMsg: string) => {
    setOauthError(errorMsg);
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4 sm:px-0 relative">
      <div className="absolute top-0 left-0 -translate-y-1/2 -translate-x-1/4 w-[300px] h-[300px] bg-brand-purple/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-8 md:p-10 shadow-2xl relative overflow-hidden text-center">
        <div className="absolute inset-0 bg-hacker-dots opacity-5 pointer-events-none"></div>

        <div className="relative mb-10">
          <h2 className="text-4xl font-black text-white tracking-tightest uppercase italic mb-2">
            {t("title") || "Registro"}
          </h2>
          <p className="text-brand-gray/80 font-bold uppercase tracking-[0.2em] text-xs">
            Únete a la nueva era del transporte compartido
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
            <span className="flex-shrink mx-4 text-brand-gray/60 font-black uppercase tracking-widest text-xs">{t("or")}</span>
            <div className="flex-grow border-t border-white/5"></div>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2 text-left">
              <label className="block text-xs font-black text-brand-gray/90 uppercase tracking-[0.2em] ml-4">{t("name")}</label>
              <div className="relative group/input">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-gray group-focus-within/input:text-brand-cyan transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-black/20 border border-white/5 rounded-2xl pl-14 pr-6 py-3.5 text-white placeholder:text-brand-gray/50 focus:border-brand-cyan/50 focus:ring-0 transition-all outline-none font-bold italic"
                  placeholder="Tu nombre completo"
                  required
                />
              </div>
            </div>

            <div className="space-y-2 text-left">
              <label className="block text-xs font-black text-brand-gray/90 uppercase tracking-[0.2em] ml-4">{t("email")}</label>
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
                  className="w-full bg-black/20 border border-white/5 rounded-2xl pl-14 pr-6 py-3.5 text-white placeholder:text-brand-gray/50 focus:border-brand-cyan/50 focus:ring-0 transition-all outline-none font-bold italic"
                  placeholder="name@example.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2 text-left">
              <label className="block text-xs font-black text-brand-gray/90 uppercase tracking-[0.2em] ml-4">{t("region")}</label>
              <div className="relative group/input">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-gray group-focus-within/input:text-brand-cyan transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full bg-black/20 border border-white/5 rounded-2xl pl-14 pr-6 py-3.5 text-white placeholder:text-brand-gray/50 focus:border-brand-cyan/50 focus:ring-0 transition-all outline-none font-bold italic appearance-none cursor-pointer"
                  required
                >
                  <option value="es" className="bg-zinc-900 text-white font-bold">{t("regionSpain")}</option>
                  <option value="fi" className="bg-zinc-900 text-white font-bold">{t("regionFinland")}</option>
                </select>
                <div className="absolute right-6 top-1/2 -translate-y-1/2 text-brand-gray pointer-events-none">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="space-y-2 text-left">
              <label className="block text-xs font-black text-brand-gray/90 uppercase tracking-[0.2em] ml-4">{t("password")}</label>
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
                  className="w-full bg-black/20 border border-white/5 rounded-2xl pl-14 pr-6 py-3.5 text-white placeholder:text-brand-gray/50 focus:border-brand-purple/50 focus:ring-0 transition-all outline-none font-bold italic"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div className="space-y-2 text-left">
              <label className="block text-xs font-black text-brand-gray/90 uppercase tracking-[0.2em] ml-4">{t("passwordConfirmation")}</label>
              <div className="relative group/input">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-gray group-focus-within/input:text-brand-purple transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <input
                  type="password"
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  className="w-full bg-black/20 border border-white/5 rounded-2xl pl-14 pr-6 py-3.5 text-white placeholder:text-brand-gray/50 focus:border-brand-purple/50 focus:ring-0 transition-all outline-none font-bold italic"
                  placeholder="Confirmar contraseña"
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
              ) : t("submit") || "Registrarse"}
            </button>
          </form>

          <p className="mt-8 text-brand-gray/80 font-bold text-xs uppercase tracking-[0.15em]">
            {t("haveAccount")} <Link href={`/${lang}/login`} className="text-brand-cyan hover:text-white font-black transition-colors underline decoration-brand-cyan/30 underline-offset-4">{t("loginLink")}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
