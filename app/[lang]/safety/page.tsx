import type { Metadata } from "next";
import { langPrefix } from "@/app/lib/i18n/config";
import InfoPage from "@/app/components/InfoPage";

type Props = { params: Promise<{ lang: string }> };

const content = {
  fi: {
    title: "Turvallisuus Jombossa",
    intro: "Luottamus syntyy läpinäkyvyydestä. Näin Jombo auttaa sinua matkustamaan turvallisesti – ja mitä voit tehdä itse.",
    platform: "Mitä Jombo tekee",
    tips: "Vinkit matkalle",
    a: [
      { icon: "✅", title: "Vahvistetut profiilit", text: "Jäsenet voivat vahvistaa sähköpostin ja puhelinnumeron. Merkit näkyvät profiilissa, numero ei koskaan." },
      { icon: "⭐", title: "Arviot", text: "Jokaisen matkan jälkeen kuljettaja ja matkustaja arvioivat toisensa. Arviot näkyvät julkisessa profiilissa." },
      { icon: "🏅", title: "Kokemustaso", text: "Kuljettajan taso kasvaa toteutuneiden matkojen ja hyvien arvioiden myötä." },
      { icon: "💬", title: "Viestit palvelussa", text: "Sovi tapaamispaikasta Jombon viesteillä ennen matkaa – yhteystietoja ei tarvitse jakaa." },
    ],
    b: [
      { icon: "👀", title: "Tarkista profiili", text: "Katso arviot, vahvistukset ja esittely ennen varausta." },
      { icon: "📍", title: "Tapaa julkisella paikalla", text: "Valitse tunnettu ja valaistu paikka, kuten asema tai ostoskeskus." },
      { icon: "📲", title: "Kerro läheiselle", text: "Jaa matkan tiedot ystävälle ja kerro, kun olet perillä." },
      { icon: "🚫", title: "Luota vaistoosi", text: "Jos jokin tuntuu väärältä, voit perua. Ota yhteyttä meihin, jos huomaat epäasiallista toimintaa." },
    ],
    cta: ["Vahvista profiilisi", "Näin Jombo toimii"],
  },
  en: {
    title: "Safety on Jombo",
    intro: "Trust comes from transparency. Here is how Jombo helps you travel safely – and what you can do yourself.",
    platform: "What Jombo does",
    tips: "Tips for the trip",
    a: [
      { icon: "✅", title: "Verified profiles", text: "Members can verify their email and phone number. The badges show on the profile – the number never does." },
      { icon: "⭐", title: "Reviews", text: "After every trip, drivers and passengers review each other. Reviews appear on the public profile." },
      { icon: "🏅", title: "Experience level", text: "A driver's level grows with completed trips and good reviews." },
      { icon: "💬", title: "In-app messages", text: "Agree on the meeting point with Jombo messages before the trip – no need to share contact details." },
    ],
    b: [
      { icon: "👀", title: "Check the profile", text: "Look at reviews, verifications and the bio before booking." },
      { icon: "📍", title: "Meet in a public place", text: "Choose a well-known, well-lit spot such as a station or shopping centre." },
      { icon: "📲", title: "Tell someone", text: "Share your trip details with a friend and let them know when you arrive." },
      { icon: "🚫", title: "Trust your instincts", text: "If something feels wrong, you can cancel. Contact us if you notice inappropriate behaviour." },
    ],
    cta: ["Verify your profile", "How Jombo works"],
  },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const c = lang === "fi" ? content.fi : content.en;
  return { title: `${c.title} | Jombo`, description: c.intro, alternates: { canonical: `${langPrefix(lang)}/safety` } };
}

export default async function SafetyPage({ params }: Props) {
  const { lang } = await params;
  const c = lang === "fi" ? content.fi : content.en;
  return (
    <InfoPage
      title={c.title}
      intro={c.intro}
      groups={[
        { heading: c.platform, steps: c.a },
        { heading: c.tips, steps: c.b },
      ]}
      cta={[
        { href: `${langPrefix(lang)}/profile`, label: c.cta[0] },
        { href: `${langPrefix(lang)}/how-it-works`, label: c.cta[1] },
      ]}
    />
  );
}
