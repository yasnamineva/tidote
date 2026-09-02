"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useLang } from "@/lib/i18n";
import { categoryLabel } from "@/lib/translations";
import { importPhotos, photoWarning } from "@/lib/images";
import { ORDER_CATEGORIES, type OrderCategory } from "@/lib/mock-data";

const MAX_PHOTOS = 4;

export function NewOrderForm() {
  const { addOrder } = useAuth();
  const { lang, t } = useLang();
  const router = useRouter();
  const [piece, setPiece] = useState("");
  const [category, setCategory] = useState<OrderCategory>(ORDER_CATEGORIES[0]);
  const [notes, setNotes] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [warning, setWarning] = useState<string | null>(null);

  async function handleFiles(fileList: FileList | null) {
    if (!fileList) return;
    setWarning(null);
    const room = MAX_PHOTOS - photos.length;
    const result = await importPhotos(Array.from(fileList), room);
    setWarning(photoWarning(t, result, MAX_PHOTOS, room));
    setPhotos((prev) => [...prev, ...result.photos].slice(0, MAX_PHOTOS));
  }

  function removePhoto(index: number) {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!piece.trim()) return;
    addOrder({
      piece: piece.trim(),
      category,
      notes: notes.trim() || undefined,
      photos,
    });
    router.push("/dashboard");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border border-line bg-paper px-6 py-8 flex flex-col gap-5 max-w-xl mx-auto"
    >
      <div className="flex flex-col gap-1.5">
        <label htmlFor="piece" className="text-xs uppercase tracking-[0.1em] text-ink-soft">
          {t("neworder.piece")}
        </label>
        <input
          id="piece"
          required
          value={piece}
          onChange={(e) => setPiece(e.target.value)}
          placeholder={t("neworder.piecePlaceholder")}
          className="border border-line-strong bg-cream px-3 py-2 text-sm transition-colors focus:outline-none focus:border-moss-deep"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="category" className="text-xs uppercase tracking-[0.1em] text-ink-soft">
          {t("neworder.category")}
        </label>
        <select
          id="category"
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

      <div className="flex flex-col gap-1.5">
        <label htmlFor="notes" className="text-xs uppercase tracking-[0.1em] text-ink-soft">
          {t("neworder.notes")}
        </label>
        <textarea
          id="notes"
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="border border-line-strong bg-cream px-3 py-2 text-sm transition-colors focus:outline-none focus:border-moss-deep resize-none"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs uppercase tracking-[0.1em] text-ink-soft">
          {t("neworder.refPhotos")}{" "}
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
                {/* eslint-disable-next-line @next/next/no-img-element -- data: URL preview, next/image can't optimize these */}
                <img
                  src={src}
                  alt={`Reference ${i + 1}`}
                  className="h-full w-full object-cover border border-line"
                />
                <button
                  type="button"
                  onClick={() => removePhoto(i)}
                  aria-label="Remove photo"
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
        className="btn-sweep mt-2 bg-ink text-cream px-6 py-3 text-sm uppercase tracking-[0.15em] transition-transform duration-300 hover:-translate-y-0.5"
      >
        {t("neworder.submit")}
      </button>
    </form>
  );
}
