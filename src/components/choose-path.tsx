"use client";

import Link from "next/link";
import { Reveal } from "@/components/reveal";
import { useLang } from "@/lib/i18n";
import { OFFER, startingFrom } from "@/lib/offer";

/**
 * The three ways to buy, said plainly, directly under the hero.
 *
 * Every primary call to action on the homepage used to be "Get Yours Now"
 * pointing at /login — so the first thing a stranger was asked to do was
 * create an account for something they had not yet seen the price of. This
 * band answers "what can I actually buy here" before anything asks them to
 * sign in, and only the route that genuinely needs an account leads to one.
 *
 * Facts appear only when the studio has set them in `lib/offer.ts`. An unset
 * lead time shows nothing rather than a guess.
 */

type Path = {
  key: "stock" | "custom" | "bespoke";
  href: string;
  cta: string;
  /** Small print under the button, when there is something worth saying. */
  note?: string;
  facts: (string | null)[];
};

export function ChoosePath() {
  const { t } = useLang();

  const lead = OFFER.lead
    ? t("fact.lead", { min: OFFER.lead.minDays, max: OFFER.lead.maxDays })
    : null;
  const fittings = OFFER.fittingsIncluded
    ? t("fact.fittings", { n: OFFER.fittingsIncluded })
    : null;

  const paths: Path[] = [
    {
      key: "stock",
      href: "/in-stock",
      cta: t("cta.shopInStock"),
      facts: [t("fact.readyToday"), t("fact.inStockNow")],
    },
    {
      key: "custom",
      href: "/casual",
      cta: t("cta.viewPieces"),
      facts: [
        t("fact.madeToMeasure"),
        startingFrom("casual")
          ? t("fact.from", { price: startingFrom("casual")! })
          : t("fact.quoted"),
        lead,
        fittings,
      ],
    },
    {
      key: "bespoke",
      href: "/login",
      cta: t("cta.commission"),
      note: t("cta.signInLater"),
      facts: [t("fact.madeToMeasure"), t("fact.quoted"), lead, fittings],
    },
  ];

  return (
    <section id="choose" className="scroll-mt-20 border-b border-line bg-paper">
      <div className="mx-auto max-w-7xl px-6 py-12 md:py-16">
        <Reveal className="mb-8 max-w-2xl md:mb-10">
          <h2 className="font-display text-2xl md:text-3xl">{t("choose.title")}</h2>
          <p className="mt-3 text-sm text-ink-soft md:text-base">{t("choose.sub")}</p>
        </Reveal>

        <div className="grid gap-px bg-line md:grid-cols-3">
          {paths.map((path, i) => (
            <Reveal key={path.key} delay={i * 100}>
              <div className="flex h-full flex-col bg-cream px-6 py-7 md:px-7 md:py-8">
                <p className="text-xs uppercase tracking-[0.25em] text-moss-deep">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-2 font-display text-2xl md:text-3xl">
                  {t(`choose.${path.key}.title`)}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                  {t(`choose.${path.key}.copy`)}
                </p>

                <ul className="mt-5 flex flex-col gap-1.5">
                  {path.facts
                    .filter((fact): fact is string => Boolean(fact))
                    .map((fact) => (
                      <li
                        key={fact}
                        className="flex items-baseline gap-2 text-xs uppercase tracking-[0.1em] text-ink-soft"
                      >
                        <span className="text-moss-deep">·</span>
                        {fact}
                      </li>
                    ))}
                </ul>

                <div className="mt-auto pt-7">
                  <Link
                    href={path.href}
                    className="btn-sweep inline-block border border-ink px-6 py-3 text-xs uppercase tracking-[0.2em] transition-colors duration-300 hover:text-cream"
                  >
                    {path.cta} &rarr;
                  </Link>
                  {path.note && (
                    <p className="mt-2.5 text-xs text-ink-soft/75">{path.note}</p>
                  )}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
