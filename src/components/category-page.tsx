"use client";

import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PlaceholderImage } from "@/components/placeholder-image";
import { Reveal } from "@/components/reveal";
import { FramedMedia } from "@/components/framed-media";
import { ImageReveal } from "@/components/image-reveal";
import { SplitReveal } from "@/components/split-reveal";
import { FloatingShapes } from "@/components/floating-shapes";
import { useLang } from "@/lib/i18n";
import { OFFER, startingFrom } from "@/lib/offer";
import { CommissionTerms } from "@/components/commission-terms";

const INSTAGRAM_URL = "https://www.instagram.com/tidote.atelier/";

export function CategoryPage({
  categoryKey,
  heroSrc,
  photos,
}: {
  categoryKey: "casual" | "sports";
  heroSrc: string;
  photos: string[];
}) {
  const { t } = useLang();
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <section className="relative border-b border-line overflow-hidden">
          <FloatingShapes variant="warm" />
          <div className="relative z-10 mx-auto max-w-7xl px-6 py-8 md:py-12 grid gap-8 md:min-h-[68vh] md:grid-cols-[1fr_1.3fr] md:items-stretch">
            {/* On a phone the photograph goes first. The eyebrow, headline,
                blurb and button came to 454px of reading before any picture —
                more than half the screen, on a page that is a lookbook. The
                order is visual only; the h1 is still the first thing in the
                document. */}
            <Reveal className="order-2 flex flex-col justify-center md:order-1">
              <p className="text-xs uppercase tracking-[0.3em] text-moss-deep mb-4">
                {t(`cat.${categoryKey}.eyebrow`)}
              </p>
              <h1 className="font-display text-4xl md:text-6xl leading-[0.95] mb-6">
                <SplitReveal text={t(`cat.${categoryKey}.pageTitle`)} />
              </h1>
              <p className="text-ink-soft text-base md:text-lg max-w-md mb-8">
                {t(`cat.${categoryKey}.blurb`)}
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/login"
                  className="btn-sweep bg-ink text-cream px-8 py-3.5 text-sm uppercase tracking-[0.2em] transition-transform duration-300 hover:-translate-y-0.5"
                >
                  {t("cta.commission")}
                </Link>
              </div>
            </Reveal>
            {/* Tied to the row rather than to its own width: at this column
                width a 4:5 box is 820px tall, which is what left the text
                floating in an ocean of cream beside it. */}
            <div className="order-1 aspect-[4/5] md:order-2 md:aspect-auto md:h-full">
              <FramedMedia className="h-full w-full">
                <ImageReveal className="h-full w-full">
                  <PlaceholderImage
                    label="Tidote streetwear look"
                    src={heroSrc}
                    className="h-full w-full"
                  />
                </ImageReveal>
              </FramedMedia>
            </div>
          </div>
        </section>

        {/* What it is, what it costs, how long it takes. Nothing here is
            invented: each line comes from lib/offer.ts and is left out
            entirely when that value is still unset. */}
        <section className="border-b border-line bg-paper">
          <div className="mx-auto flex max-w-7xl flex-wrap gap-x-10 gap-y-3 px-6 py-5">
            {[
              t("fact.madeToMeasure"),
              startingFrom(categoryKey)
                ? t("fact.from", { price: startingFrom(categoryKey)! })
                : t("fact.quoted"),
              OFFER.lead
                ? t("fact.lead", { min: OFFER.lead.minDays, max: OFFER.lead.maxDays })
                : null,
              OFFER.fittingsIncluded
                ? t("fact.fittings", { n: OFFER.fittingsIncluded })
                : null,
              OFFER.adjustmentDays
                ? t("fact.adjust", { n: OFFER.adjustmentDays })
                : null,
            ]
              .filter((fact): fact is string => Boolean(fact))
              .map((fact) => (
                <p
                  key={fact}
                  className="text-xs uppercase tracking-[0.15em] text-ink-soft"
                >
                  {fact}
                </p>
              ))}
          </div>
        </section>

        {/* The six steps and the three questions, after the facts strip and
            before the lookbook: by here they have seen the price line and want
            to know what actually happens next. */}
        <CommissionTerms />

        <section className="relative mx-auto max-w-7xl px-6 py-16 md:py-20 overflow-hidden">
          <FloatingShapes variant="light" />
          <Reveal className="relative z-10 flex items-end justify-between mb-8">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-moss-deep mb-2">
                {t("catpage.lookbook")}
              </p>
              <h2 className="font-display text-3xl md:text-4xl">
                <SplitReveal text={t(`cat.${categoryKey}.piecesTitle`)} />
              </h2>
            </div>
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noreferrer"
              className="link-underline inline-block py-2 text-sm uppercase tracking-[0.15em] hover:text-moss-deep transition-colors whitespace-nowrap"
            >
              {t("catpage.follow")} &rarr;
            </a>
          </Reveal>
          <div className="relative z-10 grid grid-cols-2 md:grid-cols-3 gap-3">
            {photos.map((src, i) => (
              <Reveal key={src} delay={(i % 3) * 100}>
                <PlaceholderImage
                  label="Tidote streetwear look"
                  src={src}
                  index={i}
                  className="aspect-[3/4] transition-transform duration-500 hover:-translate-y-1"
                />
              </Reveal>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
