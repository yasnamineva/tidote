import type { Metadata, Viewport } from "next";
import { Cousine, Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/lib/i18n";
import { AuthProvider } from "@/lib/auth";
import { NotificationProvider } from "@/lib/notifications";
import { BookingProvider } from "@/lib/booking";
import { SmoothScrollProvider } from "@/lib/smooth-scroll";

// Authentic typewriter face (Courier-style slab monospace) — used for every
// headline, the wordmark, and the typed-out About animation. Full Latin +
// Cyrillic coverage, with a true bold for display sizes.
const typewriter = Cousine({
  variable: "--font-typewriter",
  weight: ["400", "700"],
  subsets: ["latin", "cyrillic"],
});

// Fancy display serif reserved for the brand name ("TIDOTE" / "Тидот").
// Latin + Cyrillic, with bold/black weights for the wordmark.
const brand = Playfair_Display({
  variable: "--font-brand",
  weight: ["700", "900"],
  subsets: ["latin", "cyrillic"],
});

// Highly readable body face (Latin + Cyrillic).
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic"],
});

const SITE_URL = "https://tidoteatelier.com";
const TAGLINE =
  "The anTIDOTE to mediocrity — unique streetstyle to match your main character energy.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  // Child segments set a bare title ("Sports"); the template adds the brand.
  title: {
    default: "Tidote Atelier — Made-to-measure streetstyle",
    template: "%s — Tidote Atelier",
  },
  description: TAGLINE,
  applicationName: "Tidote Atelier",
  keywords: [
    "Tidote Atelier",
    "made-to-measure",
    "custom clothing",
    "streetwear",
    "atelier",
    "tailoring",
    "Bulgaria",
    "ателие",
    "шивашко ателие",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "Tidote Atelier",
    title: "Tidote Atelier — Made-to-measure streetstyle",
    description: TAGLINE,
    locale: "en_US",
    alternateLocale: ["bg_BG"],
  },
  twitter: {
    card: "summary_large_image",
  },
};

export const viewport: Viewport = {
  themeColor: "#f7f4ef",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${typewriter.variable} ${brand.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-cream text-ink">
        <noscript>
          <style>{`.reveal{opacity:1 !important;transform:none !important;}`}</style>
        </noscript>
        <LanguageProvider>
          <AuthProvider>
            <NotificationProvider>
              <BookingProvider>
                <SmoothScrollProvider>{children}</SmoothScrollProvider>
              </BookingProvider>
            </NotificationProvider>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
