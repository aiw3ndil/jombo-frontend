import Link from "next/link";

export type InfoSection = { icon: string; title: string; text: string };

/** Página de contenido estático (cómo funciona, seguridad…) */
export default function InfoPage({
  title,
  intro,
  groups,
  cta,
}: {
  title: string;
  intro: string;
  groups: { heading: string; steps: InfoSection[] }[];
  cta?: { href: string; label: string }[];
}) {
  return (
    <div className="min-h-screen bg-[var(--page-bg)]">
      <section className="border-b-2 border-[#c4d8b4] bg-[#ebf3e2] px-4 py-10">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="mb-2 text-2xl font-bold text-[var(--brand-dark)] md:text-3xl">{title}</h1>
          <p className="mx-auto max-w-2xl text-[var(--brand-neutral)]">{intro}</p>
        </div>
      </section>
      <section className="px-4 py-10">
        <div className="mx-auto max-w-4xl space-y-10">
          {groups.map((group) => (
            <div key={group.heading}>
              <h2 className="mb-4 text-xl font-bold text-[var(--brand-dark)]">{group.heading}</h2>
              <ol className="grid gap-4 md:grid-cols-2">
                {group.steps.map((step, i) => (
                  <li key={step.title} className="flex gap-4 rounded-2xl border-2 border-[#c4d8b4] bg-white p-5">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#ebf3e2] text-xl" aria-hidden="true">
                      {step.icon}
                    </span>
                    <div>
                      <h3 className="font-bold text-[var(--brand-dark)]">
                        <span className="mr-1 text-[var(--brand-blue)]">{i + 1}.</span> {step.title}
                      </h3>
                      <p className="text-[var(--brand-neutral)]">{step.text}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          ))}
          {cta && (
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              {cta.map((c, i) => (
                <Link key={c.href} href={c.href} className={i === 0 ? "btn-primary px-6 py-3" : "btn-secondary px-6 py-3"}>
                  {c.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
