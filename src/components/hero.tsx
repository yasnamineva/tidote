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
        {/* The proposition first, in plain words: a stranger should know what
            this place makes before it shows them any personality. The tagline
            keeps the voice, one line below. */}
        <Reveal delay={200}>
          <p className="mx-auto mt-6 max-w-sm text-base font-medium leading-snug text-ink md:mt-8 md:max-w-xl md:text-xl">
            {t("hero.prop")}
          </p>
          <p className="mx-auto mt-3 max-w-xs text-sm leading-relaxed text-ink-soft sm:max-w-sm md:max-w-md md:text-base">
            {t("hero.propSub")}
          </p>
        </Reveal>
        {/* Both of these are places to look, not forms to fill. Nothing on the
            first screen asks for an account any more. */}
        <Reveal delay={300}>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:gap-4 md:mt-10">
            <Link
              href="/#choose"
              className="btn-sweep btn-sweep-moss inline-block border border-ink bg-ink px-8 py-3.5 text-xs uppercase tracking-[0.25em] text-cream transition-colors duration-300 md:text-sm"
            >
              {t("cta.explore")}
            </Link>
            <Link
              href="/in-stock"
              className="btn-sweep inline-block border border-ink px-8 py-3.5 text-xs uppercase tracking-[0.25em] text-ink transition-colors duration-300 hover:text-cream md:text-sm"
            >
              {t("cta.shopInStock")}
            </Link>
          </div>
          <p className="mt-4 text-xs text-ink-soft/75">{t("cta.browseFree")}</p>
        </Reveal>
      </div>

      <div className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 text-[10px] uppercase tracking-[0.3em] text-ink-soft/60 animate-pulse">
        {t("hero.scroll")}
      </div>
    </section>
  );
}
