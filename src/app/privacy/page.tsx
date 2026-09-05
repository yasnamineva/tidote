import type { Metadata } from "next";
import { PrivacyPolicy } from "@/components/privacy-policy";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "What Tidote Atelier holds about you, why, who else can see it, and how to have it deleted.",
  alternates: { canonical: "/privacy" },
  openGraph: {
    title: "Privacy Policy — Tidote Atelier",
    description:
      "What Tidote Atelier holds about you, why, who else can see it, and how to have it deleted.",
    url: "/privacy",
    images: "/opengraph-image",
  },
};

export default function Page() {
  return <PrivacyPolicy />;
}
