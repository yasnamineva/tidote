"use client";

import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Hero } from "@/components/hero";
import { PlaceholderImage } from "@/components/placeholder-image";
import { Reveal } from "@/components/reveal";
import { TypingText } from "@/components/typing-text";
import { FramedMedia } from "@/components/framed-media";
import { SplitReveal } from "@/components/split-reveal";
import { ImageReveal } from "@/components/image-reveal";
import { FloatingShapes } from "@/components/floating-shapes";
import { JourneyStepper } from "@/components/journey-stepper";
import { ChoosePath } from "@/components/choose-path";
import { AtelierFacts, AtelierShots } from "@/components/atelier-proof";
import { useLang } from "@/lib/i18n";

const SHOP_CATEGORIES = [
  { key: "casual", href: "/casual", image: "/photos/casual-hero.jpg" },
  { key: "sports", href: "/sports", image: "/photos/sports-hero.jpg" },
];

const PROCESS = ["1", "2", "3", "4"];


const GALLERY_PHOTOS = [
  "/photos/gallery-1.jpg",
  "/photos/gallery-2.jpg",
  "/photos/gallery-3.jpg",
  "/photos/gallery-4.jpg",
  "/photos/gallery-5.jpg",
  "/photos/gallery-6.jpg",
  "/photos/gallery-7.jpg",
  "/photos/gallery-8.jpg",
];

const INSTAGRAM_URL = "https://www.instagram.com/tidote.atelier/";

export default function Home() {
  const { lang, t } = useLang();
  const aboutSegments =
    lang === "bg"
      ? [
          { text: "Ан" },
          { text: "ТИДОТ", className: "font-gothic text-moss" },
          { text: "ът срещу посредствеността" },
        ]
      : [
          { text: "The an" },
          { text: "TIDOTE", className: "font-gothic text-moss" },
          { text: " to mediocrity" },
        ];
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        {/* Hero */}
        <Hero />

        {/* What you can actually buy, before anything asks for an account. */}
        <ChoosePath />

        {/* Shop categories */}
        <section id="shop" className="scroll-mt-20 bg-moss">
          <div className="grid md:grid-cols-2">
            {SHOP_CATEGORIES.map((c, i) => (
              <Reveal key={c.key} delay={i * 100}>
                <div className="group relative block h-[70vh] md:h-[85vh] overflow-hidden">
                  <PlaceholderImage
                    label={t(`cat.${c.key}.title`)}
                    src={c.image}
                    className="h-full w-full transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/25 to-transparent" />
                  {/* The whole tile opens the category; the CTAs below sit on top of it */}
                  <Link
                    href={c.href}
                    aria-label={t(`cat.${c.key}.title`)}
                    className="absolute inset-0 z-10"
                  />
                  <div className="absolute inset-x-0 bottom-0 p-8 md:p-12 text-cream z-20 pointer-events-none">
                    <h3 className="font-display text-5xl md:text-6xl tracking-wide">
                      {t(`cat.${c.key}.title`)}
                    </h3>
                    <p className="text-sm text-cream/80 mt-3 max-w-xs">
                      {t(`cat.${c.key}.copy`)}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-3 mt-6">
                      <Link
                        href={c.href}
                        className="btn-sweep bg-cream text-ink px-6 py-3 text-xs uppercase tracking-[0.2em] transition-transform duration-300 hover:-translate-y-0.5 pointer-events-auto"
                      >
                        {t("cta.viewPieces")} &rarr;
                      </Link>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* How a Piece Comes Together */}
        <section id="how" className="relative border-b border-line overflow-hidden scroll-mt-20">
          <FloatingShapes variant="light" />
          <div className="relative z-10 mx-auto max-w-7xl px-6 py-16 md:py-20">
            <Reveal className="text-center mb-10">
              <h2 className="font-display text-2xl md:text-3xl">
                <SplitReveal text={t("home.process.title")} />
              </h2>
            </Reveal>
            <div className="grid md:grid-cols-4">
              {PROCESS.map((p, i) => (
                <Reveal key={p} delay={i * 100}>
                  <div
                    className={`group px-6 py-8 border-line h-full transition-colors duration-300 hover:bg-moss-soft ${
                      i > 0 ? "border-t md:border-t-0 md:border-l" : ""
                    }`}
                  >
                    <span
                      className={`font-display text-4xl transition-colors duration-300 ${
                        i % 2 === 0 ? "text-accent" : "text-moss-deep"
                      }`}
                    >
                      {`0${p}`}
                    </span>
                    <h3 className="font-display text-xl mt-4 mb-2">
                      {t(`process.${p}.title`)}
                    </h3>
                    <p className="text-sm text-ink-soft">{t(`process.${p}.copy`)}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Deliberately between the process cards and the journey below:
            both of those are numbered lists of words, and back to back they
            read as one wall. A full-bleed photograph breaks them apart. */}
        {/* The third way in. It was a thin strip at the foot of the shop
            section, which made it both easy to scroll past and impossible for
            the menu to track — a 140px band lights "In Stock" for a fifth of a
            second and then it is gone. Its own section, its own photograph. */}
        <section id="ready" className="scroll-mt-20 relative h-[60vh] min-h-[420px] overflow-hidden">
          <PlaceholderImage
            label={t("nav.inStock")}
            src="/photos/gallery-2.jpg"
            className="h-full w-full"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-ink/90 via-ink/60 to-ink/20" />
          <Link href="/in-stock" aria-label={t("nav.inStock")} className="absolute inset-0 z-10" />
          <div className="absolute inset-0 z-20 flex items-center pointer-events-none">
            <Reveal className="mx-auto w-full max-w-7xl px-6">
              <p className="text-xs uppercase tracking-[0.3em] text-cream/70 mb-3">
                {t("instock.eyebrow")}
              </p>
              <h2 className="font-display text-4xl md:text-6xl tracking-wide text-cream">
                {t("nav.inStock")}
              </h2>
              <p className="text-sm md:text-base text-cream/85 mt-4 max-w-md">
                {t("shop.inStockCopy")}
              </p>
              <Link
                href="/in-stock"
                className="btn-sweep bg-cream text-ink px-6 py-3 text-xs uppercase tracking-[0.2em] mt-8 inline-block transition-transform duration-300 hover:-translate-y-0.5 pointer-events-auto"
              >
                {t("shop.inStockCta")} &rarr;
              </Link>
            </Reveal>
          </div>
        </section>

        {/* Your Made-to-Measure Journey */}
        <section className="relative border-b border-line overflow-hidden bg-paper">
          <FloatingShapes variant="light" />
          <div className="relative z-10 mx-auto max-w-6xl px-6 py-16 md:py-20">
            <Reveal className="text-center mb-12">
              <p className="text-xs uppercase tracking-[0.3em] text-moss-deep mb-2">
                {t("home.journey.eyebrow")}
              </p>
              <h2 className="font-display text-2xl md:text-3xl">
                <SplitReveal text={t("home.journey.title")} />
              </h2>
            </Reveal>
            <Reveal delay={100}>
              <JourneyStepper />
            </Reveal>
            <Reveal delay={200} className="text-center mt-12">
              <Link
                href="/login"
                className="btn-sweep bg-ink text-cream px-6 py-3 text-sm uppercase tracking-[0.15em] transition-transform duration-300 hover:-translate-y-0.5 inline-block"
              >
                {t("cta.commission")}
              </Link>
              <p className="mt-3 text-xs text-ink-soft/75">{t("cta.signInLater")}</p>
              {/* The long answers — lead time, fittings, adjustments — live on
                  the lookbook pages rather than here. A link keeps the homepage
                  from turning into a third numbered list. */}
              <Link
                href="/casual#how-it-works"
                className="link-underline mt-4 inline-block py-2 text-xs uppercase tracking-[0.15em] text-ink-soft transition-colors hover:text-moss-deep"
              >
                {t("terms.title")} &rarr;
              </Link>
            </Reveal>
          </div>
        </section>

        {/* About */}
        <section
          id="about"
          className="relative border-b border-line overflow-hidden scroll-mt-20"
        >
          <FloatingShapes variant="light" />
          <div className="relative z-10 mx-auto max-w-7xl px-6 py-16 md:py-24 grid md:grid-cols-2 gap-10 items-center">
            <Reveal>
              <p className="text-xs uppercase tracking-[0.3em] text-moss-deep mb-4">
                {t("about.eyebrow")}
              </p>
              <TypingText
                key={lang}
                className="font-round font-semibold text-4xl md:text-6xl leading-[0.95] text-ink mb-6 inline-block"
                speed={55}
                segments={aboutSegments}
              />
              <p className="text-ink-soft text-base md:text-lg max-w-md">
                {t("about.copy")}
              </p>
              {/* Specifics, not adjectives: where, by whom, how many, and what
                  a fitting actually is. */}
              <AtelierFacts />
            </Reveal>
            <div className="aspect-[4/5]">
              <FramedMedia className="h-full w-full">
                <ImageReveal className="h-full w-full">
                  <PlaceholderImage
                    label="Tidote streetwear look"
                    src="/photos/about-hero.jpg"
                    className="h-full w-full"
                  />
                </ImageReveal>
              </FramedMedia>
            </div>
          </div>
        </section>

        {/* Photographs of the work. Renders nothing until there are real
            ones — see lib/atelier.ts. */}
        <AtelierShots />

        {/* Gallery pulled from Instagram */}
        <section
          id="gallery"
          className="relative mx-auto max-w-7xl px-6 py-16 md:py-20 scroll-mt-20 overflow-hidden"
        >
          <FloatingShapes variant="light" />
          <Reveal className="relative z-10 flex items-end justify-between mb-8">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-moss-deep mb-2">
                {t("gallery.eyebrow")}
              </p>
              <h2 className="font-display text-3xl md:text-4xl">
                <SplitReveal text="@tidote.atelier" />
              </h2>
            </div>
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noreferrer"
              className="link-underline inline-block py-2 text-sm uppercase tracking-[0.15em] hover:text-moss-deep transition-colors whitespace-nowrap"
            >
              {t("gallery.follow")} &rarr;
            </a>
          </Reveal>
          <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-3">
            {GALLERY_PHOTOS.map((src, i) => (
              <Reveal key={src} delay={(i % 4) * 80}>
                <PlaceholderImage
                  label="Tidote streetwear look"
                  src={src}
                  index={i}
                  className="aspect-square transition-transform duration-500 hover:-translate-y-1"
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
