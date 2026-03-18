import { Metadata } from 'next';
import { TOP_FINNISH_ROUTES } from '@/app/lib/constants/routes';
import { searchTrips, Trip, ExternalOption, SearchResponse } from '@/app/lib/api/trips';
import { notFound } from 'next/navigation';
import { promises as fs } from 'fs';
import * as path from 'path';
import Link from 'next/link';
import ExternalTransportCard from '@/app/components/ExternalTransportCard';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ lang: string; slug: string }>;
}

export async function generateStaticParams() {
  const paths = [];
  for (const route of TOP_FINNISH_ROUTES) {
    paths.push({ lang: 'fi', slug: route.slug });
    paths.push({ lang: 'en', slug: route.slug });
    paths.push({ lang: 'es', slug: route.slug });
  }
  return paths;
}

async function getTranslations(lang: string) {
  try {
    const filePath = path.join(process.cwd(), 'public', 'locales', lang, 'common.json');
    const fileContent = await fs.readFile(filePath, 'utf8');
    return JSON.parse(fileContent);
  } catch (error) {
    const fallbackPath = path.join(process.cwd(), 'public', 'locales', 'fi', 'common.json');
    const fallbackContent = await fs.readFile(fallbackPath, 'utf8');
    return JSON.parse(fallbackContent);
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, slug } = await params;
  const route = TOP_FINNISH_ROUTES.find(r => r.slug === slug);
  
  if (!route) return { title: 'Jombo' };

  const from = route.from;
  const to = route.to;

  const titles: Record<string, string> = {
    fi: `Kimppakyyti ${from} – ${to} | Säästä rahaa | Jombo`,
    es: `Viaje compartido ${from} – ${to} | Ahorra dinero | Jombo`,
    en: `Carpool ${from} – ${to} | Save money | Jombo`,
  };

  const descriptions: Record<string, string> = {
    fi: `Etsitkö halpaa kyytiä välille ${from} – ${to}? Löydä kimppakyyti Jombosta, jaa polttoainekulut ja matkusta ekologisesti.`,
    es: `¿Buscas un viaje barato entre ${from} y ${to}? Encuentra un viaje compartido en Jombo, comparte gastos y viaja de forma ecológica.`,
    en: `Looking for a cheap ride between ${from} and ${to}? Find a carpool on Jombo, share fuel costs, and travel ecologically.`,
  };

  return {
    title: titles[lang] || titles.fi,
    description: descriptions[lang] || descriptions.fi,
    alternates: {
      canonical: `/${lang}/kimppakyyti/${slug}`,
    }
  };
}

export default async function RoutePage({ params }: Props) {
  const { lang, slug } = await params;
  const route = TOP_FINNISH_ROUTES.find(r => r.slug === slug);

  if (!route) {
    notFound();
  }

  const t = await getTranslations(lang);
  const response = await searchTrips(route.from, route.to);
  const trips = response.trips;
  const externalOptions = response.external_options;
  const source = response.source;

  t.trips = t.trips || {};

  // Calcular CO2 ahorrado (aprox 120g por km)
  const distNum = parseInt(route.distance || "0");
  const co2Value = Math.round(distNum * 0.12);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": `Kimppakyyti ${route.from} - ${route.to}`,
    "description": `Kimppakyytipalvelu välillä ${route.from} ja ${route.to}`,
    "provider": {
      "@type": "Organization",
      "name": "Jombo"
    },
    "areaServed": {
      "@type": "Country",
      "name": "Finland"
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      {/* ── HERO ── */}
      <section className="bg-green-50 border-b-2 border-green-100 py-20 px-4 relative overflow-hidden">
        {/* Decoración de fondo */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-green-100/50 rounded-full blur-3xl -mr-48 -mt-48 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-green-100/30 rounded-full blur-2xl -ml-32 -mb-32 pointer-events-none"></div>

        <div className="max-w-5xl mx-auto relative z-10">
          <nav className="flex items-center gap-2 text-sm font-bold text-green-600 mb-8 uppercase tracking-widest">
            <Link href={`/${lang}`} className="hover:text-green-800 transition-colors">Jombo</Link>
            <svg className="w-4 h-4 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-green-400">
              {lang === 'fi' ? 'Kimppakyydit' : 'Carpools'}
            </span>
          </nav>
          
          <div className="inline-flex items-center gap-2 bg-green-100 border border-green-300 text-green-800 px-5 py-2 rounded-full text-sm font-black mb-6 uppercase tracking-wide shadow-sm">
            <span className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></span>
            {t.trips.popularRoute || 'SUOSITTU REITTI'}
          </div>

          <h1 className="text-5xl md:text-7xl font-black text-green-900 leading-tight mb-8 tracking-tight">
            {route.from} 
            <span className="text-green-300 mx-4 inline-block transform hover:scale-110 transition-transform cursor-default">→</span> 
            {route.to}
          </h1>
          
          <p className="text-xl text-green-700 max-w-3xl font-medium opacity-90 leading-relaxed mb-12">
            {t.trips.description?.replace('{from}', route.from).replace('{to}', route.to) || 
             `Löydä tai tarjoa kimppakyyti välille ${route.from} ja ${route.to}. Jombo on Suomen ensimmäinen 100% ilmainen alusta, jossa jaat vain matkakulut ilman piilokuluja.`}
          </p>

          {/* ── ROUTE SNAPSHOT CARD ── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border-2 border-green-100 p-8 rounded-[2rem] shadow-sm hover:border-green-300 transition-colors group">
              <p className="text-[10px] font-black text-green-500 uppercase tracking-widest mb-2">{t.trips.distance}</p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-green-600 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <p className="text-3xl font-black text-green-950">{route.distance || "---"}</p>
              </div>
            </div>

            <div className="bg-white border-2 border-green-100 p-8 rounded-[2rem] shadow-sm hover:border-green-300 transition-colors group">
              <p className="text-[10px] font-black text-green-500 uppercase tracking-widest mb-2">{t.trips.duration}</p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-green-600 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-3xl font-black text-green-950">{route.duration || "---"}</p>
              </div>
            </div>

            <div className="bg-white border-2 border-green-200/50 p-8 rounded-[2rem] shadow-sm hover:border-green-300 transition-colors group bg-gradient-to-br from-white to-green-50/50">
              <p className="text-[10px] font-black text-green-500 uppercase tracking-widest mb-2">{t.trips.co2Saved}</p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center text-white group-hover:rotate-12 transition-transform shadow-lg shadow-green-200">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
                <p className="text-3xl font-black text-green-950">~{co2Value} kg</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CONTENIDO ── */}
      <section className="py-24 px-4 bg-white relative -mt-8">
        <div className="max-w-5xl mx-auto">
          
          {source === 'digitransit' && (
            <div className="mb-16 p-10 bg-green-50 border-2 border-green-100 rounded-[3rem] flex items-center gap-8 shadow-xl shadow-green-900/5 border-l-8 border-l-green-600 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-100/50 rounded-full -mr-16 -mt-16 blur-2xl"></div>
              <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center text-green-600 shadow-sm shrink-0 relative z-10">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="relative z-10">
                <p className="text-green-900 font-black uppercase tracking-[0.3em] text-[10px] mb-2 opacity-50">
                  {lang === 'fi' ? 'Kuljetusvaihtoehdot' : 'Transport alternatives'}
                </p>
                <p className="text-green-800 text-xl font-bold leading-relaxed">
                  {t.trips.noTripsFound?.replace('{from}', route.from).replace('{to}', route.to) || 
                   `Ei kimppakyytejä tänään. Näytetään julkinen liikenne välille ${route.from} ja ${route.to}`}
                </p>
              </div>
            </div>
          )}

          {trips.length === 0 && externalOptions.length === 0 ? (
            <div className="bg-white border-2 border-green-100 rounded-[4rem] p-20 text-center shadow-2xl shadow-green-900/5 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-b from-green-50/30 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
              <div className="relative z-10">
                <div className="w-28 h-28 bg-green-50 rounded-[2rem] flex items-center justify-center mx-auto mb-10 border-2 border-green-100 transform group-hover:scale-110 transition-transform duration-700 shadow-inner">
                  <svg className="w-14 h-14 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h2 className="text-4xl font-black text-green-950 mb-6 tracking-tight">
                  {t.trips.routeReadyTitle || 'Reitti valmiina ensimmäiselle matkalle'}
                </h2>
                <p className="text-green-700 text-xl mb-14 max-w-xl mx-auto font-medium opacity-80 leading-relaxed">
                  {t.trips.routeReadyDesc?.replace('{from}', route.from).replace('{to}', route.to) || 
                   `Ole ensimmäinen, joka ilmoittaa matkan välille ${route.from} ja ${route.to} ja aloita kulujen jakaminen muiden kanssa.`}
                </p>
                <Link 
                  href={`/${lang}/create-trip?from=${route.from}&to=${route.to}`}
                  className="btn-primary px-16 py-7 text-xl shadow-2xl shadow-green-700/20 hover:shadow-green-700/40"
                >
                  {t.trips.publishFirst || t.page.home.publish || 'Ilmoita ensimmäinen matka'}
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-16">
              <div className="flex items-center justify-between border-b-2 border-green-50 pb-8">
                <h2 className="text-3xl font-black text-green-950 uppercase tracking-widest flex items-center gap-6">
                  <span className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center text-white text-lg shadow-lg shadow-green-200">
                    {trips.length + externalOptions.length}
                  </span>
                  {t.trips.optionsFound || 'Opciones encontradas'}
                </h2>
              </div>

              {/* Render external transport options */}
              <div className="grid grid-cols-1 gap-8">
                {externalOptions.map((option, idx) => (
                  <ExternalTransportCard key={`ext-${idx}`} option={option} lang={lang} />
                ))}
              </div>

              {trips.length > 0 && (
                <div className="mt-24 space-y-12 animate-in fade-in duration-1000">
                  <div className="flex items-center gap-6">
                    <div className="h-px flex-1 bg-green-100"></div>
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-green-400">{t.trips.communityTitle}</span>
                    <div className="h-px flex-1 bg-green-100"></div>
                  </div>
                  
                  <div className="bg-green-700 rounded-[4rem] p-12 md:p-20 text-white shadow-3xl shadow-green-900/30 flex flex-col lg:row items-center justify-between gap-12 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-white opacity-[0.03] rounded-full -mr-80 -mt-80 blur-3xl pointer-events-none group-hover:opacity-[0.06] transition-opacity duration-1000"></div>
                    <div className="absolute bottom-0 left-0 w-80 h-80 bg-green-400 opacity-[0.05] rounded-full -ml-40 -mb-40 blur-3xl pointer-events-none"></div>
                    
                    <div className="relative z-10 max-w-2xl text-center lg:text-left">
                      <h3 className="text-4xl md:text-5xl font-black leading-tight mb-6">
                        {lang === 'fi' ? 'Kimppakyydit Jombossa' : 'Carpools in Jombo'}
                      </h3>
                      <p className="text-green-50 text-xl font-medium opacity-80 leading-relaxed italic">
                        {t.trips.communitySubtitle}
                      </p>
                    </div>
                    <Link 
                      href={`/${lang}/search?from=${route.from}&to=${route.to}`}
                      className="relative z-10 bg-white text-green-900 px-16 py-7 rounded-[2rem] font-black uppercase tracking-widest text-sm hover:bg-green-50 hover:scale-105 transition-all shadow-2xl whitespace-nowrap active:scale-95"
                    >
                      {t.page.home.search || 'Katso kaikki matkat'}
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── TRUST & BENEFITS ── */}
          <div className="mt-40 bg-green-50/50 rounded-[4rem] p-12 md:p-20 border-2 border-green-50">
            <div className="max-w-3xl mb-20">
              <h2 className="text-4xl md:text-5xl font-black text-green-950 mb-6 tracking-tight leading-tight">
                  {t.trips.everythingAbout} {route.from} <span className="text-green-300">→</span> {route.to}
              </h2>
              <div className="w-20 h-2 bg-green-600 rounded-full"></div>
            </div>

            <div className="grid md:grid-cols-2 gap-20 text-green-800">
                <div className="space-y-8 group">
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-green-600 shadow-xl border border-green-100 group-hover:rotate-6 transition-transform">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-black text-green-900 uppercase tracking-wider">{t.trips.smartSavingTitle}</h3>
                    <p className="text-lg leading-relaxed opacity-90 font-medium">
                        {t.trips.smartSavingDesc}
                    </p>
                </div>
                <div className="space-y-8 group">
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-green-600 shadow-xl border border-green-100 group-hover:-rotate-6 transition-transform">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 002 2 2 2 0 012 2v.1c0 .667.333 1.1 1 1.3M9 21h6m-3-12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-black text-green-900 uppercase tracking-wider">{t.trips.ecoCommitmentTitle}</h3>
                    <p className="text-lg leading-relaxed opacity-90 font-medium">
                        {t.trips.ecoCommitmentDesc}
                    </p>
                </div>
            </div>
            
            <div className="mt-20 pt-16 border-t border-green-100 flex flex-col md:flex-row items-center gap-12 justify-between">
              <div className="flex -space-x-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="w-14 h-14 rounded-full border-4 border-white bg-green-100 flex items-center justify-center shadow-lg shadow-green-900/5 overflow-hidden">
                    <img src={`https://i.pravatar.cc/150?u=${i + 10}`} alt="User" />
                  </div>
                ))}
                <div className="w-14 h-14 rounded-full border-4 border-white bg-green-700 flex items-center justify-center shadow-lg text-white font-black text-xs">
                  +10k
                </div>
              </div>
              <p className="text-green-800 font-bold text-xl text-center md:text-left">
                {t.trips.joinThousands || 'Liity tuhansiin jotka jo säästävät kyydeistä.'}
              </p>
              <Link href={`/${lang}/register`} className="btn-secondary px-10 py-5 whitespace-nowrap">
                {t.trips.registerFree || 'Rekisteröidy ilmaiseksi'}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
