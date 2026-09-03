"use client";

import { useEffect, useState } from "react";
import { resolvePhotoUrls } from "@/lib/photos";

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
 */
export function Photo({
  src,
  alt,
  className = "",
}: {
  src: string | undefined;
  alt: string;
  className?: string;
}) {
  const url = usePhotoUrl(src);
  if (!url) return <span className={`block bg-line/20 ${className}`} />;
  // eslint-disable-next-line @next/next/no-img-element -- signed storage URLs
  return <img src={url} alt={alt} className={className} />;
}
