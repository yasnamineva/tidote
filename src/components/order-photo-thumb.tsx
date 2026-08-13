"use client";

import { useLang } from "@/lib/i18n";

/**
 * The reference photo an order row leads with. Square and large enough to
 * actually read the garment; extra photos collapse into a count badge.
 */
export function OrderPhotoThumb({
  photos,
  label,
  size = "md",
}: {
  photos: string[];
  label: string;
  size?: "sm" | "md";
}) {
  const { t } = useLang();
  const box =
    size === "sm" ? "h-16 w-16" : "h-20 w-20 sm:h-24 sm:w-24";
  return (
    <div className={`relative shrink-0 ${box}`}>
      {photos.length > 0 ? (
        // eslint-disable-next-line @next/next/no-img-element -- uploaded photos may be data: URLs, which next/image can't optimize
        <img
          src={photos[0]}
          alt={label}
          className="h-full w-full object-cover border border-line"
        />
      ) : (
        <div className="h-full w-full border border-line bg-line/30 flex items-center justify-center text-center text-[9px] leading-tight text-ink-soft px-1">
          {t("thumb.noPhoto")}
        </div>
      )}
      {photos.length > 1 && (
        <span className="absolute -bottom-2 -right-2 rounded-full bg-ink text-cream text-[10px] leading-none px-1.5 py-1 tabular-nums">
          +{photos.length - 1}
        </span>
      )}
    </div>
  );
}
