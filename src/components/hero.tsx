"use client";

import Link from "next/link";
import { PlaceholderImage } from "@/components/placeholder-image";
import { Reveal } from "@/components/reveal";
import { Wordmark } from "@/components/wordmark";
import { useLang } from "@/lib/i18n";

const HERO_IMAGES = ["/photos/hero-1.jpg", "/photos/hero-2.jpg", "/photos/hero-3.jpg"];

/**
 * The name is not boxed and not reversed out — it sits on the page, and the
 * photography is washed back far enough to give it somewhere to sit.
 *
 * Two earlier attempts got this wrong in opposite directions. Set straight onto
 * the pictures, a moss-green wordmark over bright mid-tone photographs was
 * near invisible. Put on a cream plaque, it was legible and looked like a
 * notice taped over the artwork.
 *
 * So: a cream veil, heaviest at the top where the type lives and clearing as
 * it falls, and the outer frames softened so the eye is carried to the middle.
 * The brand colours then read as themselves, at full strength, on quiet ground.
 */
export function Hero() {
  const { t } = useLang();
  return (
    <section className="relative h-[92vh] min-h-[600px] w-full overflow-hidden bg-cream">
      <div className="absolute inset-0 grid grid-cols-1 md:grid-cols-3">
        {HERO_IMAGES.map((src, i) => (
          <PlaceholderImage
            key={src}
            label="Tidote streetwear look"
            src={src}
            priority={i === 0}
            index={i}
            /* The middle frame stays sharp; the outer two are softened, which
               is what keeps the centre of the page calm enough to read. */
            className={`h-full w-full ${i === 0 ? "" : "hidden md:block"} ${
              i === 1 ? "" : "md:blur-[3px] md:scale-[1.04]"
            }`}
          />
        ))}
      </div>

      {/* The veil. Opaque where the name is, almost gone at the hem. */}
      <div className="absolute inset-0 bg-gradient-to-b from-cream via-cream/85 to-cream/30" />
      {/* A second, sideways pass: the edges fade further so the strip reads as
          one photograph rather than three tiles butted together. */}
      <div className="absolute inset-0 bg-gradient-to-r from-cream/70 via-transparent to-cream/70" />

      <div className="relative z-10 flex h-full flex-col items-center px-6 pt-[13vh] text-center md:pt-[15vh]">
        <Reveal>
          <p className="mb-4 text-[10px] uppercase tracking-[0.45em] text-ink-soft/70 md:text-xs">
            {t("header.tagline")}
          </p>
        </Reveal>
        <Reveal delay={100}>
          <Wordmark size="hero" stacked className="items-center" />
        </Reveal>
        <Reveal delay={200}>
          <p className="mx-auto mt-6 max-w-xs text-sm leading-relaxed text-ink-soft sm:max-w-sm md:mt-8 md:max-w-md md:text-base">
            {t("hero.tagline")}
          </p>
        </Reveal>
        <Reveal delay={300}>
          <Link
            href="/login"
            className="btn-sweep btn-sweep-moss mt-8 inline-block border border-ink px-8 py-3.5 text-xs uppercase tracking-[0.25em] text-ink transition-colors duration-300 hover:text-cream md:mt-10 md:text-sm"
          >
            {t("hero.cta")}
          </Link>
        </Reveal>
      </div>

      <div className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 text-[10px] uppercase tracking-[0.3em] text-ink-soft/60 animate-pulse">
        {t("hero.scroll")}
      </div>
    </section>
  );
}
