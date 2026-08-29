import type { Metadata } from "next";
import { CategoryPage } from "@/components/category-page";

export const metadata: Metadata = {
  title: "Casual",
  description:
    "Made-to-measure casual and everyday pieces, cut to your measurements at Tidote Atelier.",
  alternates: { canonical: "/casual" },
  openGraph: {
    title: "Casual — Tidote Atelier",
    description:
      "Made-to-measure casual and everyday pieces, cut to your measurements at Tidote Atelier.",
    url: "/casual",
    images: "/opengraph-image",
  },
};

export default function CasualPage() {
  return (
    <CategoryPage
      categoryKey="casual"
      heroSrc="/photos/casual-hero.jpg"
      photos={[
        "/photos/casual-1.jpg",
        "/photos/casual-2.jpg",
        "/photos/casual-3.jpg",
        "/photos/casual-4.jpg",
        "/photos/casual-5.jpg",
        "/photos/casual-6.jpg",
        "/photos/casual-7.jpg",
      ]}
    />
  );
}
