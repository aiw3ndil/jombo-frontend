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
      const destination = redirect || `/${lang}`;
      window.location.href = destination;
    } catch (err) {
      console.error("Login error:", err);
    }
  };

  const handleOAuthError = (errorMsg: string) => {
    setOauthError(errorMsg);
  };

  return (
    <div className="min-h-screen bg-green-50 py-16 px-4">
      <div className="max-w-md mx-auto">
        {/* Título de página */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-green-900 mb-2">
            {t("title") || "Iniciar sesión"}
          </h1>
          <p className="text-green-700 text-lg">Accede a tu cuenta de Jombo</p>
        </div>

        {/* Card del formulario */}
        <div className="form-card">
          {/* Errores */}
          {(error || oauthError) && (
            <div className="form-error mb-6">
              {String(error || oauthError)}
            </div>
          )}

          <div className="space-y-6">
            {/* Google Login */}
            <GoogleLoginButton redirect={redirect} onError={handleOAuthError} />

            {/* Separador */}
            <div className="flex items-center gap-4">
              <div className="flex-grow border-t-2 border-green-100"></div>
              <span className="text-green-500 font-semibold text-sm">{t("or") || "o"}</span>
              <div className="flex-grow border-t-2 border-green-100"></div>
            </div>

            {/* Formulario email/password */}
            <form className="space-y-5" onSubmit={handleSubmit}>
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
                <label className="form-label">{t("password") || "Contraseña"}</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input"
                  placeholder="••••••••"
                  required
                />
                <div className="flex justify-end mt-2">
                  <Link
                    href={`/${lang}/forgot-password`}
                    className="text-green-600 hover:text-green-800 font-semibold text-sm underline"
                  >
                    {t("forgotPassword") || "¿Olvidaste tu contraseña?"}
                  </Link>
                </div>
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
                ) : t("submit") || "Entrar"}
              </button>
            </form>

            <p className="text-center text-green-700 text-base">
              {t("noAccount") || "¿No tienes cuenta?"}{" "}
              <Link href={`/${lang}/register`} className="text-green-600 hover:text-green-800 font-bold underline">
                {t("registerLink") || "Regístrate"}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
