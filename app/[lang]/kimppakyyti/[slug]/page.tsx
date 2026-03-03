import { Metadata } from 'next';
import { TOP_FINNISH_ROUTES } from '@/app/lib/constants/routes';
import { searchTrips, Trip, ExternalOption } from '@/app/lib/api/trips';
import { notFound } from 'next/navigation';
import { promises as fs } from 'fs';
import path from 'path';
import Link from 'next/link';
import ExternalTransportCard from '@/app/components/ExternalTransportCard';

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

  // Structured Data (Schema.org)
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
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Kimppakyydit",
      "itemListElement": trips.slice(0, 3).map((trip, index) => ({
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": `Kyyti ${trip.departure_location} - ${trip.arrival_location}`
        },
        "price": trip.price,
        "priceCurrency": "EUR",
        "position": index + 1
      }))
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-12 px-4 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <div className="mb-12">
        <nav className="text-sm text-brand-gray mb-4">
          <Link href={`/${lang}`} className="hover:text-white transition-colors">Jombo</Link>
          <span className="mx-2">/</span>
          <span className="text-brand-cyan uppercase font-bold tracking-widest text-[10px]">
            {lang === 'fi' ? 'Kimppakyydit' : 'Carpools'}
          </span>
        </nav>
        
        <h1 className="text-4xl md:text-6xl font-black text-white tracking-tightest uppercase italic mb-4">
          <span className="text-brand-cyan block text-lg not-italic font-medium mb-2 tracking-[0.3em]">KIMPPARIT</span>
          {route.from} 
          <span className="text-brand-gray mx-4">→</span> 
          {route.to}
        </h1>
        
        <p className="text-brand-gray text-lg max-w-2xl">
          {lang === 'fi' 
            ? `Löydä tai tarjoa kimppakyyti välille ${route.from} ja ${route.to}. Jombo on 100% ilmainen alusta, jossa jaat vain matkakulut kuljettajan kanssa.`
            : `Find or offer a carpool between ${route.from} and ${route.to}. Jombo is a 100% free platform where you only share travel costs with the driver.`
          }
        </p>
      </div>

      {source === 'digitransit' && (
        <div className="mb-10 p-6 bg-brand-purple/10 border border-brand-purple/20 rounded-[2rem] flex items-center gap-4">
          <div className="w-12 h-12 bg-brand-purple/20 rounded-full flex items-center justify-center text-brand-purple shrink-0">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-white font-bold uppercase tracking-widest text-xs mb-1">
              {lang === 'fi' ? 'Ei kimppakyytejä löytynyt' : 'No carpools found'}
            </p>
            <p className="text-brand-gray text-sm">
              {lang === 'fi' 
                ? 'Näytetään julkisen liikenteen vaihtoehdot välille ' 
                : 'Showing public transport alternatives between '}
              <span className="text-white font-bold">{route.from} - {route.to}</span>
            </p>
          </div>
        </div>
      )}

      {trips.length === 0 && externalOptions.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-[3rem] p-12 text-center backdrop-blur-xl">
          <div className="w-20 h-20 bg-brand-cyan/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-brand-cyan/20">
            <svg className="w-10 h-10 text-brand-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-4 uppercase italic">
            {lang === 'fi' ? 'Ei todavía kyytejä tälle reitille' : 'No trips yet for this route'}
          </h2>
          <p className="text-brand-gray mb-10 max-w-md mx-auto">
            {lang === 'fi' 
              ? `Ole ensimmäinen, joka julkaisee matkan välille ${route.from} - ${route.to} ja aloita kulujen jakaminen!`
              : `Be the first one to publish a trip between ${route.from} - ${route.to} and start sharing costs!`
            }
          </p>
          <Link 
            href={`/${lang}/create-trip?from=${route.from}&to=${route.to}`}
            className="inline-block bg-brand-gradient text-white px-10 py-5 rounded-[2rem] font-black uppercase tracking-widest text-sm transition-all hover:scale-105 shadow-xl shadow-brand-cyan/20"
          >
            {t.page.home.publish || 'Julkaise matka'}
          </Link>
        </div>
      ) : (
        <div className="grid gap-8">
            <p className="text-brand-cyan font-bold uppercase tracking-widest text-xs mb-2">
                {lang === 'fi' ? `Löytyi ${trips.length + externalOptions.length} vaihtoehtoa` : `Found ${trips.length + externalOptions.length} options`}
            </p>
          
          {/* Render external transport options */}
          {externalOptions.map((option, idx) => (
            <ExternalTransportCard key={`ext-${idx}`} option={option} lang={lang} />
          ))}

          {trips.length > 0 && (
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 mt-8">
              <div>
                <h3 className="text-xl font-bold text-white uppercase italic">
                  {lang === 'fi' ? 'Katso kaikki kyytejä ja varaa' : 'See all carpools and book'}
                </h3>
                <p className="text-brand-gray text-sm">
                  {lang === 'fi' 
                    ? `Päivitettyjä kyytejä löytyi tälle reitille Jombossa.` 
                    : `Updated carpools found for this route in Jombo.`
                  }
                </p>
              </div>
              <Link 
                href={`/${lang}/search?from=${route.from}&to=${route.to}`}
                className="bg-white text-black px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-brand-cyan hover:text-white transition-all shrink-0"
              >
                {t.page.home.search || 'Hae matka'}
              </Link>
            </div>
          )}
        </div>
      )}

      {/* SEO Text Content - Very important for Google */}
      <div className="mt-24 prose prose-invert max-w-none border-t border-white/5 pt-16">
        <h2 className="text-3xl font-black text-white uppercase italic mb-8">
            {lang === 'fi' ? `Matkusta välillä ${route.from} ja ${route.to}` : `Travel between ${route.from} and ${route.to}`}
        </h2>
        <div className="grid md:grid-cols-2 gap-12 text-brand-gray">
            <div className="space-y-4">
                <h3 className="text-white font-bold uppercase tracking-widest text-sm">Edullinen vaihtoehto</h3>
                <p>
                    {lang === 'fi' 
                        ? `Kimppakyyti on usein edullisempi vaihtoehto kuin juna tai bussi matkalla ${route.from} - ${route.to}. Jakamalla polttoainekulut säästät rahaa ja matka taittuu mukavasti hyvässä seurassa.`
                        : `Carpooling is often a cheaper alternative than train or bus on the ${route.from} - ${route.to} route. By sharing fuel costs, you save money and the journey goes comfortably in good company.`
                    }
                </p>
            </div>
            <div className="space-y-4">
                <h3 className="text-white font-bold uppercase tracking-widest text-sm">Ekologinen valinta</h3>
                <p>
                    {lang === 'fi' 
                        ? `Vähennä hiilijalanjälkeäsi. Täyttämällä tyhjät paikat autossa vähennämme teillä liikkuvien autojen määrää ja säästämme luontoa matkalla ${route.from}:sta ${route.to}:on.`
                        : `Reduce your carbon footprint. By filling empty seats in the car, we reduce the number of cars on the road and save nature on the way from ${route.from} to ${route.to}.`
                    }
                </p>
            </div>
        </div>
      </div>
    </div>
  );
}
