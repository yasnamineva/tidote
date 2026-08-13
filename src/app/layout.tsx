import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "Tidote Atelier",
  description:
    "The anTIDOTE to mediocrity — unique streetstyle to match your main character energy.",
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
