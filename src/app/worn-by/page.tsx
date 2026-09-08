import type { Metadata } from "next";
import { WornByPage } from "@/components/worn-by-page";

export const metadata: Metadata = {
  title: "Worn By",
  description:
    "The people who chose to have it made for them by Tidote Atelier, and let us say so.",
  alternates: { canonical: "/worn-by" },
  openGraph: {
    title: "Worn By — Tidote Atelier",
    description:
      "The people who chose to have it made for them by Tidote Atelier, and let us say so.",
    url: "/worn-by",
    images: "/opengraph-image",
  },
};

export default function Page() {
  return <WornByPage />;
}
