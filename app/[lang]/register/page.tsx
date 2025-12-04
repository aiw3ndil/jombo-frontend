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
  const [oauthError, setOauthError] = useState<string | null>(null);

  // Wait for translations to load
  if (translationsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await register(name, email, password, passwordConfirmation, lang);
      // Forzar recarga completa para actualizar el contexto
      window.location.href = `/${lang}`;
    } catch (err) {
      // errors are surfaced from hook
    }
  };

  const handleOAuthError = (errorMsg: string) => {
    setOauthError(errorMsg);
  };

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-gray-900">{t("title")}</h2>
      {error && <div className="text-red-600 mb-2">{String(error)}</div>}
      {oauthError && <div className="text-red-600 mb-2">{oauthError}</div>}
      
      {/* Google Login Button */}
      <div className="mb-4">
        <GoogleLoginButton 
          redirect={redirect}
          onError={handleOAuthError}
        />
      </div>

      <div className="relative mb-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-gray-50 text-gray-500">{t("or")}</span>
        </div>
      </div>

      <form className="space-y-3" onSubmit={handleSubmit}>
        <div>
          <label className="block mb-1 text-gray-900">{t("name")}</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border p-2 w-full rounded text-gray-900"
          />
        </div>
        <div>
          <label className="block mb-1 text-gray-900">{t("email")}</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border p-2 w-full rounded text-gray-900"
          />
        </div>
        <div>
          <label className="block mb-1 text-gray-900">{t("password")}</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border p-2 w-full rounded text-gray-900"
          />
        </div>
        <div>
          <label className="block mb-1 text-gray-900">{t("passwordConfirmation") || "Confirm Password"}</label>
          <input
            type="password"
            value={passwordConfirmation}
            onChange={(e) => setPasswordConfirmation(e.target.value)}
            className="border p-2 w-full rounded text-gray-900"
          />
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded w-full hover:bg-blue-700"
          disabled={isLoading}
        >
          {isLoading ? t("loading") || "..." : t("submit")}
        </button>
      </form>
      <p className="mt-3 text-gray-900">
        {t("haveAccount")} <Link href={`/${lang}/login`} className="text-blue-600 hover:underline">{t("loginLink")}</Link>
      </p>
    </div>
  );
}
