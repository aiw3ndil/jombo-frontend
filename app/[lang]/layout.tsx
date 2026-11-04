import { ClientLayout } from "@/app/components/ClientLayout";
import { GoogleOAuthProvider } from '@react-oauth/google';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { promises as fs } from 'fs';
import path from 'path';
import { SITE_URL, SUPPORTED_LANGS, DEFAULT_LANG, localePath } from '@/app/lib/i18n/config';

const absoluteUrl = (lang: string) => `${SITE_URL}${localePath(lang) === '/' ? '' : localePath(lang)}`;

// Function to dynamically generate metadata for the page
export async function generateMetadata({ params: paramsPromise }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const params = await paramsPromise;
  const lang = (SUPPORTED_LANGS as readonly string[]).includes(params.lang) ? params.lang : DEFAULT_LANG;

  let translations;
  try {
    const filePath = path.join(process.cwd(), 'public', 'locales', lang, 'common.json');
    translations = JSON.parse(await fs.readFile(filePath, 'utf8'));
  } catch (error) {
    console.error(`generateMetadata: Error loading translations for ${lang}:`, error);
    // Fallback to Finnish if translation file is not found
    const fallbackFilePath = path.join(process.cwd(), 'public', 'locales', DEFAULT_LANG, 'common.json');
    translations = JSON.parse(await fs.readFile(fallbackFilePath, 'utf8'));
  }

  const languages: { [key: string]: string } = {
    'x-default': absoluteUrl(DEFAULT_LANG),
  };
  SUPPORTED_LANGS.forEach(supportedLang => {
    languages[supportedLang] = absoluteUrl(supportedLang);
  });

  return {
    title: {
      absolute: translations.page.title,
    },
    description: translations.page.description,
    alternates: {
      canonical: absoluteUrl(lang),
      languages,
    },
  };
}

export default async function LangLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!(SUPPORTED_LANGS as readonly string[]).includes(lang)) {
    notFound();
  }
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <ClientLayout lang={lang}>
        {children}
      </ClientLayout>
    </GoogleOAuthProvider>
  );
}
