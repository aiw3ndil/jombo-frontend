export type FaqItem = { q: string; a: string };

/** Preguntas frecuentes de una ruta (texto propio, en/fi) */
export function routeFaq(lang: string, from: string, to: string, distance?: string, duration?: string, price?: number | null): FaqItem[] {
  if (lang === "fi") {
    return [
      {
        q: `Paljonko kimppakyyti ${from} – ${to} maksaa?`,
        a: price
          ? `Kuljettaja päättää hinnan, mutta tyypillisesti se on noin ${price} € per paikka. Jombossa jaetaan vain matkakulut, eikä palvelu peri välityspalkkioita.`
          : "Kuljettaja päättää hinnan. Jombossa jaetaan vain matkakulut, eikä palvelu peri välityspalkkioita.",
      },
      {
        q: `Kuinka kauan matka ${from} – ${to} kestää autolla?`,
        a: `Matka on noin ${distance || "–"} ja kestää tavallisesti ${duration || "–"} liikenteestä ja taukojen määrästä riippuen.`,
      },
      {
        q: "Voinko nousta kyytiin matkan varrelta?",
        a: "Kyllä, jos kuljettaja on lisännyt välipysähdyksiä. Haku löytää myös kyydit, jotka kulkevat kaupunkisi kautta, ja maksat vain oman osuutesi.",
      },
      {
        q: "Entä jos sopivaa kyytiä ei ole?",
        a: "Luo hakuhälytys tai julkaise kyytipyyntö. Saat sähköpostin heti, kun joku julkaisee reittiisi sopivan kyydin.",
      },
    ];
  }
  return [
    {
      q: `How much does a carpool from ${from} to ${to} cost?`,
      a: price
        ? `The driver sets the price, but it is typically around ${price} € per seat. On Jombo you only share travel costs and there are no booking fees.`
        : "The driver sets the price. On Jombo you only share travel costs and there are no booking fees.",
    },
    {
      q: `How long does the drive from ${from} to ${to} take?`,
      a: `The trip is about ${distance || "–"} and usually takes ${duration || "–"}, depending on traffic and breaks.`,
    },
    {
      q: "Can I get on along the way?",
      a: "Yes, if the driver has added stops. Search also finds rides that pass through your town, and you only pay for your part of the trip.",
    },
    {
      q: "What if there is no ride yet?",
      a: "Create a search alert or post a ride request. We'll email you as soon as someone publishes a ride that fits your route.",
    },
  ];
}

export default function RouteFaq({ items, title }: { items: FaqItem[]; title: string }) {
  return (
    <div className="mt-12">
      <h2 className="mb-4 text-lg font-bold text-[var(--brand-dark)]">{title}</h2>
      <div className="space-y-2">
        {items.map((item) => (
          <details key={item.q} className="group rounded-xl border-2 border-[#c4d8b4] bg-white p-4 open:bg-[#f7fbf3]">
            <summary className="cursor-pointer list-none font-semibold text-[var(--brand-dark)] marker:hidden">
              <span className="mr-2 inline-block transition-transform group-open:rotate-90">›</span>
              {item.q}
            </summary>
            <p className="mt-2 pl-5 text-[var(--brand-neutral)]">{item.a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
