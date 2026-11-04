"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslation } from "@/app/hooks/useTranslation";
import { langPrefix } from "@/app/lib/i18n/config";
import type { PublicProfile } from "@/app/lib/api/users";
import Avatar from "@/app/components/Avatar";
import VerifiedBadges, { ExperienceBadge } from "@/app/components/VerifiedBadges";

export default function PublicProfileView({ profile }: { profile: PublicProfile }) {
  const { t } = useTranslation();
  const lang = (useParams()?.lang as string) || "fi";
  const since = new Date(profile.member_since).toLocaleDateString(lang, { month: "long", year: "numeric" });
  const stats = [
    { label: t("profile.stats.rating", "Rating"), value: profile.total_reviews ? `★ ${Number(profile.average_rating).toFixed(1)}` : "–" },
    { label: t("profile.stats.reviews", "Reviews"), value: profile.total_reviews },
    { label: t("profile.stats.driven", "Rides driven"), value: profile.trips_driven },
    { label: t("profile.stats.taken", "Rides taken"), value: profile.rides_taken },
  ];

  return (
    <div className="min-h-screen bg-[var(--page-bg)]">
      <section className="border-b-2 border-[#c4d8b4] bg-[#ebf3e2] px-4 py-8">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-4 text-center md:flex-row md:text-left">
          <Avatar name={profile.name} url={profile.picture_url} size={96} />
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-[var(--brand-dark)] md:text-3xl">{profile.name}</h1>
            <p className="text-sm text-[var(--brand-neutral)]">
              {t("profile.memberSince", "Member since")} {since}
            </p>
            <div className="mt-2 flex flex-wrap justify-center gap-1.5 md:justify-start">
              <ExperienceBadge level={profile.experience_level} />
              <VerifiedBadges verifications={profile.verifications} showMissing />
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-8">
        <div className="mx-auto max-w-4xl space-y-6">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="rounded-2xl border-2 border-[#c4d8b4] bg-white p-4 text-center">
                <p className="text-2xl font-black text-[var(--brand-dark)]">{s.value}</p>
                <p className="text-xs font-bold uppercase tracking-wide text-[var(--brand-neutral)]">{s.label}</p>
              </div>
            ))}
          </div>

          {profile.bio && (
            <div className="rounded-2xl border-2 border-[#c4d8b4] bg-white p-5">
              <h2 className="mb-2 font-bold text-[var(--brand-dark)]">{t("profile.about", "About")}</h2>
              <p className="whitespace-pre-line text-[var(--brand-neutral)]">{profile.bio}</p>
            </div>
          )}

          <div className="rounded-2xl border-2 border-[#c4d8b4] bg-white p-5">
            <h2 className="mb-3 font-bold text-[var(--brand-dark)]">{t("profile.upcoming", "Upcoming rides")}</h2>
            {profile.upcoming_trips.length === 0 ? (
              <p className="text-sm text-[var(--brand-neutral)]">{t("profile.noUpcoming", "No upcoming rides right now.")}</p>
            ) : (
              <ul className="divide-y divide-[#e3eed9]">
                {profile.upcoming_trips.map((trip) => (
                  <li key={trip.id}>
                    <Link href={`${langPrefix(lang)}/trips/${trip.id}`} className="flex items-center justify-between gap-3 py-3 hover:text-[var(--brand-blue)]">
                      <span>
                        <span className="font-semibold text-[var(--brand-dark)]">
                          {trip.departure_location} → {trip.arrival_location}
                        </span>
                        {trip.stops.length > 0 && (
                          <span className="block text-xs text-[var(--brand-neutral)]">
                            {t("stops.via", "via")} {trip.stops.map((s) => s.location).join(", ")}
                          </span>
                        )}
                        <span className="block text-sm text-[var(--brand-neutral)]">
                          {new Date(trip.departure_time).toLocaleString(lang, { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </span>
                      <span className="font-black text-[var(--brand-dark)]">{Number(trip.price).toFixed(0)} €</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-2xl border-2 border-[#c4d8b4] bg-white p-5">
            <h2 className="mb-3 font-bold text-[var(--brand-dark)]">{t("profile.latestReviews", "Latest reviews")}</h2>
            {profile.reviews.length === 0 ? (
              <p className="text-sm text-[var(--brand-neutral)]">{t("profile.noReviews", "No reviews yet")}</p>
            ) : (
              <ul className="space-y-4">
                {profile.reviews.map((r) => (
                  <li key={r.id} className="border-l-4 border-[#c4d8b4] pl-3">
                    <p className="text-sm font-bold text-[var(--brand-dark)]">
                      {"★".repeat(r.rating)}
                      <span className="text-[#c4d8b4]">{"★".repeat(5 - r.rating)}</span> · {r.reviewer.name}
                    </p>
                    {r.comment && <p className="text-[var(--brand-neutral)]">{r.comment}</p>}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
