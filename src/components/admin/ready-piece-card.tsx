"use client";

import { useState } from "react";
import { useLang } from "@/lib/i18n";
import { todayKey } from "@/lib/hours";
import { formatMoney } from "@/lib/analytics";
import { categoryLabel, pieceLabel, seedTextById } from "@/lib/translations";
import {
  READY_STATUSES,
  deleteReadyPiece,
  readyStatusLabel,
  setReadyPieceStatus,
  sizeLabel,
  type ReadyPiece,
  type ReadyPieceStatus,
} from "@/lib/ready-pieces";

const STATUS_STYLE: Record<ReadyPieceStatus, string> = {
  available: "bg-moss-soft text-moss-deep border-moss-deep/40",
  reserved: "bg-accent-soft text-accent border-accent/40",
  // Opaque, unlike the tone-on-tone version: the badge sits over a photograph.
  sold: "bg-cream text-ink-soft border-line-strong",
};

export function ReadyPieceCard({
  piece,
  onEdit,
  onChanged,
}: {
  piece: ReadyPiece;
  onEdit: () => void;
  onChanged: () => void;
}) {
  const { t, lang } = useLang();
  const [confirming, setConfirming] = useState(false);

  return (
    <div
      className={`border border-line bg-paper flex flex-col ${
        piece.status === "sold" ? "opacity-70" : ""
      }`}
    >
      <div className="relative aspect-[4/5] bg-line/20">
        {piece.photos.length > 0 ? (
          // eslint-disable-next-line @next/next/no-img-element -- uploaded photos may be data: URLs, which next/image can't optimize
          <img
            src={piece.photos[0]}
            alt={pieceLabel(lang, piece.name)}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-xs text-ink-soft">
            {t("thumb.noPhoto")}
          </div>
        )}
        <span
          className={`absolute top-2 left-2 border px-2 py-0.5 text-[10px] uppercase tracking-[0.1em] ${STATUS_STYLE[piece.status]}`}
        >
          {readyStatusLabel(lang, piece.status)}
        </span>
        {piece.photos.length > 1 && (
          <span className="absolute top-2 right-2 rounded-full bg-ink text-cream text-[10px] leading-none px-1.5 py-1 tabular-nums">
            +{piece.photos.length - 1}
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
          {piece.price > 0 ? formatMoney(piece.price, lang) : t("ready.noPrice")}
        </p>
        {piece.heldFor && (
          <p className="text-xs text-ink-soft mt-1">
            {piece.status === "sold"
              ? t("ready.soldToName", { name: piece.heldFor })
              : t("ready.heldForName", { name: piece.heldFor })}
          </p>
        )}
        {piece.notes && (
          <p className="text-xs text-ink-soft mt-1 line-clamp-2">
            {/* Seeded demo notes have translations; anything she types passes through. */}
            {seedTextById(lang, `ready-${piece.id}`, piece.notes)}
          </p>
        )}
      </div>

      <div className="px-4 pb-4 flex flex-col gap-2">
        <select
          aria-label={t("ready.status")}
          value={piece.status}
          onChange={(e) => {
            setReadyPieceStatus(
              piece.id,
              e.target.value as ReadyPieceStatus,
              todayKey()
            );
            onChanged();
          }}
          className="border border-line-strong bg-cream px-2 py-1.5 text-xs transition-colors focus:outline-none focus:border-moss-deep"
        >
          {READY_STATUSES.map((s) => (
            <option key={s} value={s}>
              {readyStatusLabel(lang, s)}
            </option>
          ))}
        </select>

        {confirming ? (
          <div className="flex items-center justify-between text-xs">
            <span className="text-ink-soft">{t("ready.confirmDelete")}</span>
            <span className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  deleteReadyPiece(piece.id);
                  onChanged();
                }}
                className="text-accent hover:underline"
              >
                {t("ready.delete")}
              </button>
              <button
                type="button"
                onClick={() => setConfirming(false)}
                className="text-ink-soft hover:text-ink"
              >
                {t("newclient.cancel")}
              </button>
            </span>
          </div>
        ) : (
          <div className="flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={onEdit}
              className="uppercase tracking-[0.1em] text-ink-soft hover:text-ink transition-colors"
            >
              {t("ready.edit")}
            </button>
            <button
              type="button"
              onClick={() => setConfirming(true)}
              className="uppercase tracking-[0.1em] text-ink-soft hover:text-accent transition-colors"
            >
              {t("ready.delete")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
