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
    <div className="min-h-screen bg-green-50 py-16 px-4">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-green-900 mb-2">
            {t("resetPasswordTitle") || "Nueva contraseña"}
          </h1>
          <p className="text-green-700 text-lg">
            {t("resetPasswordDescription") || "Elige una nueva contraseña segura para tu cuenta."}
          </p>
        </div>

        <div className="form-card">
          {error && <div className="form-error mb-6">{error}</div>}

          {success ? (
            <div className="space-y-6 text-center">
              <div className="bg-green-50 border-2 border-green-300 rounded-xl p-8 flex flex-col items-center gap-4">
                <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-green-800 font-semibold text-lg">{t("passwordResetSuccess") || "¡Contraseña actualizada correctamente!"}</p>
                <p className="text-green-600 text-base">Redirigiendo al inicio de sesión...</p>
              </div>
            </div>
          ) : (
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label className="form-label">{t("newPassword") || "Nueva contraseña"}</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>
              <div>
                <label className="form-label">{t("confirmPassword") || "Confirmar contraseña"}</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="form-input"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>

              <button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-bold text-lg transition-colors shadow-md disabled:opacity-50"
                disabled={isLoading || !token}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {t("loading") || "Guardando..."}
                  </span>
                ) : t("resetPasswordSubmit") || "Guardar nueva contraseña"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
