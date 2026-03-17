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
    <div className="min-h-screen bg-green-50 py-16 px-4">
      <div className="max-w-md mx-auto">
        {/* Título */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-green-900 mb-2">
            {t("title") || "Crear cuenta"}
          </h1>
          <p className="text-green-700 text-lg">Únete a la comunidad de viajes compartidos</p>
        </div>

        {/* Card */}
        <div className="form-card">
          {(error || oauthError) && (
            <div className="form-error mb-6">
              {String(error || oauthError)}
            </div>
          )}

          <div className="space-y-6">
            <GoogleLoginButton redirect={redirect} onError={handleOAuthError} />

            <div className="flex items-center gap-4">
              <div className="flex-grow border-t-2 border-green-100"></div>
              <span className="text-green-500 font-semibold text-sm">{t("or") || "o"}</span>
              <div className="flex-grow border-t-2 border-green-100"></div>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label className="form-label">{t("name") || "Nombre completo"}</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="form-input"
                  placeholder="Tu nombre completo"
                  required
                />
              </div>

              <div>
                <label className="form-label">{t("email") || "Email"}</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input"
                  placeholder="nombre@ejemplo.com"
                  required
                />
              </div>

              <div>
                <label className="form-label">{t("region") || "Región"}</label>
                <div className="relative">
                  <select
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="form-select"
                    required
                  >
                    <option value="es">{t("regionSpain") || "España"}</option>
                    <option value="fi">{t("regionFinland") || "Finlandia"}</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500 pointer-events-none">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              <div>
                <label className="form-label">{t("password") || "Contraseña"}</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input"
                  placeholder="••••••••"
                  required
                />
              </div>

              <div>
                <label className="form-label">{t("passwordConfirmation") || "Confirmar contraseña"}</label>
                <input
                  type="password"
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  className="form-input"
                  placeholder="••••••••"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-bold text-lg transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {t("loading") || "Cargando..."}
                  </span>
                ) : t("submit") || "Crear cuenta"}
              </button>
            </form>

            <p className="text-center text-green-700 text-base">
              {t("haveAccount") || "¿Ya tienes cuenta?"}{" "}
              <Link href={`/${lang}/login`} className="text-green-600 hover:text-green-800 font-bold underline">
                {t("loginLink") || "Inicia sesión"}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
