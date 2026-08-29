import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/admin-shell";

// Studio-only. Kept out of search results; robots.ts disallows the prefix too.
export const metadata: Metadata = {
  title: "Studio",
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminShell>{children}</AdminShell>;
}
