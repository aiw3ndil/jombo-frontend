"use client";
import { useTranslation } from "../../hooks/useTranslation";
import useAuth from "../../hooks/useAuth";
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Login({ params }: { params: { lang: string } }) {
  const { t } = useTranslation("login");
  const lang = params.lang || "es";
  const { login, loading: isLoading, error } = useAuth() as any;
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await login(email, password);
      router.push(`/${lang}`);
    } catch (err) {
      // useAuth sets error in hook; keep lightweight here
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">{t("title")}</h2>
      {error && <div className="text-red-600 mb-2">{String(error)}</div>}
      <form className="space-y-3" onSubmit={handleSubmit}>
        <div>
          <label className="block mb-1">{t("email")}</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border p-2 w-full rounded"
          />
        </div>
        <div>
          <label className="block mb-1">{t("password")}</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border p-2 w-full rounded"
          />
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
          disabled={isLoading}
        >
          {isLoading ? t("loading") || "..." : t("submit")}
        </button>
      </form>
      <p className="mt-3">
        {t("noAccount")} <Link href={`/${lang}/register`}>{t("registerLink")}</Link>
      </p>
    </div>
  );
}
