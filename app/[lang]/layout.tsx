import { Providers } from "@/app/components/Providers";
import { ClientLayout } from "@/app/components/ClientLayout";
import type { Metadata } from 'next';
import { promises as fs } from 'fs'; // Import fs
import path from 'path'; // Import path

// Function to dynamically generate metadata for the page
export async function generateMetadata({ params: paramsPromise }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const params = await paramsPromise; // Await the params here
  const lang = params.lang || "es";      console.log(`generateMetadata: Detected lang: ${lang}`);
      let translations;
      try {
          // Construct the path to the common.json file
          const filePath = path.join(process.cwd(), 'public', 'locales', lang, 'common.json');
          console.log(`generateMetadata: Attempting to read file: ${filePath}`);
          const fileContent = await fs.readFile(filePath, 'utf8');
          translations = JSON.parse(fileContent);
          console.log(`generateMetadata: Successfully loaded translations for ${lang}`);
      } catch (error) {
          console.error(`generateMetadata: Error loading translations for ${lang} using fs:`, error);
          // Fallback to Spanish if translation file is not found
          const fallbackFilePath = path.join(process.cwd(), 'public', 'locales', 'es', 'common.json');
          console.log(`generateMetadata: Falling back to Spanish: ${fallbackFilePath}`);
          const fallbackFileContent = await fs.readFile(fallbackFilePath, 'utf8');
          translations = JSON.parse(fallbackFileContent);
      }
  
      const title = translations.page.title;
      const description = translations.footer.description; // Get description
      console.log(`generateMetadata: Title for ${lang}: ${title}`);

      const SUPPORTED_LANGS = ['es', 'en', 'fi'];
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://jombo.com'; // Use a placeholder if not defined

      const languages: { [key: string]: string } = {
        'x-default': `${baseUrl}/es`, // Default to Spanish
      };
      SUPPORTED_LANGS.forEach(supportedLang => {
        languages[supportedLang] = `${baseUrl}/${supportedLang}`;
      });

  return {
    title: {
      absolute: title,
    },
    description: description, // Add description
    alternates: {
      canonical: `${baseUrl}/${lang}`, // Canonical for the current language root
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
  const currentLang = lang || "es";

  return (
    <Providers lang={currentLang}>
      <ClientLayout lang={currentLang}>
        {children}
      </ClientLayout>
    </Providers>
  );
}
