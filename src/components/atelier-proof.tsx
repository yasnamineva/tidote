"use client";

import { PlaceholderImage } from "@/components/placeholder-image";
import { Reveal } from "@/components/reveal";
import { SplitReveal } from "@/components/split-reveal";
import { useLang } from "@/lib/i18n";
import { ATELIER_SHOTS, hasAtelierShots } from "@/lib/atelier";

/**
 * Four specifics about how the clothes are made, and photographs of it
 * happening.
 *
 * The facts are all checkable — where the atelier is, that the cutting and
 * sewing happen there, that a commission is one garment, that the fitting is
 * in person — which is why they are worth more than another paragraph saying
 * "crafted with care". The photographs are the real proof, and until there are
 * real ones the grid is simply not there; see `lib/atelier.ts`.
 */

const FACTS = ["sofia", "inHouse", "oneOff", "fitting"] as const;

export function AtelierFacts() {
  const { t } = useLang();
  return (
    <ul className="mt-8 grid gap-x-8 gap-y-4 sm:grid-cols-2">
      {FACTS.map((k) => (
        <li key={k} className="min-w-0">
          <p className="text-xs uppercase tracking-[0.15em] text-moss-deep">
            {t(`proof.${k}.title`)}
          </p>
          <p className="mt-1 text-sm text-ink-soft break-words">
            {t(`proof.${k}.copy`)}
          </p>
        </li>
      ))}
    </ul>
  );
}

export function AtelierShots() {
  const { t, lang } = useLang();
  // No invented studio. An empty grid is better than someone else's workshop.
  if (!hasAtelierShots()) return null;

  return (
    <section className="relative border-b border-line overflow-hidden bg-paper">
      <div className="relative z-10 mx-auto max-w-7xl px-6 py-16 md:py-20">
        <Reveal className="mb-8 max-w-xl">
          <p className="text-xs uppercase tracking-[0.3em] text-moss-deep mb-2">
            {t("proof.eyebrow")}
          </p>
          <h2 className="font-display text-2xl md:text-3xl">
            <SplitReveal text={t("proof.title")} />
          </h2>
        </Reveal>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {ATELIER_SHOTS.map((shot, i) => (
            <Reveal key={shot.src} delay={(i % 3) * 100}>
              <figure className="min-w-0">
                <PlaceholderImage
                  label={shot.caption.en}
                  src={shot.src}
                  index={i}
                  className="aspect-[4/5] w-full"
                />
                <figcaption className="mt-2 text-xs text-ink-soft break-words">
                  {shot.caption[lang]}
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
