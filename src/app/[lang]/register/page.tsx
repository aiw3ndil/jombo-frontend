"use client";
import { useTranslation } from "../../hooks/useTranslation";
import useAuth from "../../hooks/useAuth";
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Register({ params }: { params: { lang: string } }) {
  const { t } = useTranslation("register");
  const lang = params.lang || "es";
  const { register, loading: isLoading, error } = useAuth() as any;
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await register(name, email, password);
      router.push(`/${lang}`);
    } catch (err) {
      // errors are surfaced from hook
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">{t("title")}</h2>
      {error && <div className="text-red-600 mb-2">{String(error)}</div>}
      <form className="space-y-3" onSubmit={handleSubmit}>
        <div>
          <label className="block mb-1">{t("name")}</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border p-2 w-full rounded"
          />
        </div>
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
        {t("haveAccount")} <Link href={`/${lang}/login`}>{t("loginLink")}</Link>
      </p>
    </div>
  );
}
