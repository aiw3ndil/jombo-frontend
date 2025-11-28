import { Providers } from "@/app/components/Providers";
import { ClientLayout } from "@/app/components/ClientLayout";

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
