"use client";

import Image from "next/image";
import { useState } from "react";

const TONES = [
  "from-ink to-ink-soft",
  "from-moss-deep to-ink",
  "from-[#3a342c] to-[#221e19]",
];

export function PlaceholderImage({
  label,
  index = 0,
  className = "",
  src,
  priority = false,
}: {
  label: string;
  index?: number;
  className?: string;
  src?: string;
  priority?: boolean;
}) {
  const tone = TONES[index % TONES.length];
  const [loaded, setLoaded] = useState(false);

  if (src) {
    return (
      <div className={`group relative overflow-hidden bg-paper ${className}`}>
        <div
          className={`absolute inset-0 shimmer transition-opacity duration-500 ${
            loaded ? "opacity-0" : "opacity-100"
          }`}
        />
        <Image
          src={src}
          alt={label}
          fill
          priority={priority}
          sizes="(min-width: 768px) 50vw, 100vw"
          onLoad={() => setLoaded(true)}
          className={`object-cover transition-all duration-700 ease-out group-hover:scale-105 ${
            loaded ? "opacity-100 scale-100" : "opacity-0 scale-105"
          }`}
        />
        <div className="absolute inset-0 border border-cream/10 transition-colors duration-500 group-hover:border-moss/40" />
      </div>
    );
  }

  return (
    <div
      className={`group relative overflow-hidden bg-gradient-to-br ${tone} ${className}`}
    >
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-cream/70 transition-transform duration-500 ease-out group-hover:scale-110">
        <span className="font-display text-3xl tracking-wide">T.</span>
        <span className="text-[10px] uppercase tracking-[0.25em] text-center px-4">
          {label}
        </span>
      </div>
      <div className="absolute inset-0 border border-cream/10 transition-colors duration-500 group-hover:border-moss/40" />
    </div>
  );
}
