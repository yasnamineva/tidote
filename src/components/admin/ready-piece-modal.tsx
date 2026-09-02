"use client";

import { useState } from "react";
import { useLang } from "@/lib/i18n";
import { todayKey } from "@/lib/hours";
import { categoryLabel } from "@/lib/translations";
import { importPhotos, photoWarning } from "@/lib/images";
import { ORDER_CATEGORIES, generateId, type OrderCategory } from "@/lib/mock-data";
import {
  READY_SIZES,
  READY_STATUSES,
  readyStatusLabel,
  saveReadyPiece,
  sizeLabel,
  type ReadyPiece,
  type ReadyPieceStatus,
} from "@/lib/ready-pieces";

const MAX_PHOTOS = 4;

/** Create when `piece` is undefined, edit in place when it is given. */
export function ReadyPieceModal({
  piece,
  onClose,
  onSaved,
}: {
  piece?: ReadyPiece;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { t, lang } = useLang();
  const [name, setName] = useState(piece?.name ?? "");
  const [category, setCategory] = useState<OrderCategory>(
    piece?.category ?? ORDER_CATEGORIES[0]
  );
  const [size, setSize] = useState(piece?.size || READY_SIZES[2]);
  const [price, setPrice] = useState(piece ? String(piece.price || "") : "");
  const [status, setStatus] = useState<ReadyPieceStatus>(
    piece?.status ?? "available"
  );
  const [heldFor, setHeldFor] = useState(piece?.heldFor ?? "");
  const [addedOn, setAddedOn] = useState(piece?.addedOn || todayKey());
  const [notes, setNotes] = useState(piece?.notes ?? "");
  const [photos, setPhotos] = useState<string[]>(piece?.photos ?? []);
  const [warning, setWarning] = useState<string | null>(null);

  async function handleFiles(fileList: FileList | null) {
    if (!fileList) return;
    setWarning(null);
    const room = MAX_PHOTOS - photos.length;
    const result = await importPhotos(Array.from(fileList), room);
    setWarning(photoWarning(t, result, MAX_PHOTOS, room));
    setPhotos((prev) => [...prev, ...result.photos].slice(0, MAX_PHOTOS));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    const parsedPrice = Number.parseFloat(price.replace(",", "."));
    saveReadyPiece({
      id: piece?.id ?? generateId("rp"),
      name: name.trim(),
      category,
      size,
      price: Number.isFinite(parsedPrice) && parsedPrice > 0 ? parsedPrice : 0,
      status,
      photos,
      notes: notes.trim(),
      addedOn: addedOn || todayKey(),
      heldFor: heldFor.trim(),
      // Stamped the moment it is marked sold, and cleared if it comes back.
      soldOn:
        status === "sold" ? piece?.soldOn || todayKey() : "",
    });
    onSaved();
    onClose();
  }

  const fieldCls =
    "border border-line-strong bg-cream px-3 py-2 text-sm transition-colors focus:outline-none focus:border-moss-deep";
  const labelCls = "text-xs uppercase tracking-[0.1em] text-ink-soft";

  return (
    <div
      className="fixed inset-0 z-[60] bg-ink/50 flex items-start sm:items-center justify-center p-4 sm:p-6 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg my-auto bg-cream border border-line shadow-[0_20px_50px_-20px_rgba(34,30,25,0.5)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-line">
          <h2 className="font-display text-xl">
            {piece ? t("ready.editTitle") : t("ready.newTitle")}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="rp-name" className={labelCls}>
              {t("ready.name")}
            </label>
            <input
              id="rp-name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("ready.namePlaceholder")}
              className={fieldCls}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="rp-category" className={labelCls}>
                {t("ready.category")}
              </label>
              <select
                id="rp-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as OrderCategory)}
                className={fieldCls}
              >
                {ORDER_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {categoryLabel(lang, c)}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="rp-size" className={labelCls}>
                {t("ready.size")}
              </label>
              <select
                id="rp-size"
                value={size}
                onChange={(e) => setSize(e.target.value)}
                className={fieldCls}
              >
                {READY_SIZES.map((s) => (
                  <option key={s} value={s}>
                    {sizeLabel(lang, s)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="rp-price" className={labelCls}>
                {t("ready.price")}
              </label>
              <input
                id="rp-price"
                inputMode="decimal"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0"
                className={`${fieldCls} tabular-nums`}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="rp-added" className={labelCls}>
                {t("ready.addedOn")}
              </label>
              <input
                id="rp-added"
                type="date"
                value={addedOn}
                onChange={(e) => setAddedOn(e.target.value)}
                className={`${fieldCls} tabular-nums`}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="rp-status" className={labelCls}>
                {t("ready.status")}
              </label>
              <select
                id="rp-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as ReadyPieceStatus)}
                className={fieldCls}
              >
                {READY_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {readyStatusLabel(lang, s)}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="rp-held" className={labelCls}>
                {status === "sold" ? t("ready.soldTo") : t("ready.heldFor")}
              </label>
              <input
                id="rp-held"
                value={heldFor}
                onChange={(e) => setHeldFor(e.target.value)}
                className={fieldCls}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="rp-notes" className={labelCls}>
              {t("ready.notes")}
            </label>
            <textarea
              id="rp-notes"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className={`${fieldCls} resize-none`}
            />
          </div>

          <div className="flex flex-col gap-2">
            <span className={labelCls}>
              {t("ready.photos", { max: MAX_PHOTOS })}
            </span>
            {photos.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {photos.map((src, i) => (
                  <div key={src.slice(0, 40) + i} className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element -- uploaded photos are data: URLs, which next/image can't optimize */}
                    <img
                      src={src}
                      alt=""
                      className="h-16 w-16 object-cover border border-line"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setPhotos((prev) => prev.filter((_, n) => n !== i))
                      }
                      aria-label={t("ready.removePhoto")}
                      className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-ink text-cream text-xs leading-none"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
            {photos.length < MAX_PHOTOS && (
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handleFiles(e.target.files)}
                className="text-xs text-ink-soft file:mr-3 file:border file:border-line-strong file:bg-paper file:px-3 file:py-1.5 file:text-xs file:uppercase file:tracking-[0.1em]"
              />
            )}
          </div>

          {warning && <p className="text-sm text-accent">{warning}</p>}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="text-xs uppercase tracking-[0.15em] text-ink-soft hover:text-ink transition-colors px-3 py-2"
            >
              {t("newclient.cancel")}
            </button>
            <button
              type="submit"
              className="bg-accent text-cream px-5 py-2.5 text-xs uppercase tracking-[0.15em] transition-colors hover:bg-accent/85"
            >
              {t("ready.save")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
