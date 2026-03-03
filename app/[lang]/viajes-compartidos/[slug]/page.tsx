import { Metadata } from 'next';
import { TOP_SPANISH_ROUTES } from '@/app/lib/constants/routes';
import { searchTrips } from '@/app/lib/api/trips';
import { notFound } from 'next/navigation';
import { promises as fs } from 'fs';
import path from 'path';
import Link from 'next/link';

interface Props {
  params: Promise<{ lang: string; slug: string }>;
}

export async function generateStaticParams() {
  const paths = [];
  for (const route of TOP_SPANISH_ROUTES) {
    paths.push({ lang: 'es', slug: route.slug });
    paths.push({ lang: 'en', slug: route.slug });
  }
  return paths;
}

async function getTranslations(lang: string) {
  try {
    const filePath = path.join(process.cwd(), 'public', 'locales', lang, 'common.json');
    const fileContent = await fs.readFile(filePath, 'utf8');
    return JSON.parse(fileContent);
  } catch (error) {
    const fallbackPath = path.join(process.cwd(), 'public', 'locales', 'es', 'common.json');
    const fallbackContent = await fs.readFile(fallbackPath, 'utf8');
    return JSON.parse(fallbackContent);
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, slug } = await params;
  const route = TOP_SPANISH_ROUTES.find(r => r.slug === slug);
  
  if (!route) return { title: 'Jombo' };

  const from = route.from;
  const to = route.to;

  const titles: Record<string, string> = {
    es: `Viaje compartido ${from} – ${to} | Ahorra en tu viaje | Jombo`,
    en: `Carpool ${from} – ${to} | Save money | Jombo`,
  };

  const descriptions: Record<string, string> = {
    es: `¿Buscas un viaje barato de ${from} a ${to}? Encuentra coches compartidos en Jombo, comparte gastos de gasolina y viaja de forma sostenible.`,
    en: `Looking for a cheap ride from ${from} to ${to}? Find carpools on Jombo, share fuel costs, and travel sustainably.`,
  };

  return {
    title: titles[lang] || titles.es,
    description: descriptions[lang] || descriptions.es,
    alternates: {
      canonical: `/${lang}/viajes-compartidos/${slug}`,
    }
  };
}

export default async function SpanishRoutePage({ params }: Props) {
  const { lang, slug } = await params;
  const route = TOP_SPANISH_ROUTES.find(r => r.slug === slug);

  if (!route) {
    notFound();
  }

  const t = await getTranslations(lang);
  const trips = await searchTrips(route.from, route.to);

  // Structured Data (Schema.org)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": `Viaje compartido ${route.from} - ${route.to}`,
    "description": `Servicio de coche compartido entre ${route.from} y ${route.to}`,
    "provider": {
      "@type": "Organization",
      "name": "Jombo"
    },
    "areaServed": {
      "@type": "Country",
      "name": "Spain"
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Viajes Compartidos",
      "itemListElement": trips.slice(0, 3).map((trip, index) => ({
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": `Viaje ${trip.departure_location} - ${trip.arrival_location}`
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
          <span className="text-brand-purple uppercase font-bold tracking-widest text-[10px]">
            {lang === 'es' ? 'Viajes Compartidos' : 'Carpools'}
          </span>
        </nav>
        
        <h1 className="text-4xl md:text-6xl font-black text-white tracking-tightest uppercase italic mb-4">
          <span className="text-brand-purple block text-lg not-italic font-medium mb-2 tracking-[0.3em]">RUTA TOP</span>
          {route.from} 
          <span className="text-brand-gray mx-4">→</span> 
          {route.to}
        </h1>
        
        <p className="text-brand-gray text-lg max-w-2xl">
          {lang === 'es' 
            ? `Encuentra o publica tu viaje compartido entre ${route.from} y ${route.to}. Jombo es una plataforma 100% gratuita para compartir gastos de viaje sin comisiones.`
            : `Find or post your carpool between ${route.from} and ${route.to}. Jombo is a 100% free platform to share travel costs without commissions.`
          }
        </p>
      </div>

      {trips.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-[3rem] p-12 text-center backdrop-blur-xl">
          <div className="w-20 h-20 bg-brand-purple/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-brand-purple/20">
            <svg className="w-10 h-10 text-brand-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-4 uppercase italic">
            {lang === 'es' ? 'Aún no hay viajes para esta ruta' : 'No trips yet for this route'}
          </h2>
          <p className="text-brand-gray mb-10 max-w-md mx-auto">
            {lang === 'es' 
              ? `¡Sé el primero en publicar un viaje entre ${route.from} y ${route.to} para empezar a compartir gastos!`
              : `Be the first to post a trip between ${route.from} and ${route.to} to start sharing costs!`
            }
          </p>
          <Link 
            href={`/${lang}/create-trip?from=${route.from}&to=${route.to}`}
            className="inline-block bg-brand-gradient text-white px-10 py-5 rounded-[2rem] font-black uppercase tracking-widest text-sm transition-all hover:scale-105 shadow-xl shadow-brand-purple/20"
          >
            {t.page.home.publish || 'Publicar viaje'}
          </Link>
        </div>
      ) : (
        <div className="grid gap-6">
            <p className="text-brand-purple font-bold uppercase tracking-widest text-xs mb-2">
                {lang === 'es' ? `Se han encontrado ${trips.length} viajes` : `Found ${trips.length} trips`}
            </p>
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-bold text-white uppercase italic">
                {lang === 'es' ? 'Ver todos los viajes disponibles' : 'See all available trips'}
              </h3>
              <p className="text-brand-gray">
                {lang === 'es' 
                  ? `Hay viajes actualizados para esta ruta.` 
                  : `There are updated trips for this route.`
                }
              </p>
            </div>
            <Link 
              href={`/${lang}/search?from=${route.from}&to=${route.to}`}
              className="bg-white text-black px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-brand-purple hover:text-white transition-all"
            >
              {t.page.home.search || 'Buscar viaje'}
            </Link>
          </div>
        </div>
      )}

      <div className="mt-24 prose prose-invert max-w-none border-t border-white/5 pt-16">
        <h2 className="text-3xl font-black text-white uppercase italic mb-8">
            {lang === 'es' ? `Viajar entre ${route.from} y ${route.to}` : `Travel between ${route.from} and ${route.to}`}
        </h2>
        <div className="grid md:grid-cols-2 gap-12 text-brand-gray">
            <div className="space-y-4">
                <h3 className="text-white font-bold uppercase tracking-widest text-sm">La opción más barata</h3>
                <p>
                    {lang === 'es' 
                        ? `Compartir coche es a menudo la opción más económica para viajar de ${route.from} a ${route.to}. Al dividir los gastos de combustible y peajes, ahorras dinero mientras viajas cómodamente.`
                        : `Carpooling is often the most economical option to travel from ${route.from} to ${route.to}. By splitting fuel and toll costs, you save money while traveling comfortably.`
                    }
                </p>
            </div>
            <div className="space-y-4">
                <h3 className="text-white font-bold uppercase tracking-widest text-sm">Viaje Sostenible</h3>
                <p>
                    {lang === 'es' 
                        ? `Reduce tu impacto ambiental. Al llenar los asientos vacíos, disminuimos el número de coches en las carreteras y protegemos el medio ambiente en el trayecto de ${route.from} a ${route.to}.`
                        : `Reduce your environmental impact. By filling empty seats, we decrease the number of cars on the roads and protect the environment on the journey from ${route.from} to ${route.to}.`
                    }
                </p>
            </div>
        </div>
      </div>
    </div>
  );
}
