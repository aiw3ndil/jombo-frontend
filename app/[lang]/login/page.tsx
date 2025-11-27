"use client";
import { useTranslation } from "@/src/app/hooks/useTranslation";
import useAuth from "@/src/app/hooks/useAuth";
import { useState, FormEvent } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

export default function Login() {
  const { t } = useTranslation("login");
  const params = useParams();
  const lang = (params?.lang as string) || "es";
  const { login, loading, error } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await login(email, password);
      router.push(`/${lang}`);
    } catch (err) {
      // error is managed by hook
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">{t("title")}</h2>
      {error && <div className="text-red-600 mb-2 p-2 bg-red-50 rounded">{String(error)}</div>}
      <form className="space-y-3" onSubmit={handleSubmit}>
        <div>
          <label className="block mb-1">{t("email")}</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border p-2 w-full rounded"
          />
        </div>
        <div>
          <label className="block mb-1">{t("password")}</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border p-2 w-full rounded"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:bg-gray-400"
        >
          {loading ? t("loading") || "..." : t("submit")}
        </button>
      </form>
      <p className="mt-3 text-sm">
        {t("noAccount") || "No tienes cuenta?"} <Link href={`/${lang}/register`} className="text-blue-600 hover:underline">{t("registerLink") || "Registrate"}</Link>
      </p>
    </div>
  );
}
