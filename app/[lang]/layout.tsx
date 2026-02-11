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
      console.log(`generateMetadata: Title for ${lang}: ${title}`);
  return {
    title: {
      absolute: title,
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

  return (
    <Providers>
      <ClientLayout lang={lang || "es"}>
        {children}
      </ClientLayout>
    </Providers>
  );
}
