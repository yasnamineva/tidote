"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Photo } from "@/components/photo";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Reveal } from "@/components/reveal";
import { SplitReveal } from "@/components/split-reveal";
import { FloatingShapes } from "@/components/floating-shapes";
import { EnquiryModal } from "@/components/enquiry-modal";
import { useLang } from "@/lib/i18n";
import { formatMoney } from "@/lib/analytics";
import { categoryLabel, pieceLabel } from "@/lib/translations";
import { getPublicStock, sizeLabel, type ReadyPiece } from "@/lib/ready-pieces";

/**
 * The shop-window half of the ready rail. It shows the same pieces the studio
 * panel manages, minus everything that is nobody's business out here: sold
 * pieces are gone from the page entirely, and the buyer's name and the
 * studio's private notes are never rendered.
 */
export function InStockPage() {
  const { t } = useLang();
  const [pieces, setPieces] = useState<ReadyPiece[] | null>(null);
  const [asking, setAsking] = useState<ReadyPiece | null>(null);

  // Read from the `public_stock` view, which a stranger is allowed to see:
  // sold pieces are absent and there is no column for the buyer's name.
  useEffect(() => {
    void getPublicStock()
      .then(setPieces)
      .catch(() => setPieces([]));
  }, []);

  const count = pieces?.length ?? 0;

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        {/* Title, blurb and count in one band. They were three stacked blocks
            over two bordered sections, which pushed the first photograph more
            than half a window down the page on a laptop — a rail you cannot
            see any of is a poor shop window. */}
        <section className="relative border-b border-line overflow-hidden">
          <FloatingShapes variant="warm" />
          <div className="relative z-10 mx-auto max-w-7xl px-6 py-7 md:py-9">
            <Reveal className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <div className="max-w-xl">
                <p className="text-xs uppercase tracking-[0.3em] text-moss-deep mb-2">
                  {t("instock.eyebrow")}
                </p>
                <h1 className="font-display text-4xl md:text-5xl leading-[0.95] mb-3">
                  <SplitReveal text={t("instock.pageTitle")} />
                </h1>
                <p className="text-ink-soft text-sm md:text-base">
                  {t("instock.blurb")}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-6 md:flex-col md:items-end md:gap-1.5">
                <p className="font-display text-2xl md:text-3xl whitespace-nowrap">
                  {pieces === null
                    ? t("common.loading")
                    : count === 1
                      ? t("instock.countOne")
                      : t("instock.count", { n: count })}
                </p>
                <Link
                  href="/#shop"
                  className="link-underline inline-block py-1 text-xs uppercase tracking-[0.15em] hover:text-moss-deep transition-colors whitespace-nowrap"
                >
                  {t("instock.lookbook")} &rarr;
                </Link>
              </div>
            </Reveal>
          </div>
        </section>

        <section className="relative mx-auto max-w-7xl px-6 pt-6 md:pt-8 pb-16 md:pb-20 overflow-hidden">
          <FloatingShapes variant="light" />

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
            <div className={`relative z-10 grid gap-4 md:gap-5 ${gridColumns(count)}`}>
              {(pieces ?? []).map((piece, i) => (
                <Reveal key={piece.id} delay={(i % 4) * 80}>
                  <StockCard piece={piece} onAsk={setAsking} />
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
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Link
                  href="/login"
                  className="btn-sweep inline-block bg-ink text-cream px-8 py-3.5 text-sm uppercase tracking-[0.2em] transition-transform duration-300 hover:-translate-y-0.5"
                >
                  {t("instock.commissionCta")}
                </Link>
                <button
                  type="button"
                  onClick={() => setAsking({ id: "", name: "" } as ReadyPiece)}
                  className="btn-sweep inline-block border border-ink px-8 py-3.5 text-sm uppercase tracking-[0.2em] transition-colors duration-300 hover:text-cream"
                >
                  {t("enq.title")}
                </button>
              </div>
            </Reveal>
          </div>
        </section>
      </main>
      {asking && (
        <EnquiryModal
          pieceName={asking.name || undefined}
          pieceId={asking.id || undefined}
          onClose={() => setAsking(null)}
        />
      )}
      <SiteFooter />
    </>
  );
}

/**
 * The rail is one-of-each, so it is often very short. Four columns holding one
 * garment reads as three things missing; one column holding it reads as the
 * garment. The photograph grows to take the room the columns gave up.
 */
function gridColumns(count: number): string {
  if (count <= 1) return "max-w-xl mx-auto";
  if (count === 2) return "grid-cols-2 max-w-3xl mx-auto";
  if (count === 3) return "grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto";
  return "grid-cols-2 md:grid-cols-3 lg:grid-cols-4";
}

function StockCard({
  piece,
  onAsk,
}: {
  piece: ReadyPiece;
  onAsk: (piece: ReadyPiece) => void;
}) {
  const { t, lang } = useLang();
  const reserved = piece.status === "reserved";

  return (
    <div className="group border border-line bg-paper flex flex-col h-full">
      <div className="relative aspect-[4/5] overflow-hidden bg-line/20">
        {piece.photos.length > 0 ? (
          <Photo
            cdn
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
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

      {/* Was a link to Instagram, which meant the studio read DMs and the
          site never knew the question had been asked. */}
      <button
        type="button"
        onClick={() => onAsk(piece)}
        className="mx-4 mb-4 border border-ink py-2.5 text-center text-[10px] uppercase tracking-[0.15em] transition-colors hover:bg-ink hover:text-cream"
      >
        {t("instock.ask")}
      </button>
    </div>
  );
}
