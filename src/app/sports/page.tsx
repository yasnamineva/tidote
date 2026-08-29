import type { Metadata } from "next";
import { CategoryPage } from "@/components/category-page";

export const metadata: Metadata = {
  title: "Sports",
  description:
    "Made-to-measure sportswear and technical pieces, cut to your measurements at Tidote Atelier.",
  alternates: { canonical: "/sports" },
  openGraph: {
    title: "Sports — Tidote Atelier",
    description:
      "Made-to-measure sportswear and technical pieces, cut to your measurements at Tidote Atelier.",
    url: "/sports",
    images: "/opengraph-image",
  },
};

export default function SportsPage() {
  return (
    <CategoryPage
      categoryKey="sports"
      heroSrc="/photos/sports-hero.jpg"
      photos={[
        "/photos/sports-1.jpg",
        "/photos/sports-2.jpg",
        "/photos/sports-3.jpg",
        "/photos/sports-4.jpg",
        "/photos/sports-5.jpg",
        "/photos/sports-6.jpg",
        "/photos/sports-7.jpg",
      ]}
    />
  );
}
