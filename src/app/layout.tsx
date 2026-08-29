import type { Metadata, Viewport } from "next";
import { Cousine, Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/lib/i18n";
import { AuthProvider } from "@/lib/auth";
import { NotificationProvider } from "@/lib/notifications";
import { BookingProvider } from "@/lib/booking";
import { SmoothScrollProvider } from "@/lib/smooth-scroll";
import { LANG_KEY } from "@/lib/translations";
import { Analytics } from "@vercel/analytics/next";
import { structuredDataJson } from "@/lib/structured-data";

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

// Every page is prerendered, so the server cannot know who is asking and the
// markup ships with lang="en". This snippet runs synchronously while the
// browser parses <head>, correcting the attribute before the first paint —
// assistive tech, translation prompts, and crawlers that execute JS all read
// it well before React hydrates and LanguageProvider takes over.
//
// Resolution order mirrors getStoredLang() in lib/translations.ts: an explicit
// choice, then the browser's own languages, then English. Keep them in step.
const LANG_BOOTSTRAP = `(function(){try{var s=localStorage.getItem(${JSON.stringify(
  LANG_KEY,
)});var n=navigator.languages&&navigator.languages.length?navigator.languages:[navigator.language];var l=s==="bg"||s==="en"?s:n.some(function(t){return t&&t.toLowerCase().indexOf("bg")===0})?"bg":"en";document.documentElement.lang=l}catch(e){}})()`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      // LANG_BOOTSTRAP rewrites `lang` before hydration; without this React
      // treats the corrected DOM as a mismatch and re-renders from the root.
      suppressHydrationWarning
      className={`${typewriter.variable} ${brand.variable} ${inter.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: LANG_BOOTSTRAP }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: structuredDataJson() }}
        />
      </head>
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
        {/* Cookieless, so the site needs no consent banner under GDPR. */}
        <Analytics />
      </body>
    </html>
  );
}
