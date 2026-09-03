"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { isPubliclyCacheable, resolvePhotoUrls } from "@/lib/photos";

/**
 * A stored photo reference is not a URL — a private one has to be signed first,
 * and signing is a network call. So every place that used to render
 * `<img src={ref}>` renders this instead, and the resolution happens once, in
 * one place, rather than being remembered at eight separate call sites.
 */
export function usePhotoUrls(refs: string[]): string[] {
  const [urls, setUrls] = useState<string[]>([]);
  const key = refs.join("|");

  useEffect(() => {
    let cancelled = false;
    if (refs.length === 0) {
      setUrls([]);
      return;
    }
    resolvePhotoUrls(refs)
      .then((resolved) => {
        if (!cancelled) setUrls(resolved);
      })
      .catch(() => {
        if (!cancelled) setUrls([]);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return urls;
}

export function usePhotoUrl(ref: string | undefined): string {
  return usePhotoUrls(ref ? [ref] : [])[0] ?? "";
}

/**
 * Renders a stored reference. Holds the layout with a neutral block while the
 * signed URL is in flight, so a grid of photos does not jump as they arrive.
 *
 * Pass `cdn` on a rail photo. It routes the image through next/image, so Vercel
 * fetches it from Supabase once and serves every visitor after that from its own
 * cache — the difference between Supabase sending the same file ten thousand
 * times and sending it once, which is what the free plan's egress allowance
 * turns on.
 *
 * It is opt-in rather than automatic for two reasons. `fill` needs a positioned
 * parent of a known shape, which only the card grids have. And a client's own
 * photos must never take this path whatever a caller asks for: they are private,
 * reached through URLs that expire, and a shared image cache is the wrong place
 * for them — hence the second condition below.
 */
export function Photo({
  src,
  alt,
  className = "",
  cdn = false,
  sizes = "(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw",
  priority = false,
}: {
  src: string | undefined;
  alt: string;
  className?: string;
  /** Serve through Vercel's image CDN. Only valid inside a `relative` parent. */
  cdn?: boolean;
  /** Widths the browser picks from; set it to match the grid. */
  sizes?: string;
  priority?: boolean;
}) {
  const url = usePhotoUrl(src);
  if (!url) return <span className={`block bg-line/20 ${className}`} />;

  if (cdn && isPubliclyCacheable(src)) {
    return (
      <Image
        src={url}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className={className}
      />
    );
  }

  // Signed, private, and deliberately kept out of a shared image cache.
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={url} alt={alt} className={className} />;
}
