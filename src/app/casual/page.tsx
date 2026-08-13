import { CategoryPage } from "@/components/category-page";

export const metadata = {
  title: "Casual — Tidote Atelier",
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
