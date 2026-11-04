import type { Metadata } from "next";
import { langPrefix } from "@/app/lib/i18n/config";
import InfoPage from "@/app/components/InfoPage";

type Props = { params: Promise<{ lang: string }> };

const content = {
  fi: {
    title: "Näin Jombo toimii",
    intro: "Jombo yhdistää kuljettajat, joilla on vapaita paikkoja, ja matkustajat, jotka ovat menossa samaan suuntaan. Kulut jaetaan – ei palkkioita.",
    passengers: "Matkustajille",
    drivers: "Kuljettajille",
    p: [
      { icon: "🔎", title: "Etsi kyyti", text: "Hae lähtö- ja määränpää. Löydät myös kyydit, jotka kulkevat kaupunkisi kautta välipysähdyksen kautta." },
      { icon: "🧭", title: "Suodata ja vertaa", text: "Rajaa päivän, kellonajan, hinnan ja asetusten mukaan: lemmikit, savuton auto, enintään kaksi takapenkillä." },
      { icon: "⚡", title: "Varaa", text: "Pikavarauksella paikkasi vahvistuu heti. Muuten kuljettaja hyväksyy pyynnön, ja saat ilmoituksen." },
      { icon: "🔔", title: "Ei sopivaa kyytiä?", text: "Luo hakuhälytys tai julkaise kyytipyyntö – kerromme heti, kun sopiva kyyti julkaistaan." },
    ],
    d: [
      { icon: "🚗", title: "Julkaise matka", text: "Lisää reitti, välipysähdykset, aika ja auto. Ehdotamme reilua hintaa matkan pituuden perusteella." },
      { icon: "⚙️", title: "Valitse asetukset", text: "Päätä itse: pikavaraus vai hyväksyntä, lemmikit, musiikki ja kuinka paljon haluat jutella." },
      { icon: "🙋", title: "Vastaa kyytipyyntöihin", text: "Selaa matkustajien pyyntöjä ja tarjoa kyytiä yhdellä napautuksella." },
      { icon: "💶", title: "Jaa kulut", text: "Matkustajat maksavat osuutensa suoraan sinulle. Jombo ei ota välityspalkkiota." },
    ],
    cta: ["Etsi kyyti", "Tarjoa kyytiä"],
  },
  en: {
    title: "How Jombo works",
    intro: "Jombo connects drivers who have empty seats with passengers heading the same way. You share the costs – there are no fees.",
    passengers: "For passengers",
    drivers: "For drivers",
    p: [
      { icon: "🔎", title: "Find a ride", text: "Search by origin and destination. You'll also find rides that pass through your town as a stop." },
      { icon: "🧭", title: "Filter and compare", text: "Narrow by date, time, price and preferences: pets, no smoking, max two in the back." },
      { icon: "⚡", title: "Book", text: "With instant booking your seat is confirmed right away. Otherwise the driver approves your request and you get notified." },
      { icon: "🔔", title: "No ride yet?", text: "Create a search alert or post a ride request – we'll tell you as soon as a matching ride is published." },
    ],
    d: [
      { icon: "🚗", title: "Publish your ride", text: "Add the route, stops, time and car. We suggest a fair price based on the distance." },
      { icon: "⚙️", title: "Set your preferences", text: "You decide: instant booking or approval, pets, music and how chatty you are." },
      { icon: "🙋", title: "Answer ride requests", text: "Browse passengers' requests and offer them your ride in one tap." },
      { icon: "💶", title: "Share the costs", text: "Passengers pay their share directly to you. Jombo takes no commission." },
    ],
    cta: ["Find a ride", "Offer a ride"],
  },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const c = lang === "fi" ? content.fi : content.en;
  return { title: `${c.title} | Jombo`, description: c.intro, alternates: { canonical: `${langPrefix(lang)}/how-it-works` } };
}

export default async function HowItWorksPage({ params }: Props) {
  const { lang } = await params;
  const c = lang === "fi" ? content.fi : content.en;
  return (
    <InfoPage
      title={c.title}
      intro={c.intro}
      groups={[
        { heading: c.passengers, steps: c.p },
        { heading: c.drivers, steps: c.d },
      ]}
      cta={[
        { href: `${langPrefix(lang)}/ride-requests`, label: c.cta[0] },
        { href: `${langPrefix(lang)}/create-trip`, label: c.cta[1] },
      ]}
    />
  );
}
