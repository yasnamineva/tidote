import { CategoryPage } from "@/components/category-page";

export const metadata = {
  title: "Sports — Tidote Atelier",
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
