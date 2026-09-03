import type { Metadata } from "next";
import { InStockPage } from "@/components/in-stock-page";

export const metadata: Metadata = {
  title: "In Stock",
  description:
    "Finished pieces ready to take home today — one of each, cut and sewn at Tidote Atelier in Sofia.",
  alternates: { canonical: "/in-stock" },
  openGraph: {
    title: "In Stock — Tidote Atelier",
    description:
      "Finished pieces ready to take home today — one of each, cut and sewn at Tidote Atelier in Sofia.",
    url: "/in-stock",
    images: "/opengraph-image",
  },
};

export default function Page() {
  return <InStockPage />;
}
