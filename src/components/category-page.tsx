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
          <div className="relative z-10 mx-auto max-w-7xl px-6 py-16 md:py-24 grid md:grid-cols-2 gap-10 items-center">
            <Reveal>
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
                  {t("hero.cta")}
                </Link>
              </div>
            </Reveal>
            <div className="aspect-[4/5]">
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
              className="link-underline text-sm uppercase tracking-[0.15em] hover:text-moss-deep transition-colors whitespace-nowrap"
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
