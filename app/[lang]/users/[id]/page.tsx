import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublicProfile } from "@/app/lib/api/users";
import { langPrefix } from "@/app/lib/i18n/config";
import PublicProfileView from "@/app/components/PublicProfileView";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ lang: string; id: string }> };

async function load(id: string) {
  try {
    return await getPublicProfile(id);
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, id } = await params;
  const profile = await load(id);
  if (!profile) return { title: "Jombo" };
  return {
    title: lang === "fi" ? `${profile.name} – profiili | Jombo` : `${profile.name} – profile | Jombo`,
    description: profile.bio?.slice(0, 150) || undefined,
    alternates: { canonical: `${langPrefix(lang)}/users/${id}` },
    robots: { index: false },
  };
}

export default async function UserProfilePage({ params }: Props) {
  const { id } = await params;
  const profile = await load(id);
  if (!profile) notFound();
  return <PublicProfileView profile={profile} />;
}
