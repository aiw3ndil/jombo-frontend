import type { Metadata } from "next";
import Link from "next/link";
import { langPrefix } from "@/app/lib/i18n/config";
import { routesByCity } from "@/app/lib/constants/routes";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  return {
    title: lang === "fi" ? "Kimppakyydit Suomessa – kaikki reitit | Jombo" : "Carpool routes in Finland | Jombo",
    description:
      lang === "fi"
        ? "Selaa suosituimpia kimppakyytireittejä Suomessa: Helsinki, Tampere, Turku, Oulu, Jyväskylä ja muut. Jaa matkakulut ilman palkkioita."
        : "Browse the most popular carpool routes in Finland: Helsinki, Tampere, Turku, Oulu, Jyväskylä and more. Share travel costs with no fees.",
    alternates: { canonical: `${langPrefix(lang)}/kimppakyyti`, languages: { fi: "/kimppakyyti", en: "/en/kimppakyyti" } },
  };
}

export default async function RoutesIndexPage({ params }: Props) {
  const { lang } = await params;
  const fi = lang === "fi";
  const groups = routesByCity();

  return (
    <div className="min-h-screen bg-[var(--page-bg)]">
      <section className="border-b-2 border-[#c4d8b4] bg-[#ebf3e2] px-4 py-8">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-2xl font-bold text-[var(--brand-dark)] md:text-3xl">{fi ? "Kimppakyytireitit Suomessa" : "Carpool routes in Finland"}</h1>
          <p className="max-w-2xl text-[var(--brand-neutral)]">
            {fi
              ? "Valitse reitti nähdäksesi tulevat kyydit, tyypillisen hinnan ja matkustajien kyytipyynnöt."
              : "Pick a route to see upcoming rides, the typical price and passengers' ride requests."}
          </p>
        </div>
      </section>
      <section className="px-4 py-8">
        <div className="mx-auto grid max-w-5xl gap-4 md:grid-cols-2 lg:grid-cols-3">
          {groups.map(([city, routes]) => (
            <div key={city} className="rounded-2xl border-2 border-[#c4d8b4] bg-white p-5">
              <h2 className="mb-3 font-bold text-[var(--brand-dark)]">{fi ? `Lähtö: ${city}` : `From ${city}`}</h2>
              <ul className="space-y-1.5">
                {routes.map((r) => (
                  <li key={r.slug}>
                    <Link href={`${langPrefix(lang)}/kimppakyyti/${r.slug}`} className="flex justify-between gap-2 text-[var(--brand-dark)] hover:text-[var(--brand-blue)] hover:underline">
                      <span>{r.from} → {r.to}</span>
                      <span className="text-sm text-[var(--brand-neutral)]">{r.distance}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
