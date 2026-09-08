"use client";

import Image from "next/image";
import Link from "next/link";
import { Wordmark } from "@/components/wordmark";
import { useLang } from "@/lib/i18n";
import { CONTROLLER } from "@/lib/privacy-content";

export function SiteFooter() {
  const { t, lang } = useLang();
  return (
    <footer className="bg-ink text-cream">
      <div className="mx-auto max-w-7xl px-6 py-16 grid gap-12 md:grid-cols-5">
        <div className="md:col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <Image
              src="/brand/logo.png"
              alt="Tidote Atelier monogram"
              width={64}
              height={64}
              className="h-14 w-14 object-contain invert"
            />
            <Wordmark size="md" className="[&_span:last-child]:text-cream/60" />
          </div>
          <p className="text-cream/70 max-w-sm text-sm leading-relaxed">
            {t("footer.tagline")}
          </p>
        </div>

        <div>
          <h3 className="text-xs uppercase tracking-[0.2em] text-cream/50 mb-4">
            {t("footer.explore")}
          </h3>
          <ul className="space-y-3 text-sm">
            <li>
              <Link
                href="/#about"
                className="link-underline inline-block py-1.5 hover:text-moss transition-colors"
              >
                {t("nav.about")}
              </Link>
            </li>
            <li>
              <Link
                href="/#gallery"
                className="link-underline inline-block py-1.5 hover:text-moss transition-colors"
              >
                {t("nav.gallery")}
              </Link>
            </li>
            <li>
              <Link
                href="/login"
                className="link-underline inline-block py-1.5 hover:text-moss transition-colors"
              >
                {t("header.login")}
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-xs uppercase tracking-[0.2em] text-cream/50 mb-4">
            {t("footer.shop")}
          </h3>
          <ul className="space-y-3 text-sm">
            <li>
              <Link
                href="/casual"
                className="link-underline inline-block py-1.5 hover:text-moss transition-colors"
              >
                {t("nav.casual")}
              </Link>
            </li>
            <li>
              <Link
                href="/sports"
                className="link-underline inline-block py-1.5 hover:text-moss transition-colors"
              >
                {t("nav.sports")}
              </Link>
            </li>
            <li>
              <Link
                href="/in-stock"
                className="link-underline inline-block py-1.5 hover:text-moss transition-colors"
              >
                {t("nav.inStock")}
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-xs uppercase tracking-[0.2em] text-cream/50 mb-4">
            {t("footer.connect")}
          </h3>
          <ul className="space-y-3 text-sm">
            <li>
              <a
                href="https://www.instagram.com/tidote.atelier/"
                target="_blank"
                rel="noreferrer"
                className="link-underline inline-block py-1.5 hover:text-moss transition-colors"
              >
                Instagram
              </a>
            </li>
            <li>
              {/* The 5-column grid leaves ~105px per column at md, and the
                  address is wider than that. Let it break rather than push the
                  page 45px wide (which `overflow-x: clip` then hides). */}
              <a
                href="mailto:support@tidoteatelier.com"
                className="link-underline inline-block break-all py-1.5 hover:text-moss transition-colors"
              >
                support@tidoteatelier.com
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-cream/10 px-6 py-6 flex flex-col items-center gap-4 text-xs text-cream/40 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col items-center gap-1.5 sm:items-start">
          <span className="uppercase tracking-[0.2em]">
            {t("footer.rights", { year: new Date().getFullYear() })}
          </span>
          {/* The Electronic Commerce Act wants the trader named on the site
              itself, not only inside the privacy notice — registered name,
              company number, address. Same source as the notice uses. */}
          <span className="text-cream/35 text-center sm:text-left">
            {CONTROLLER.legalName[lang]} · {lang === "bg" ? "ЕИК" : "UIC"}{" "}
            {CONTROLLER.companyNumber} · {CONTROLLER.address[lang]}
          </span>
        </div>
        <Link
          href="/privacy"
          className="link-underline py-1 uppercase tracking-[0.2em] hover:text-moss transition-colors"
        >
          {t("footer.privacy")}
        </Link>
      </div>
    </footer>
  );
}
