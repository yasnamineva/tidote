import type { Metadata } from "next";
import { Anton, Inter, Pirata_One, Quicksand } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth";
import { NotificationProvider } from "@/lib/notifications";
import { BookingProvider } from "@/lib/booking";
import { SmoothScrollProvider } from "@/lib/smooth-scroll";

const anton = Anton({
  variable: "--font-anton",
  weight: "400",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const pirata = Pirata_One({
  variable: "--font-pirata",
  weight: "400",
  subsets: ["latin"],
});

const quicksand = Quicksand({
  variable: "--font-quicksand",
  weight: ["500", "600"],
  subsets: ["latin"],
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
      className={`${anton.variable} ${inter.variable} ${pirata.variable} ${quicksand.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-cream text-ink">
        <noscript>
          <style>{`.reveal{opacity:1 !important;transform:none !important;}`}</style>
        </noscript>
        <AuthProvider>
          <NotificationProvider>
            <BookingProvider>
              <SmoothScrollProvider>{children}</SmoothScrollProvider>
            </BookingProvider>
          </NotificationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
