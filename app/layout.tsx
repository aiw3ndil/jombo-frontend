import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { headers } from "next/headers";
import { GoogleAnalytics } from "./components/GoogleAnalytics";
import { OrganizationSchema, WebSiteSchema } from "./components/StructuredData";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: 'swap',
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: 'swap',
  preload: true,
});

export const metadata: Metadata = {
  title: {
    default: "Jombo - Comparte Viaje Gratis | Carpooling Sin Comisiones",
    template: "%s | Jombo"
  },
  description: "Plataforma gratuita de carpooling. Comparte viaje con personas que van a tu destino. 100% gratis, sin comisiones. Ahorra dinero y ayuda al medio ambiente.",
  keywords: ["carpooling", "compartir viaje", "viaje compartido", "ahorro", "transporte", "blablacar alternativa", "gratis", "sin comisiones"],
  authors: [{ name: "Jombo" }],
  creator: "Jombo",
  publisher: "Jombo",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://www.jombo.es'),
  alternates: {
    canonical: '/',
    languages: {
      'es': '/es',
      'en': '/en',
      'fi': '/fi',
    },
  },
  openGraph: {
    title: "Jombo - Comparte Viaje Gratis",
    description: "Plataforma gratuita de carpooling. Ahorra dinero compartiendo viaje. Sin comisiones.",
    url: 'https://www.jombo.es',
    siteName: 'Jombo',
    locale: 'es_ES',
    type: 'website',
    images: [
      {
        url: '/images/jombo-logo.svg',
        width: 1200,
        height: 630,
        alt: 'Jombo - Carpooling',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Jombo - Comparte Viaje Gratis',
    description: 'Plataforma gratuita de carpooling. Ahorra dinero compartiendo viaje.',
    images: ['/images/jombo-logo.svg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";
  const lang = pathname.split("/")[1] || "es";

  return (
    <html lang={["en", "es", "fi"].includes(lang) ? lang : "es"}>
      <head>
        <OrganizationSchema />
        <WebSiteSchema />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-gray-50 text-gray-900`}
      >
        <GoogleAnalytics />
        {children}
      </body>
    </html>
  );
}
