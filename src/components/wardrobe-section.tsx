"use client";

import { useState } from "react";
import { Photo } from "@/components/photo";
import { useLang } from "@/lib/i18n";
import { categoryLabel, pieceLabel } from "@/lib/translations";
import { photoWarning } from "@/lib/images";
import { deletePhotos, importAndUpload } from "@/lib/photos";
import {
  ORDER_CATEGORIES,
  type Order,
  type OrderCategory,
  type OwnedItem,
} from "@/lib/mock-data";

const MAX_PHOTOS = 4;

type AddInput = {
  name: string;
  category: OrderCategory;
  notes?: string;
  photos: string[];
};

/** One tile in the grid, whichever of the two places it came from. */
type WardrobeCard = {
  key: string;
  name: string;
  category: OrderCategory;
  photo?: string;
  notes?: string;
  /** We made it and handed it over, so it is hers to keep but not to delete. */
  fromAtelier: boolean;
  removeId?: string;
};

export function WardrobeSection({
  items,
  ownerId,
  orders = [],
  editable,
  onAdd,
  onRemove,
}: {
  items: OwnedItem[];
  /** Whose wardrobe this is; uploads are filed under their id. */
  ownerId: string;
  /** Orders to fold in — the delivered ones are part of the wardrobe too. */
  orders?: Order[];
  editable: boolean;
  /** May be async: both callers write to the database. */
  onAdd?: (input: AddInput) => void | Promise<void>;
  onRemove?: (id: string) => void | Promise<void>;
}) {
  const { lang, t } = useLang();
  const [saving, setSaving] = useState(false);
  const [failed, setFailed] = useState<string | null>(null);

  // A piece that has arrived is something she owns; making her re-enter it by
  // hand would be asking her to type back what we already know.
  const delivered: WardrobeCard[] = orders
    .filter(
      (o) =>
        o.reviewStatus === "accepted" &&
        o.status === "delivered" &&
        !o.returnedOn
    )
    .map((o) => ({
      key: `order-${o.id}`,
      name: pieceLabel(lang, o.piece),
      category: o.category,
      // Their own photo of the finished piece says more than our reference shot.
      photo: o.wearPhotos?.[0] ?? o.photos[0],
      fromAtelier: true,
    }));

  const added: WardrobeCard[] = items.map((item) => ({
    key: item.id,
    name: item.name,
    category: item.category,
    photo: item.photos[0],
    notes: item.notes,
    fromAtelier: false,
    removeId: item.id,
  }));

  const cards = [...delivered, ...added];

  const [name, setName] = useState("");
  const [category, setCategory] = useState<OrderCategory>(ORDER_CATEGORIES[0]);
  const [notes, setNotes] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [warning, setWarning] = useState<string | null>(null);

  async function handleFiles(fileList: FileList | null) {
    if (!fileList) return;
    setWarning(null);
    const room = MAX_PHOTOS - photos.length;
    let result;
    try {
      result = await importAndUpload(Array.from(fileList), room, ownerId);
    } catch {
      // The file never reached storage. Without this the failure was an
      // unhandled rejection: no photo, no message, nothing to do about it.
      setWarning(t("photo.uploadFailed"));
      return;
    }
    setWarning(photoWarning(t, result, MAX_PHOTOS, room));
    setPhotos((prev) => [...prev, ...result.photos].slice(0, MAX_PHOTOS));
  }

  /** A draft photo is already uploaded, so removing it has to remove the file. */
  function dropDraftPhoto(index: number) {
    const dropped = photos[index];
    setPhotos((prev) => prev.filter((_, i) => i !== index));
    if (dropped) void deletePhotos([dropped]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (saving || !name.trim()) return;
    setSaving(true);
    setFailed(null);
    try {
      await onAdd?.({
        name: name.trim(),
        category,
        notes: notes.trim() || undefined,
        photos,
      });
    } catch {
      // The form used to empty itself the instant you pressed the button, so a
      // failed write took the typed description with it and left no trace.
      setFailed(t("common.saveFailed"));
      return;
    } finally {
      setSaving(false);
    }
    setName("");
    setCategory(ORDER_CATEGORIES[0]);
    setNotes("");
    setPhotos([]);
    setWarning(null);
  }

  async function handleRemove(id: string) {
    setFailed(null);
    try {
      await onRemove?.(id);
    } catch {
      setFailed(t("common.saveFailed"));
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {cards.length === 0 ? (
        <p className="text-sm text-ink-soft border border-line bg-paper px-6 py-8 text-center">
          {editable ? t("wardrobe.empty") : t("wardrobe.emptyAdmin")}
        </p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {cards.map((card) => (
            <div
              key={card.key}
              className="relative border border-line bg-paper flex flex-col"
            >
              <div className="aspect-[3/4] overflow-hidden bg-line/20">
                {card.photo ? (
                  <Photo
                    src={card.photo}
                    alt={card.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-[10px] uppercase tracking-[0.15em] text-ink-soft">
                    {t("thumb.noPhoto")}
                  </div>
                )}
              </div>
              <div className="px-3 py-3 flex flex-col gap-1.5">
                {/* max-w-full: `flex-wrap` cannot break a single pill, so on a
                    two-column grid at 320px a long category name printed
                    across the card next to it. */}
                <div className="flex min-w-0 flex-wrap gap-1.5">
                  <span className="inline-block w-fit max-w-full break-words text-[10px] uppercase tracking-[0.15em] px-2.5 py-1 rounded-full bg-line/50 text-ink-soft">
                    {categoryLabel(lang, card.category)}
                  </span>
                  {card.fromAtelier && (
                    <span className="inline-block w-fit max-w-full break-words text-[10px] uppercase tracking-[0.15em] px-2.5 py-1 rounded-full bg-moss-soft text-moss-deep">
                      {t("wardrobe.fromAtelier")}
                    </span>
                  )}
                </div>
                <p className="font-display text-base leading-tight">{card.name}</p>
                {card.notes && (
                  <p className="text-xs text-ink-soft italic">{card.notes}</p>
                )}
              </div>
              {editable && card.removeId && (
                <button
                  type="button"
                  onClick={() => void handleRemove(card.removeId!)}
                  aria-label={t("wardrobe.remove")}
                  className="absolute top-2 right-2 h-6 w-6 rounded-full bg-ink/90 text-cream text-sm leading-none flex items-center justify-center hover:bg-accent transition-colors before:absolute before:left-1/2 before:top-1/2 before:h-11 before:w-11 before:-translate-x-1/2 before:-translate-y-1/2 before:content-['']"
                >
                  &times;
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {editable && (
        <form
          onSubmit={handleSubmit}
          className="border border-line bg-paper px-6 py-6 flex flex-col gap-4"
        >
          <p className="text-xs uppercase tracking-[0.2em] text-moss-deep pb-2 border-b border-line">
            {t("wardrobe.addTitle")}
          </p>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="wardrobe-name"
                className="text-xs uppercase tracking-[0.1em] text-ink-soft"
              >
                {t("wardrobe.name")}
              </label>
              <input
                id="wardrobe-name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("wardrobe.namePlaceholder")}
                className="border border-line-strong bg-cream px-3 py-2 text-sm transition-colors focus:outline-none focus:border-moss-deep"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="wardrobe-category"
                className="text-xs uppercase tracking-[0.1em] text-ink-soft"
              >
                {t("wardrobe.category")}
              </label>
              <select
                id="wardrobe-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as OrderCategory)}
                className="border border-line-strong bg-cream px-3 py-2 text-sm transition-colors focus:outline-none focus:border-moss-deep"
              >
                {ORDER_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {categoryLabel(lang, c)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="wardrobe-notes"
              className="text-xs uppercase tracking-[0.1em] text-ink-soft"
            >
              {t("wardrobe.notes")}
            </label>
            <textarea
              id="wardrobe-notes"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="border border-line-strong bg-cream px-3 py-2 text-sm transition-colors focus:outline-none focus:border-moss-deep resize-none"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-[0.1em] text-ink-soft">
              {t("wardrobe.photos")}{" "}
              <span className="normal-case text-ink-soft/70">
                {t("neworder.optional", { n: MAX_PHOTOS })}
              </span>
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleFiles(e.target.files)}
              disabled={photos.length >= MAX_PHOTOS}
              className="text-sm file:mr-4 file:border file:border-line file:bg-cream file:px-3 file:py-1.5 file:text-xs file:uppercase file:tracking-[0.1em] file:cursor-pointer disabled:opacity-50"
            />
            {warning && <p className="text-xs text-accent">{warning}</p>}
            {photos.length > 0 && (
              <div className="grid grid-cols-4 gap-2 mt-1">
                {photos.map((src, i) => (
                  <div key={i} className="relative aspect-square">
                                        <Photo
                      src={src}
                      alt={`${t("wardrobe.photos")} ${i + 1}`}
                      className="h-full w-full object-cover border border-line"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        dropDraftPhoto(i)
                      }
                      aria-label={t("wardrobe.remove")}
                      className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-ink text-cream text-xs leading-none flex items-center justify-center before:absolute before:left-1/2 before:top-1/2 before:h-11 before:w-11 before:-translate-x-1/2 before:-translate-y-1/2 before:content-['']"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={saving}
            className="btn-sweep w-fit bg-ink text-cream px-6 py-2.5 text-xs uppercase tracking-[0.15em] transition-transform duration-300 hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0"
          >
            {saving ? t("common.saving") : t("wardrobe.add")}
          </button>
          {failed && (
            <p role="alert" className="text-sm text-accent">
              {failed}
            </p>
          )}
        </form>
      )}
    </div>
  );
}
