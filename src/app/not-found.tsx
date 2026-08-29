"use client";

import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { useLang } from "@/lib/i18n";

// Client component so the copy follows the language toggle like the rest of
// the site. Next serves this for any unmatched route, with a 404 status.
export default function NotFound() {
  const { t } = useLang();

  return (
    <>
      <SiteHeader />
      <main className="flex-1 flex items-center justify-center px-6 py-24">
        <div className="w-full max-w-lg text-center animate-[fade-up_0.6s_cubic-bezier(0.16,1,0.3,1)_both]">
          <p className="text-xs uppercase tracking-[0.3em] text-moss-deep mb-3">
            {t("nf.eyebrow")}
          </p>
          <h1 className="font-display text-3xl md:text-5xl mb-5">
            {t("nf.title")}
          </h1>
          <p className="text-ink-soft leading-relaxed mb-10">{t("nf.body")}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="border border-ink px-7 py-3 text-xs uppercase tracking-[0.2em] transition-colors hover:bg-ink hover:text-cream"
            >
              {t("nf.home")}
            </Link>
            <Link
              href="/casual"
              className="border border-line-strong px-7 py-3 text-xs uppercase tracking-[0.2em] text-ink-soft transition-colors hover:border-ink hover:text-ink"
            >
              {t("nf.browse")}
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
