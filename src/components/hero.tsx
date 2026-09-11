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

      {/* Enough scrim to sit the panel on, and no more: the photographs are
          the reason anyone stays on this page. */}
      <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/25 to-ink/35" />

      {/* The name gets its own ground rather than competing with three
          photographs for one.
          It used to be set straight onto them — and the wordmark paints
          "TIDOTE" in moss green, which against a bright, busy, mid-tone
          picture is close to invisible. Cream behind it is the whole fix: the
          brand colours then read as themselves, at full strength, instead of
          being lightened until they survive whatever is underneath. */}
      <div className="relative z-10 flex h-full items-center justify-center px-5">
        <Reveal>
          <div className="max-w-[22rem] border border-ink/10 bg-cream/95 px-7 py-8 text-center shadow-[0_30px_80px_-40px_rgba(34,30,25,0.85)] backdrop-blur-[2px] sm:max-w-md sm:px-10 sm:py-10 md:max-w-xl lg:max-w-2xl lg:px-14 lg:py-12">
            <Wordmark size="hero" stacked className="items-center" />
            <p className="mx-auto mt-5 max-w-sm text-sm text-ink-soft md:mt-6 md:text-base lg:max-w-md lg:text-lg">
              {t("hero.tagline")}
            </p>
            <Link
              href="/login"
              className="btn-sweep btn-sweep-moss mt-7 inline-block border border-ink bg-ink px-7 py-3.5 text-xs uppercase tracking-[0.2em] text-cream transition-transform duration-300 hover:-translate-y-0.5 sm:px-8 sm:text-sm md:mt-8"
            >
              {t("hero.cta")}
            </Link>
          </div>
        </Reveal>
      </div>

      {/* Scroll cue */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 text-cream/60 text-[10px] uppercase tracking-[0.3em] animate-pulse">
        {t("hero.scroll")}
      </div>
    </section>
  );
}
