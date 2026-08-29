import type { Metadata } from "next";
import localFont from "next/font/local";
import { headers } from "next/headers";
import { GoogleAnalytics } from "./components/GoogleAnalytics";
import { OrganizationSchema, WebSiteSchema } from "./components/StructuredData";
import GoogleOAuthWrapper from "./components/GoogleOAuthWrapper";
import CookieConsent from "./components/CookieConsent";
import { Toaster } from "sonner";
import "./globals.css";

const ubuntu = localFont({
  src: [
    { path: "../public/fonts/Ubuntu-Light.ttf", weight: "300", style: "normal" },
    { path: "../public/fonts/Ubuntu-LightItalic.ttf", weight: "300", style: "italic" },
    { path: "../public/fonts/Ubuntu-Regular.ttf", weight: "400", style: "normal" },
    { path: "../public/fonts/Ubuntu-Italic.ttf", weight: "400", style: "italic" },
    { path: "../public/fonts/Ubuntu-Medium.ttf", weight: "500", style: "normal" },
    { path: "../public/fonts/Ubuntu-MediumItalic.ttf", weight: "500", style: "italic" },
    { path: "../public/fonts/Ubuntu-Bold.ttf", weight: "700", style: "normal" },
    { path: "../public/fonts/Ubuntu-BoldItalic.ttf", weight: "700", style: "italic" },
  ],
  variable: "--font-ubuntu",
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

import { Providers } from "./components/Providers";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";
  const lang = pathname.split("/")[1] || "es";
  const currentLang = ["en", "es", "fi"].includes(lang) ? lang : "es";

  return (
    <html lang={currentLang} className={ubuntu.variable}>
      <head>
        <OrganizationSchema />
        <WebSiteSchema />
        <link rel="icon" href="/favicon.ico" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#15803d" />
      </head>
      <body
        className={`font-sans antialiased min-h-screen bg-white text-[var(--brand-dark)]`}
      >
        <GoogleAnalytics />
        <Providers lang={currentLang}>
          <GoogleOAuthWrapper>
            {children}
            <CookieConsent />
            <Toaster richColors position="top-right" />
          </GoogleOAuthWrapper>
        </Providers>
      </body>
    </html>
  );
}
