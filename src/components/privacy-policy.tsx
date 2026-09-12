"use client";

import { Fragment, type ReactNode } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Reveal } from "@/components/reveal";
import { useLang } from "@/lib/i18n";
import { PRIVACY } from "@/lib/privacy-content";

/**
 * Renders the notice in whichever language the visitor has chosen. Both
 * versions are the same document; neither is a translation of record, so a
 * change to one has to be made to the other.
 */

/**
 * The copy carries `**bold**` and `*italic*` because a privacy notice needs to
 * emphasise the odd phrase and writing JSX inside a content file would make it
 * unreadable. This turns those two markers into elements — nothing else, and
 * never through `dangerouslySetInnerHTML`.
 */
function formatted(text: string): ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-ink">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return <em key={i}>{part.slice(1, -1)}</em>;
    }
    return <Fragment key={i}>{part}</Fragment>;
  });
}

export function PrivacyPolicy() {
  const { lang } = useLang();
  const policy = PRIVACY[lang];

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <section className="border-b border-line">
          <div className="mx-auto max-w-3xl px-6 py-10 md:py-14">
            <Reveal>
              <p className="text-xs uppercase tracking-[0.3em] text-moss-deep mb-3">
                {policy.eyebrow}
              </p>
              <h1 className="font-display text-4xl md:text-5xl leading-[0.95] mb-4">
                {policy.title}
              </h1>
              <p className="text-xs uppercase tracking-[0.15em] text-ink-soft mb-6">
                {policy.updatedLabel}
              </p>
              <p className="text-ink-soft text-base md:text-lg leading-relaxed">
                {policy.intro}
              </p>
            </Reveal>
          </div>
        </section>

        {/* A table of contents: thirteen sections is enough that somebody
            looking for the deletion rules should not have to scroll for them. */}
        <section className="border-b border-line bg-cream">
          <nav className="mx-auto max-w-3xl px-6 py-8">
            <ol className="grid gap-x-8 gap-y-2 sm:grid-cols-2 text-sm">
              {policy.sections.map((section) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    className="link-underline inline-block py-2 text-ink-soft hover:text-moss-deep transition-colors"
                  >
                    {section.heading}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </section>

        <div className="mx-auto max-w-3xl px-6 py-12 md:py-16 flex flex-col gap-12">
          {policy.sections.map((section) => (
            <section
              key={section.id}
              id={section.id}
              className="scroll-mt-28 flex flex-col gap-4"
            >
              <h2 className="font-display text-2xl md:text-3xl">
                {section.heading}
              </h2>
              {section.blocks.map((block, i) =>
                typeof block === "string" ? (
                  <p key={i} className="text-ink-soft leading-relaxed">
                    {formatted(block)}
                  </p>
                ) : (
                  <ul key={i} className="flex flex-col gap-3 pl-5">
                    {block.list.map((item, j) => (
                      <li
                        key={j}
                        className="list-disc marker:text-moss-deep text-ink-soft leading-relaxed"
                      >
                        {formatted(item)}
                      </li>
                    ))}
                  </ul>
                )
              )}
            </section>
          ))}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
