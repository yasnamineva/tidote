import type { Metadata } from "next";

// Client portal. Kept out of search results; robots.ts disallows the prefix too.
export const metadata: Metadata = {
  title: "Your wardrobe",
  robots: { index: false, follow: false },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
