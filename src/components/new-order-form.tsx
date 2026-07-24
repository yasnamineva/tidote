"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { ORDER_CATEGORIES, type OrderCategory } from "@/lib/mock-data";

const MAX_PHOTOS = 4;
const MAX_FILE_BYTES = 1.5 * 1024 * 1024;

export function NewOrderForm() {
  const { addOrder } = useAuth();
  const router = useRouter();
  const [piece, setPiece] = useState("");
  const [category, setCategory] = useState<OrderCategory>(ORDER_CATEGORIES[0]);
  const [notes, setNotes] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [warning, setWarning] = useState<string | null>(null);

  function handleFiles(fileList: FileList | null) {
    if (!fileList) return;
    const files = Array.from(fileList);
    setWarning(null);

    const room = MAX_PHOTOS - photos.length;
    if (files.length > room) {
      setWarning(
        `You can attach up to ${MAX_PHOTOS} reference photos — only the first ${room} were added.`
      );
    }

    files.slice(0, room).forEach((file) => {
      if (file.size > MAX_FILE_BYTES) {
        setWarning(`"${file.name}" is too large (max 1.5MB) — skipped.`);
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
          Piece Name
        </label>
        <input
          id="piece"
          required
          value={piece}
          onChange={(e) => setPiece(e.target.value)}
          placeholder="e.g. Oversized Denim Jacket"
          className="border border-line bg-cream px-3 py-2 text-sm transition-colors focus:outline-none focus:border-moss-deep"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="category" className="text-xs uppercase tracking-[0.1em] text-ink-soft">
          Category
        </label>
        <select
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value as OrderCategory)}
          className="border border-line bg-cream px-3 py-2 text-sm transition-colors focus:outline-none focus:border-moss-deep"
        >
          {ORDER_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="notes" className="text-xs uppercase tracking-[0.1em] text-ink-soft">
          Notes (fabric, fit, colour&hellip;)
        </label>
        <textarea
          id="notes"
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="border border-line bg-cream px-3 py-2 text-sm transition-colors focus:outline-none focus:border-moss-deep resize-none"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs uppercase tracking-[0.1em] text-ink-soft">
          Reference Photos{" "}
          <span className="normal-case text-ink-soft/70">
            (optional, up to {MAX_PHOTOS})
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
        Place Order
      </button>
    </form>
  );
}
