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
    setIsLoading(true);
    setError(null);
    try {
      await forgotPassword(email);
      setSuccess(true);
    } catch (err: any) {
      console.error('🔵 Forgot password error:', err);
      setError(err.message || t("errorGeneric"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4 sm:px-0 relative">
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[300px] h-[300px] bg-brand-cyan/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-8 md:p-10 shadow-2xl relative overflow-hidden text-center">
        <div className="absolute inset-0 bg-hacker-dots opacity-5 pointer-events-none"></div>

        <div className="relative mb-10">
          <h2 className="text-4xl font-black text-white tracking-tightest uppercase italic mb-2">
            {t("forgotPasswordTitle")}
          </h2>
          <p className="text-brand-gray/80 font-bold uppercase tracking-[0.2em] text-xs px-4">
            {t("forgotPasswordDescription")}
          </p>
        </div>

        {error && (
          <div className="relative bg-brand-pink/10 border border-brand-pink/20 text-brand-pink px-4 py-3 rounded-2xl text-xs font-bold mb-6 flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}

        {success ? (
          <div className="relative space-y-8">
            <div className="bg-brand-cyan/10 border border-brand-cyan/20 text-brand-cyan px-6 py-8 rounded-3xl text-sm font-bold flex flex-col items-center gap-4">
              <div className="w-12 h-12 bg-brand-cyan/20 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              {t("instructionsSent")}
            </div>
            <Link 
              href={`/${lang}/login`}
              className="block w-full bg-white/5 border border-white/10 text-white py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs transition-all hover:bg-white/10"
            >
              {t("backToLogin")}
            </Link>
          </div>
        ) : (
          <form className="relative space-y-6" onSubmit={handleSubmit}>
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
                  className="w-full bg-black/20 border border-white/5 rounded-2xl pl-14 pr-6 py-4 text-white placeholder:text-brand-gray/50 focus:border-brand-cyan/50 focus:ring-0 transition-all outline-none font-bold italic"
                  placeholder="name@example.com"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-brand-gradient text-white py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs transition-all hover:scale-[1.03] active:scale-95 shadow-2xl shadow-brand-cyan/20 disabled:opacity-50 mt-4"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {t("loading")}
                </span>
              ) : t("sendInstructions")}
            </button>

            <Link 
              href={`/${lang}/login`}
              className="block text-xs font-bold text-brand-gray/60 hover:text-white transition-colors uppercase tracking-widest mt-4"
            >
              {t("backToLogin")}
            </Link>
          </form>
        )}
      </div>
    </div>
  );
}
