import type { OrderCategory } from "@/lib/mock-data";

export function OrderPhotoThumb({
  photos,
  category,
  label,
}: {
  photos: string[];
  category: OrderCategory;
  label: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex -space-x-3">
        {photos.length > 0 ? (
          photos.slice(0, 3).map((src, i) => (
            // eslint-disable-next-line @next/next/no-img-element -- uploaded photos may be data: URLs, which next/image can't optimize
            <img
              key={i}
              src={src}
              alt={label}
              className="h-12 w-12 rounded-full object-cover border-2 border-paper"
              style={{ zIndex: photos.length - i }}
            />
          ))
        ) : (
          <div className="h-12 w-12 rounded-full bg-line/40 border-2 border-paper flex items-center justify-center text-[9px] text-ink-soft text-center leading-tight">
            No photo
          </div>
        )}
      </div>
      <span className="text-[10px] uppercase tracking-[0.15em] px-2.5 py-1 rounded-full bg-line/50 text-ink-soft whitespace-nowrap">
        {category}
      </span>
    </div>
  );
}
