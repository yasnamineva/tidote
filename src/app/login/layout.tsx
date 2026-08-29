import type { Metadata } from "next";

// Kept out of search results; robots.ts disallows the prefix too.
export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
