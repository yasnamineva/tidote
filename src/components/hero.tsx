"use client";

import Link from "next/link";
import { HangTag } from "@/components/hang-tag";
import { PlaceholderImage } from "@/components/placeholder-image";
import { Reveal } from "@/components/reveal";
import { useLang } from "@/lib/i18n";

/** One photograph, full width: a rail of finished clothes, tags and all. */
const HERO_IMAGE = "/photos/hero-rail.jpg";

/**
 * The name arrives on the atelier's own swing tag, dropped in on its cord.
 *
 * Three earlier attempts put it as type on the page and each failed in its own
 * way: moss-green letters straight onto bright photographs were near
 * invisible, the same letters on a cream plaque looked like a notice taped
 * over the artwork, and a veil over the whole strip solved the legibility
 * without giving the name any reason to be where it was.
 *
 * A hang tag answers all of it at once. It is opaque, so the name is legible
 * whatever is behind it; it belongs in front of clothing, so it is not
 * covering the photograph so much as hanging in front of it; and it is a real
 * object of the studio's, not a graphic device.
 *
 * Behind it, one photograph rather than three tiles, under one even fade. The
 * words used to sit on a pool of cream of their own, which read as a white
 * shape laid over the picture — the thing it was there to avoid. A single veil
 * across the whole frame lifts the dark parts of the photograph far enough for
 * ink to be read anywhere on it, and leaves the picture looking like a
 * picture.
 *
 * The tag takes the left, the words the right; on a phone the tag comes first
 * and the words follow underneath.
 */
export function Hero() {
  const { t } = useLang();
  return (
    <section className="relative w-full overflow-hidden bg-cream">
      <div className="absolute inset-0">
        <PlaceholderImage
          label="A rail of finished Tidote pieces"
          src={HERO_IMAGE}
          priority
          sizes="100vw"
          zoomOnHover={false}
          className="h-full w-full"
        />
      </div>

      {/* One fade over the whole photograph. Even enough that ink is readable
          wherever it falls, light enough that the rail is still a rail. */}
      <div className="absolute inset-0 bg-cream/62" />
      <div className="absolute inset-0 bg-gradient-to-b from-cream/45 via-transparent to-cream/35" />

      {/* Two columns only once there is room for both; at 768 the tag and a
          paragraph side by side squeezed each other, and stacked reads better. */}
      <div className="relative z-10 mx-auto grid min-h-[88vh] max-w-7xl grid-cols-1 items-center gap-8 px-6 pb-14 md:min-h-[92vh] lg:grid-cols-[auto_1fr] lg:items-start lg:gap-20">
        {/* The cord starts at the top edge of the section — it comes from above
            the fold, the way a tag hangs from something out of frame. */}
        <div className="flex justify-center lg:justify-start">
          <HangTag />
        </div>

        <div className="relative text-center lg:pt-[32vh] lg:text-left">
          <Reveal>
            <h1 className="mx-auto max-w-md text-xl font-medium leading-snug text-ink md:max-w-xl md:text-3xl lg:mx-0 lg:text-4xl">
              {t("hero.prop")}
            </h1>
          </Reveal>
          <Reveal delay={100}>
            <p className="mx-auto mt-4 max-w-sm text-sm leading-relaxed text-ink-soft md:mt-5 md:max-w-md md:text-base lg:mx-0">
              {t("hero.propSub")}
            </p>
          </Reveal>
          {/* Both of these are places to look, not forms to fill. Nothing on
              the first screen asks for an account. */}
          <Reveal delay={200}>
            <div className="mt-7 flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-4 md:mt-9 lg:justify-start">
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
            <p className="mt-4 text-xs text-ink-soft">{t("cta.browseFree")}</p>
          </Reveal>
        </div>
      </div>

      <div className="absolute bottom-5 left-1/2 z-10 -translate-x-1/2 text-[10px] uppercase tracking-[0.3em] text-ink-soft/60 animate-pulse">
        {t("hero.scroll")}
      </div>
    </section>
  );
}
