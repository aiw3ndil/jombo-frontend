import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { headers } from "next/headers";
import { GoogleAnalytics } from "./components/GoogleAnalytics";
import { OrganizationSchema, WebSiteSchema } from "./components/StructuredData";
import GoogleOAuthWrapper from "./components/GoogleOAuthWrapper";
import CookieConsent from "./components/CookieConsent";
import { Toaster } from "sonner";
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
    default: "Jombo",
    template: "%s | Jombo"
  },
  authors: [{ name: "Jombo" }],
  creator: "Jombo",
  publisher: "Jombo",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://www.jombo.es'),
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
        <GoogleOAuthWrapper>
          {children}
          <CookieConsent />
          <Toaster richColors position="top-right" />
        </GoogleOAuthWrapper>
      </body>
    </html>
  );
}
