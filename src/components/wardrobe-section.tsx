"use client";

import { useState } from "react";
import { useLang } from "@/lib/i18n";
import { categoryLabel } from "@/lib/translations";
import { ORDER_CATEGORIES, type OrderCategory, type OwnedItem } from "@/lib/mock-data";

const MAX_PHOTOS = 4;
const MAX_FILE_BYTES = 1.5 * 1024 * 1024;

type AddInput = {
  name: string;
  category: OrderCategory;
  notes?: string;
  photos: string[];
};

export function WardrobeSection({
  items,
  editable,
  onAdd,
  onRemove,
}: {
  items: OwnedItem[];
  editable: boolean;
  onAdd?: (input: AddInput) => void;
  onRemove?: (id: string) => void;
}) {
  const { lang, t } = useLang();

  const [name, setName] = useState("");
  const [category, setCategory] = useState<OrderCategory>(ORDER_CATEGORIES[0]);
  const [notes, setNotes] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [warning, setWarning] = useState<string | null>(null);

  function handleFiles(fileList: FileList | null) {
    if (!fileList) return;
    setWarning(null);
    const room = MAX_PHOTOS - photos.length;
    if (fileList.length > room) {
      setWarning(t("neworder.warnMax", { max: MAX_PHOTOS, room }));
    }
    Array.from(fileList)
      .slice(0, room)
      .forEach((file) => {
        if (file.size > MAX_FILE_BYTES) {
          setWarning(t("neworder.warnLarge", { name: file.name }));
          return;
        }
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === "string") {
            setPhotos((prev) =>
              prev.length >= MAX_PHOTOS ? prev : [...prev, reader.result as string]
            );
          }
        };
        reader.readAsDataURL(file);
      });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd?.({
      name: name.trim(),
      category,
      notes: notes.trim() || undefined,
      photos,
    });
    setName("");
    setCategory(ORDER_CATEGORIES[0]);
    setNotes("");
    setPhotos([]);
    setWarning(null);
  }

  return (
    <div className="flex flex-col gap-6">
      {items.length === 0 ? (
        <p className="text-sm text-ink-soft border border-line bg-paper px-6 py-8 text-center">
          {editable ? t("wardrobe.empty") : t("wardrobe.emptyAdmin")}
        </p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="relative border border-line bg-paper flex flex-col"
            >
              <div className="aspect-[3/4] overflow-hidden bg-line/20">
                {item.photos.length > 0 ? (
                  // eslint-disable-next-line @next/next/no-img-element -- data: URL uploads
                  <img
                    src={item.photos[0]}
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-[10px] uppercase tracking-[0.15em] text-ink-soft">
                    {t("thumb.noPhoto")}
                  </div>
                )}
              </div>
              <div className="px-3 py-3 flex flex-col gap-1.5">
                <span className="inline-block w-fit text-[10px] uppercase tracking-[0.15em] px-2.5 py-1 rounded-full bg-line/50 text-ink-soft">
                  {categoryLabel(lang, item.category)}
                </span>
                <p className="font-display text-base leading-tight">{item.name}</p>
                {item.notes && (
                  <p className="text-xs text-ink-soft italic">{item.notes}</p>
                )}
              </div>
              {editable && (
                <button
                  type="button"
                  onClick={() => onRemove?.(item.id)}
                  aria-label={t("wardrobe.remove")}
                  className="absolute top-2 right-2 h-6 w-6 rounded-full bg-ink/90 text-cream text-sm leading-none flex items-center justify-center hover:bg-accent transition-colors"
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
                    {/* eslint-disable-next-line @next/next/no-img-element -- data: URL preview */}
                    <img
                      src={src}
                      alt={`${t("wardrobe.photos")} ${i + 1}`}
                      className="h-full w-full object-cover border border-line"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setPhotos((prev) => prev.filter((_, j) => j !== i))
                      }
                      aria-label={t("wardrobe.remove")}
                      className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-ink text-cream text-xs leading-none flex items-center justify-center"
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
            className="btn-sweep w-fit bg-ink text-cream px-6 py-2.5 text-xs uppercase tracking-[0.15em] transition-transform duration-300 hover:-translate-y-0.5"
          >
            {t("wardrobe.add")}
          </button>
        </form>
      )}
    </div>
  );
}
