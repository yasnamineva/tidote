"use client";

import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PlaceholderImage } from "@/components/placeholder-image";
import { Reveal } from "@/components/reveal";
import { SplitReveal } from "@/components/split-reveal";
import { FloatingShapes } from "@/components/floating-shapes";
import { useLang } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { WORN_BY, publicPeople, type Person } from "@/lib/worn-by";

export function WornByPage() {
  const { t } = useLang();
  const { session, ready } = useAuth();

  /**
   * The studio sees the example entry; a visitor never does. Until the session
   * has settled we show the visitor's view, so the example cannot flash up on
   * a stranger's screen while we work out who they are.
   */
  const isStudio = ready && session?.role === "admin";
  const people = isStudio ? WORN_BY : publicPeople();

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <section className="relative border-b border-line overflow-hidden">
          <FloatingShapes variant="warm" />
          <div className="relative z-10 mx-auto max-w-7xl px-6 py-7 md:py-9">
            <Reveal className="max-w-xl">
              <p className="text-xs uppercase tracking-[0.3em] text-moss-deep mb-2">
                {t("worn.eyebrow")}
              </p>
              <h1 className="font-display text-4xl md:text-5xl leading-[0.95] mb-3">
                <SplitReveal text={t("worn.pageTitle")} />
              </h1>
              <p className="text-ink-soft text-sm md:text-base">
                {t("worn.blurb")}
              </p>
            </Reveal>
          </div>
        </section>

        <section className="relative mx-auto max-w-7xl px-6 pt-8 md:pt-10 pb-16 md:pb-20 overflow-hidden">
          <FloatingShapes variant="light" />
          {people.length === 0 ? (
            /* The state the page returns to whenever the list is emptied. */
            <div className="relative z-10 border border-line bg-paper px-6 py-16 text-center flex flex-col items-center gap-3">
              <p className="font-display text-2xl">{t("worn.empty")}</p>
              <p className="text-sm text-ink-soft max-w-md">
                {t("worn.emptySub")}
              </p>
              <Link
                href="/login"
                className="btn-sweep mt-3 inline-block bg-ink text-cream px-8 py-3.5 text-sm uppercase tracking-[0.2em] transition-transform duration-300 hover:-translate-y-0.5"
              >
                {t("worn.emptyCta")}
              </Link>
            </div>
          ) : (
            <div className="relative z-10 flex flex-col gap-12 md:gap-16">
              {isStudio && WORN_BY.some((p) => p.demo) && (
                <p className="border border-accent/40 bg-paper px-4 py-3 text-xs text-ink-soft">
                  {t("worn.studioOnly")}
                </p>
              )}
              {people.map((person, i) => (
                <Reveal key={person.slug}>
                  <PersonBand person={person} flip={i % 2 === 1} />
                </Reveal>
              ))}
            </div>
          )}
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

/** Three photographs read as a set; one reads as a stock image. */
function photoColumns(count: number): string {
  if (count <= 1) return "grid-cols-1";
  if (count === 2) return "grid-cols-2";
  return "grid-cols-2 sm:grid-cols-3";
}

/**
 * A band each, rather than cards in a grid.
 *
 * Each person gets a name, a line, their own words and several photographs,
 * which is more than a card can hold without shrinking the pictures to
 * thumbnails — and the pictures are the point. It also means the page looks
 * deliberate with one person on it, which is how it will start.
 */
function PersonBand({ person, flip }: { person: Person; flip: boolean }) {
  const { t, lang } = useLang();

  return (
    <article className="grid gap-6 md:grid-cols-[1fr_1.7fr] md:items-center md:gap-10">
      <div className={`order-2 ${flip ? "md:order-2" : "md:order-1"}`}>
        {person.demo && (
          <p className="mb-3 inline-block border border-accent/40 px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] text-accent">
            {t("worn.example")}
          </p>
        )}
        <h2 className="font-display text-3xl md:text-4xl leading-tight">
          {person.name}
        </h2>
        <p className="mt-1.5 text-xs uppercase tracking-[0.2em] text-moss-deep">
          {person.knownFor[lang]}
        </p>
        {person.quote && (
          <blockquote className="mt-4 text-base md:text-lg text-ink-soft italic leading-relaxed">
            &ldquo;{person.quote[lang]}&rdquo;
          </blockquote>
        )}
        {person.piece && (
          <p className="mt-4 text-sm text-ink-soft">
            {t("worn.wearing")} · {person.piece[lang]}
          </p>
        )}
        {person.instagram && (
          <a
            href={`https://www.instagram.com/${person.instagram}/`}
            target="_blank"
            rel="noreferrer"
            className="link-underline mt-2 inline-block py-2 text-sm tracking-[0.1em] text-ink-soft hover:text-moss-deep transition-colors"
          >
            @{person.instagram}
          </a>
        )}
        {person.demo && (
          <p className="mt-4 max-w-sm text-xs text-ink-soft/70">
            {t("worn.exampleNote")}
          </p>
        )}
      </div>

      {/* Photographs first on a phone: the name means nothing until you have
          seen what they are wearing. */}
      <div
        className={`order-1 grid gap-3 ${photoColumns(person.photos.length)} ${
          flip ? "md:order-1" : "md:order-2"
        }`}
      >
        {person.photos.map((src, i) => (
          <div
            key={src}
            className="group relative aspect-[3/4] overflow-hidden border border-line bg-line/20"
          >
            <PlaceholderImage
              label={person.name}
              src={src}
              index={i}
              className="h-full w-full transition-transform duration-700 ease-out group-hover:scale-105"
            />
          </div>
        ))}
      </div>
    </article>
  );
}
