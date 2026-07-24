import { CategoryPage } from "@/components/category-page";

export const metadata = {
  title: "Sports — Tidote Atelier",
};

export default function SportsPage() {
  return (
    <CategoryPage
      eyebrow="Sports"
      title="ATELIER TRAINING"
      blurb="Track jackets, windbreakers, and technical fits — athletic silhouettes reworked with the same made-to-measure precision as everything else in the atelier."
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
