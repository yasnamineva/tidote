"use client";

import Link from "next/link";
import { PlaceholderImage } from "@/components/placeholder-image";
import { Reveal } from "@/components/reveal";
import { Wordmark } from "@/components/wordmark";
import { useLang } from "@/lib/i18n";

const HERO_IMAGES = ["/photos/hero-1.jpg", "/photos/hero-2.jpg", "/photos/hero-3.jpg"];

export function Hero() {
  const { t } = useLang();
  return (
    <section className="relative h-[88vh] min-h-[560px] w-full overflow-hidden bg-ink">
      {/* Image strip: single on mobile, three-up on desktop */}
      <div className="absolute inset-0 grid grid-cols-1 md:grid-cols-3">
        {HERO_IMAGES.map((src, i) => (
          <PlaceholderImage
            key={src}
            label="Tidote streetwear look"
            src={src}
            priority={i === 0}
            index={i}
            className={`h-full w-full ${i === 0 ? "" : "hidden md:block"}`}
          />
        ))}
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/40 to-ink/40" />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
        <Reveal>
          <Wordmark
            size="hero"
            stacked
            className="items-center text-cream [&_span:last-child]:text-cream/70"
          />
        </Reveal>
        <Reveal delay={150}>
          <p className="mt-6 max-w-md text-cream/80 text-base md:text-lg">
            {t("hero.tagline")}
          </p>
        </Reveal>
        <Reveal delay={300}>
          <Link
            href="/login"
            className="btn-sweep mt-8 inline-block bg-cream text-ink px-8 py-3.5 text-sm uppercase tracking-[0.2em] transition-transform duration-300 hover:-translate-y-0.5"
          >
            {t("hero.cta")}
          </Link>
        </Reveal>
      </div>

      {/* Scroll cue */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 text-cream/60 text-[10px] uppercase tracking-[0.3em] animate-pulse">
        {t("hero.scroll")}
      </div>
    </section>
  );
}
