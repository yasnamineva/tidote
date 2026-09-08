"use client";

import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PlaceholderImage } from "@/components/placeholder-image";
import { Reveal } from "@/components/reveal";
import { SplitReveal } from "@/components/split-reveal";
import { FloatingShapes } from "@/components/floating-shapes";
import { useLang } from "@/lib/i18n";
import { WORN_BY, type Person } from "@/lib/worn-by";

/**
 * A wall of names is only as good as it is full. Two portraits in a
 * four-column grid is two people and two holes, so the columns narrow until
 * the photographs fill what the grid gives up — the same rule the rail uses.
 */
function gridColumns(count: number): string {
  if (count <= 1) return "max-w-md mx-auto";
  if (count === 2) return "grid-cols-2 max-w-3xl mx-auto";
  if (count === 3) return "grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto";
  return "grid-cols-2 md:grid-cols-3 lg:grid-cols-4";
}

export function WornByPage() {
  const { t } = useLang();
  const people = WORN_BY;

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
            /* The page will stand here for a while before the first name
               arrives, so this is the state that matters most. */
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
            <div
              className={`relative z-10 grid gap-4 md:gap-5 ${gridColumns(
                people.length
              )}`}
            >
              {people.map((person, i) => (
                <Reveal key={person.slug} delay={(i % 4) * 80}>
                  <PersonCard person={person} />
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

function PersonCard({ person }: { person: Person }) {
  const { t, lang } = useLang();

  return (
    <figure className="group h-full border border-line bg-paper flex flex-col">
      <div className="relative aspect-[3/4] overflow-hidden bg-line/20">
        <PlaceholderImage
          label={person.name}
          src={person.photo}
          className="h-full w-full transition-transform duration-700 ease-out group-hover:scale-105"
        />
      </div>
      <figcaption className="flex flex-1 flex-col gap-1.5 px-4 py-4">
        <p className="font-display text-lg leading-tight">{person.name}</p>
        <p className="text-xs uppercase tracking-[0.15em] text-moss-deep">
          {person.knownFor[lang]}
        </p>
        {person.quote && (
          <blockquote className="mt-1 text-sm text-ink-soft italic">
            &ldquo;{person.quote[lang]}&rdquo;
          </blockquote>
        )}
        {person.piece && (
          <p className="mt-auto pt-2 text-xs text-ink-soft">
            {t("worn.wearing")} · {person.piece[lang]}
          </p>
        )}
        {person.instagram && (
          <a
            href={`https://www.instagram.com/${person.instagram}/`}
            target="_blank"
            rel="noreferrer"
            className="link-underline inline-block self-start py-1 text-xs tracking-[0.1em] text-ink-soft hover:text-moss-deep transition-colors"
          >
            @{person.instagram}
          </a>
        )}
      </figcaption>
    </figure>
  );
}
