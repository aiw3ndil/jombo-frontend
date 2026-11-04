import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTrip, type Trip } from "@/app/lib/api/trips";
import { langPrefix } from "@/app/lib/i18n/config";
import TripDetail from "@/app/components/TripDetail";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ lang: string; id: string }>; searchParams: Promise<{ from?: string; to?: string }> };

async function load(id: string): Promise<Trip | null> {
  try {
    return await getTrip(id);
  } catch {
    return null;
  }
}

/** Calcula el tramo pedido (from/to en la URL) con los puntos del viaje */
function withSegment(trip: Trip, from?: string, to?: string): Trip {
  if (!from && !to) return trip;
  const points = [
    { location: trip.departure_location, time: trip.departure_time, price: 0 },
    ...(trip.stops || []).map((s) => ({ location: s.location, time: s.departure_time, price: Number(s.price_from_origin) })),
    { location: trip.arrival_location, time: null as string | null, price: Number(trip.price) },
  ];
  const match = (loc: string, q?: string) => !!q && loc.toLowerCase().includes(q.toLowerCase().trim());
  const i = from ? points.findIndex((p, k) => k < points.length - 1 && match(p.location, from)) : 0;
  if (i < 0) return trip;
  const j = to ? points.findIndex((p, k) => k > i && match(p.location, to)) : points.length - 1;
  if (j < 0 || (i === 0 && j === points.length - 1)) return trip;
  return {
    ...trip,
    segment: {
      from: points[i].location,
      to: points[j].location,
      departure_time: points[i].time || trip.departure_time,
      arrival_time: points[j].time,
      price: Math.round((points[j].price - points[i].price) * 100) / 100,
      partial: true,
    },
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, id } = await params;
  const trip = await load(id);
  if (!trip) return { title: "Jombo" };
  const date = new Date(trip.departure_time).toLocaleDateString(lang === "fi" ? "fi-FI" : "en-GB", { day: "numeric", month: "long" });
  const title =
    lang === "fi"
      ? `Kimppakyyti ${trip.departure_location} – ${trip.arrival_location}, ${date} | Jombo`
      : `Carpool ${trip.departure_location} – ${trip.arrival_location}, ${date} | Jombo`;
  return {
    title,
    description:
      lang === "fi"
        ? `${trip.driver.name} ajaa ${trip.departure_location} – ${trip.arrival_location}. ${Number(trip.price).toFixed(0)} € per paikka.`
        : `${trip.driver.name} is driving ${trip.departure_location} – ${trip.arrival_location}. ${Number(trip.price).toFixed(0)} € per seat.`,
    alternates: { canonical: `${langPrefix(lang)}/trips/${id}` },
  };
}

export default async function TripPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { from, to } = await searchParams;
  const trip = await load(id);
  if (!trip) notFound();
  return <TripDetail trip={withSegment(trip, from, to)} from={from} to={to} />;
}
