"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Reveal } from "@/components/reveal";
import { SplitReveal } from "@/components/split-reveal";
import { FloatingShapes } from "@/components/floating-shapes";
import { useLang } from "@/lib/i18n";
import { formatMoney } from "@/lib/analytics";
import { categoryLabel, pieceLabel } from "@/lib/translations";
import { getReadyPieces, sizeLabel, type ReadyPiece } from "@/lib/ready-pieces";

const INSTAGRAM_URL = "https://www.instagram.com/tidote.atelier/";

/**
 * The shop-window half of the ready rail. It shows the same pieces the studio
 * panel manages, minus everything that is nobody's business out here: sold
 * pieces are gone from the page entirely, and the buyer's name and the
 * studio's private notes are never rendered.
 */
export function InStockPage() {
  const { t } = useLang();
  const [pieces, setPieces] = useState<ReadyPiece[] | null>(null);

  // The rail lives in browser storage, so it can only be read after mount.
  useEffect(() => {
    setPieces(getReadyPieces().filter((p) => p.status !== "sold"));
  }, []);

  const count = pieces?.length ?? 0;

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <section className="relative border-b border-line overflow-hidden">
          <FloatingShapes variant="warm" />
          <div className="relative z-10 mx-auto max-w-7xl px-6 py-16 md:py-24">
            <Reveal>
              <p className="text-xs uppercase tracking-[0.3em] text-moss-deep mb-4">
                {t("instock.eyebrow")}
              </p>
              <h1 className="font-display text-4xl md:text-6xl leading-[0.95] mb-6">
                <SplitReveal text={t("instock.pageTitle")} />
              </h1>
              <p className="text-ink-soft text-base md:text-lg max-w-xl">
                {t("instock.blurb")}
              </p>
            </Reveal>
          </div>
        </section>

        <section className="relative mx-auto max-w-7xl px-6 py-16 md:py-20 overflow-hidden">
          <FloatingShapes variant="light" />
          <Reveal className="relative z-10 flex flex-wrap items-end justify-between gap-4 mb-8">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-moss-deep mb-2">
                {t("instock.railTitle")}
              </p>
              <h2 className="font-display text-3xl md:text-4xl">
                {pieces === null
                  ? t("common.loading")
                  : count === 1
                    ? t("instock.countOne")
                    : t("instock.count", { n: count })}
              </h2>
            </div>
            <Link
              href="/#shop"
              className="link-underline inline-block py-2 text-sm uppercase tracking-[0.15em] hover:text-moss-deep transition-colors whitespace-nowrap"
            >
              {t("instock.lookbook")} &rarr;
            </Link>
          </Reveal>

          {pieces !== null && count === 0 ? (
            <div className="relative z-10 border border-line bg-paper px-6 py-16 text-center flex flex-col items-center gap-3">
              <p className="font-display text-2xl">{t("instock.empty")}</p>
              <p className="text-sm text-ink-soft max-w-md">
                {t("instock.emptySub")}
              </p>
              <Link
                href="/login"
                className="btn-sweep mt-3 bg-ink text-cream px-8 py-3.5 text-sm uppercase tracking-[0.2em] transition-transform duration-300 hover:-translate-y-0.5"
              >
                {t("instock.commissionCta")}
              </Link>
            </div>
          ) : (
            <div className="relative z-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
              {(pieces ?? []).map((piece, i) => (
                <Reveal key={piece.id} delay={(i % 4) * 80}>
                  <StockCard piece={piece} />
                </Reveal>
              ))}
            </div>
          )}
        </section>

        <section className="border-t border-line bg-moss-soft">
          <div className="mx-auto max-w-7xl px-6 py-16 md:py-20 text-center flex flex-col items-center gap-4">
            <Reveal>
              <h2 className="font-display text-3xl md:text-4xl mb-3">
                {t("instock.commissionTitle")}
              </h2>
              <p className="text-ink-soft max-w-lg mx-auto mb-7">
                {t("instock.commissionCopy")}
              </p>
              {/* inline-block, not inline: `overflow: hidden` does not clip an
                  inline box, so the parked btn-sweep bleeds out to its left. */}
              <Link
                href="/login"
                className="btn-sweep inline-block bg-ink text-cream px-8 py-3.5 text-sm uppercase tracking-[0.2em] transition-transform duration-300 hover:-translate-y-0.5"
              >
                {t("instock.commissionCta")}
              </Link>
            </Reveal>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

function StockCard({ piece }: { piece: ReadyPiece }) {
  const { t, lang } = useLang();
  const reserved = piece.status === "reserved";

  return (
    <div className="group border border-line bg-paper flex flex-col h-full">
      <div className="relative aspect-[4/5] overflow-hidden bg-line/20">
        {piece.photos.length > 0 ? (
          // eslint-disable-next-line @next/next/no-img-element -- studio uploads are data: URLs, which next/image can't optimize
          <img
            src={piece.photos[0]}
            alt={pieceLabel(lang, piece.name)}
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-[10px] uppercase tracking-[0.2em] text-ink-soft">
            {t("thumb.noPhoto")}
          </div>
        )}
        {reserved && (
          <span className="absolute top-2 left-2 border border-accent/40 bg-accent-soft text-accent px-2 py-0.5 text-[10px] uppercase tracking-[0.1em]">
            {t("instock.reserved")}
          </span>
        )}
      </div>

      <div className="px-4 py-4 flex flex-col gap-1 flex-1">
        <p className="font-display text-base leading-tight">
          {pieceLabel(lang, piece.name)}
        </p>
        <p className="text-xs text-ink-soft">
          {categoryLabel(lang, piece.category)}
          {piece.size && ` · ${sizeLabel(lang, piece.size)}`}
        </p>
        <p className="text-sm tabular-nums mt-1">
          {piece.price > 0
            ? formatMoney(piece.price, lang)
            : t("instock.priceOnRequest")}
        </p>
      </div>

      <a
        href={INSTAGRAM_URL}
        target="_blank"
        rel="noreferrer"
        className="mx-4 mb-4 border border-ink text-center py-2.5 text-[10px] uppercase tracking-[0.15em] transition-colors hover:bg-ink hover:text-cream"
      >
        {t("instock.ask")}
      </a>
    </div>
  );
}
