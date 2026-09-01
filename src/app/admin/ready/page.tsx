"use client";

import { useEffect, useState } from "react";
import { AdminTopBar } from "@/components/admin/admin-shell";
import { ReadyPieceCard } from "@/components/admin/ready-piece-card";
import { ReadyPieceModal } from "@/components/admin/ready-piece-modal";
import { Reveal } from "@/components/reveal";
import { useLang } from "@/lib/i18n";
import { formatMoney } from "@/lib/analytics";
import {
  READY_STATUSES,
  getReadyPieces,
  readyStatusLabel,
  summarizeReadyStock,
  type ReadyPiece,
  type ReadyPieceStatus,
} from "@/lib/ready-pieces";

type Filter = ReadyPieceStatus | "all";

export default function AdminReadyPage() {
  const { t, lang } = useLang();
  const [pieces, setPieces] = useState<ReadyPiece[] | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [editing, setEditing] = useState<ReadyPiece | null>(null);
  const [creating, setCreating] = useState(false);

  function refresh() {
    setPieces(getReadyPieces());
  }

  useEffect(() => {
    refresh();
  }, []);

  if (!pieces) {
    return (
      <p className="text-ink-soft text-sm uppercase tracking-[0.15em] animate-pulse">
        {t("common.loading")}
      </p>
    );
  }

  const summary = summarizeReadyStock(pieces);
  const visible =
    filter === "all" ? pieces : pieces.filter((p) => p.status === filter);

  const stats = [
    { label: t("ready.stat.onRail"), value: String(summary.available) },
    { label: t("ready.stat.reserved"), value: String(summary.reserved) },
    { label: t("ready.stat.sold"), value: String(summary.sold) },
    {
      label: t("ready.stat.stockValue"),
      value: formatMoney(summary.stockValue, lang),
    },
  ];

  const filters: Filter[] = ["all", ...READY_STATUSES];
  const countFor = (f: Filter) =>
    f === "all" ? pieces.length : pieces.filter((p) => p.status === f).length;

  return (
    <>
      <AdminTopBar
        title={t("ready.title")}
        actions={
          <button
            type="button"
            onClick={() => setCreating(true)}
            className="bg-accent text-cream px-4 py-2.5 text-sm rounded transition-colors hover:bg-accent/85 whitespace-nowrap"
          >
            + {t("ready.newPiece")}
          </button>
        }
      />
      <p className="text-sm text-ink-soft mb-8 -mt-4 max-w-xl">{t("ready.sub")}</p>

      <div className="grid grid-cols-2 lg:grid-cols-4 border border-line bg-paper mb-6 divide-x divide-y lg:divide-y-0 divide-line">
        {stats.map((s) => (
          <div key={s.label} className="px-6 py-5">
            <p className="font-display text-3xl">{s.value}</p>
            <p className="text-[10px] uppercase tracking-[0.15em] text-ink-soft mt-1">
              {s.label}
            </p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {filters.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            aria-pressed={filter === f}
            className={`border px-3 py-1.5 text-xs uppercase tracking-[0.1em] transition-colors ${
              filter === f
                ? "border-ink bg-ink text-cream"
                : "border-line-strong text-ink-soft hover:text-ink"
            }`}
          >
            {f === "all" ? t("ready.filter.all") : readyStatusLabel(lang, f)}
            <span className="ml-1.5 tabular-nums opacity-70">{countFor(f)}</span>
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="border border-line bg-paper flex flex-col items-center justify-center gap-3 py-20 text-ink-soft">
          <svg
            viewBox="0 0 24 24"
            className="h-9 w-9"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 4a1.6 1.6 0 1 0 1.1 2.75L12 8l8 5.5H4L12 8" />
            <path d="M3 14.5h18v1.2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          </svg>
          <p className="text-sm">
            {pieces.length === 0 ? t("ready.empty") : t("ready.emptyFilter")}
          </p>
        </div>
      ) : (
        <Reveal>
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {visible.map((piece) => (
              <ReadyPieceCard
                key={piece.id}
                piece={piece}
                onEdit={() => setEditing(piece)}
                onChanged={refresh}
              />
            ))}
          </div>
        </Reveal>
      )}

      {(creating || editing) && (
        <ReadyPieceModal
          piece={editing ?? undefined}
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
          onSaved={refresh}
        />
      )}
    </>
  );
}
