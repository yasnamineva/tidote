"use client";

import Link from "next/link";
import { Reveal } from "@/components/reveal";
import { useLang } from "@/lib/i18n";
import { OFFER } from "@/lib/offer";

/**
 * How a commission works, and the three questions everyone asks before
 * committing to one.
 *
 * It sits on the lookbook pages rather than the homepage on purpose: this is
 * what someone reads once they have seen a piece they want, and the homepage
 * already carries two numbered explanations without a third.
 *
 * Nothing here invents a policy. Where `lib/offer.ts` has a figure, the answer
 * states it; where it does not, the answer says only what the site actually
 * does — you are told the date with the quote, you pick your own fitting slot,
 * the fitting happens before delivery. Fill the figures in and the vaguer half
 * of each answer is replaced by the real terms.
 */

const STEPS = [1, 2, 3, 4, 5, 6] as const;

export function CommissionFlow() {
  const { t } = useLang();
  return (
    /* A column on a phone. Wrapped across three lines, the arrows ended up
       leading lines rather than joining steps, which reads as six unrelated
       items. The numbers already carry the order, so below `sm` the arrows go
       and the list simply stacks. */
    <ol className="flex flex-col gap-y-1.5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-3 sm:gap-y-2">
      {STEPS.map((n, i) => (
        <li key={n} className="flex items-center gap-3">
          {i > 0 && (
            <span aria-hidden="true" className="hidden text-moss-deep/50 sm:inline">
              &rarr;
            </span>
          )}
          <span className="text-xs uppercase tracking-[0.15em] text-ink-soft">
            <span className="text-moss-deep">{n}.</span> {t(`flow.${n}`)}
          </span>
        </li>
      ))}
    </ol>
  );
}

/** The three answers, each one line, from OFFER where OFFER knows. */
export function CommissionAnswers() {
  const { t } = useLang();

  const answers: { q: string; a: string }[] = [
    {
      q: t("terms.q.lead"),
      a: OFFER.lead
        ? t("terms.a.lead", { min: OFFER.lead.minDays, max: OFFER.lead.maxDays })
        : t("terms.a.leadUnset"),
    },
    {
      q: t("terms.q.fitting"),
      a: OFFER.fittingsIncluded
        ? t("terms.a.fitting", { n: OFFER.fittingsIncluded })
        : t("terms.a.fittingUnset"),
    },
    {
      q: t("terms.q.adjust"),
      a: OFFER.adjustmentDays
        ? t("terms.a.adjust", { n: OFFER.adjustmentDays })
        : t("terms.a.adjustUnset"),
    },
  ];

  return (
    <dl className="grid gap-8 md:grid-cols-3 md:gap-10">
      {answers.map(({ q, a }) => (
        <div key={q} className="min-w-0">
          <dt className="font-display text-lg md:text-xl">{q}</dt>
          <dd className="mt-2 text-sm leading-relaxed text-ink-soft break-words">
            {a}
          </dd>
        </div>
      ))}
    </dl>
  );
}

/**
 * Both of the above as a section, for the lookbook pages.
 */
export function CommissionTerms() {
  const { t } = useLang();
  return (
    <section
      id="how-it-works"
      className="scroll-mt-20 border-b border-t border-line bg-paper"
    >
      <div className="mx-auto max-w-7xl px-6 py-14 md:py-16">
        <Reveal className="max-w-2xl">
          <p className="text-xs uppercase tracking-[0.3em] text-moss-deep mb-2">
            {t("terms.eyebrow")}
          </p>
          <h2 className="font-display text-2xl md:text-3xl">{t("terms.title")}</h2>
        </Reveal>

        <Reveal delay={100} className="mt-6">
          <CommissionFlow />
        </Reveal>

        <Reveal delay={200} className="mt-10 border-t border-line pt-8">
          <CommissionAnswers />
        </Reveal>

        <Reveal delay={300} className="mt-8">
          <Link
            href="/login"
            className="btn-sweep inline-block bg-ink text-cream px-7 py-3.5 text-xs uppercase tracking-[0.2em] transition-transform duration-300 hover:-translate-y-0.5"
          >
            {t("cta.commission")} &rarr;
          </Link>
          <p className="mt-2.5 text-xs text-ink-soft/75">{t("cta.signInLater")}</p>
        </Reveal>
      </div>
    </section>
  );
}
