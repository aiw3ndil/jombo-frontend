"use client";
import { useTranslation } from "../../hooks/useTranslation";

export default function Register({ params }: { params: { lang: string } }) {
  const { t } = useTranslation("register");

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">{t("title")}</h2>
      <form className="space-y-3">
        <div>
          <label className="block mb-1">{t("name")}</label>
          <input className="border p-2 w-full rounded" />
        </div>
        <div>
          <label className="block mb-1">{t("email")}</label>
          <input className="border p-2 w-full rounded" />
        </div>
        <div>
          <label className="block mb-1">{t("password")}</label>
          <input type="password" className="border p-2 w-full rounded" />
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded">{t("submit")}</button>
      </form>
    </div>
  );
}
