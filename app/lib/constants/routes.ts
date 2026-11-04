export const TOP_FINNISH_ROUTES = [
  { from: "Helsinki", to: "Tampere", slug: "helsinki-tampere", distance: "180 km", duration: "2h 10m" },
  { from: "Tampere", to: "Helsinki", slug: "tampere-helsinki", distance: "180 km", duration: "2h 10m" },
  { from: "Helsinki", to: "Turku", slug: "helsinki-turku", distance: "165 km", duration: "1h 55m" },
  { from: "Turku", to: "Helsinki", slug: "turku-helsinki", distance: "165 km", duration: "1h 55m" },
  { from: "Helsinki", to: "Oulu", slug: "helsinki-oulu", distance: "600 km", duration: "6h 30m" },
  { from: "Oulu", to: "Helsinki", slug: "oulu-helsinki", distance: "600 km", duration: "6h 30m" },
  { from: "Helsinki", to: "Jyväskylä", slug: "helsinki-jyvaskyla", distance: "270 km", duration: "3h 15m" },
  { from: "Jyväskylä", to: "Helsinki", slug: "jyvaskyla-helsinki", distance: "270 km", duration: "3h 15m" },
  { from: "Helsinki", to: "Lahti", slug: "helsinki-lahti", distance: "105 km", duration: "1h 20m" },
  { from: "Lahti", to: "Helsinki", slug: "lahti-helsinki", distance: "105 km", duration: "1h 20m" },
  { from: "Tampere", to: "Turku", slug: "tampere-turku", distance: "160 km", duration: "1h 50m" },
  { from: "Turku", to: "Tampere", slug: "turku-tampere", distance: "160 km", duration: "1h 50m" },
  { from: "Tampere", to: "Oulu", slug: "tampere-oulu", distance: "480 km", duration: "5h 20m" },
  { from: "Oulu", to: "Tampere", slug: "oulu-tampere", distance: "480 km", duration: "5h 20m" },
  { from: "Helsinki", to: "Kuopio", slug: "helsinki-kuopio", distance: "385 km", duration: "4h 30m" },
  { from: "Kuopio", to: "Helsinki", slug: "kuopio-helsinki", distance: "385 km", duration: "4h 30m" },
  { from: "Helsinki", to: "Vaasa", slug: "helsinki-vaasa", distance: "420 km", duration: "4h 45m" },
  { from: "Vaasa", to: "Helsinki", slug: "vaasa-helsinki", distance: "420 km", duration: "4h 45m" },
  { from: "Helsinki", to: "Pori", slug: "helsinki-pori", distance: "240 km", duration: "2h 55m" },
  { from: "Pori", to: "Helsinki", slug: "pori-helsinki", distance: "240 km", duration: "2h 55m" },
  { from: "Helsinki", to: "Rovaniemi", slug: "helsinki-rovaniemi", distance: "830 km", duration: "9h 30m" },
  { from: "Rovaniemi", to: "Helsinki", slug: "rovaniemi-helsinki", distance: "830 km", duration: "9h 30m" },
  { from: "Helsinki", to: "Joensuu", slug: "helsinki-joensuu", distance: "435 km", duration: "5h 0m" },
  { from: "Joensuu", to: "Helsinki", slug: "joensuu-helsinki", distance: "435 km", duration: "5h 0m" },
  { from: "Helsinki", to: "Lappeenranta", slug: "helsinki-lappeenranta", distance: "220 km", duration: "2h 30m" },
  { from: "Lappeenranta", to: "Helsinki", slug: "lappeenranta-helsinki", distance: "220 km", duration: "2h 30m" },
  { from: "Helsinki", to: "Seinäjoki", slug: "helsinki-seinajoki", distance: "350 km", duration: "4h 0m" },
  { from: "Seinäjoki", to: "Helsinki", slug: "seinajoki-helsinki", distance: "350 km", duration: "4h 0m" },
  { from: "Helsinki", to: "Kouvola", slug: "helsinki-kouvola", distance: "135 km", duration: "1h 40m" },
  { from: "Kouvola", to: "Helsinki", slug: "kouvola-helsinki", distance: "135 km", duration: "1h 40m" },
  { from: "Helsinki", to: "Hämeenlinna", slug: "helsinki-hameenlinna", distance: "100 km", duration: "1h 10m" },
  { from: "Hämeenlinna", to: "Helsinki", slug: "hameenlinna-helsinki", distance: "100 km", duration: "1h 10m" },
  { from: "Tampere", to: "Jyväskylä", slug: "tampere-jyvaskyla", distance: "150 km", duration: "1h 50m" },
  { from: "Jyväskylä", to: "Tampere", slug: "jyvaskyla-tampere", distance: "150 km", duration: "1h 50m" },
  { from: "Tampere", to: "Seinäjoki", slug: "tampere-seinajoki", distance: "180 km", duration: "2h 15m" },
  { from: "Seinäjoki", to: "Tampere", slug: "seinajoki-tampere", distance: "180 km", duration: "2h 15m" },
  { from: "Tampere", to: "Pori", slug: "tampere-pori", distance: "115 km", duration: "1h 35m" },
  { from: "Pori", to: "Tampere", slug: "pori-tampere", distance: "115 km", duration: "1h 35m" },
  { from: "Jyväskylä", to: "Kuopio", slug: "jyvaskyla-kuopio", distance: "145 km", duration: "1h 50m" },
  { from: "Kuopio", to: "Jyväskylä", slug: "kuopio-jyvaskyla", distance: "145 km", duration: "1h 50m" },
  { from: "Oulu", to: "Rovaniemi", slug: "oulu-rovaniemi", distance: "225 km", duration: "2h 40m" },
  { from: "Rovaniemi", to: "Oulu", slug: "rovaniemi-oulu", distance: "225 km", duration: "2h 40m" },
  { from: "Turku", to: "Pori", slug: "turku-pori", distance: "140 km", duration: "1h 50m" },
  { from: "Pori", to: "Turku", slug: "pori-turku", distance: "140 km", duration: "1h 50m" },
  { from: "Turku", to: "Vaasa", slug: "turku-vaasa", distance: "340 km", duration: "4h 10m" },
  { from: "Vaasa", to: "Turku", slug: "vaasa-turku", distance: "340 km", duration: "4h 10m" },
];

export type FinnishRoute = (typeof TOP_FINNISH_ROUTES)[number];

/** Rutas relacionadas: comparten origen o destino */
export function relatedRoutes(slug: string, limit = 6): FinnishRoute[] {
  const route = TOP_FINNISH_ROUTES.find((r) => r.slug === slug);
  if (!route) return [];
  return TOP_FINNISH_ROUTES.filter(
    (r) => r.slug !== slug && (r.from === route.from || r.to === route.to || r.from === route.to)
  ).slice(0, limit);
}

/** Rutas agrupadas por ciudad de origen */
export function routesByCity(): [string, FinnishRoute[]][] {
  const map = new Map<string, FinnishRoute[]>();
  for (const r of TOP_FINNISH_ROUTES) map.set(r.from, [...(map.get(r.from) || []), r]);
  return [...map.entries()].sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0], "fi"));
}
