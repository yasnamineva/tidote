import { generateId, type OrderCategory } from "@/lib/mock-data";
import { readJSON, writeJSON } from "@/lib/storage";
import { translate, type Lang } from "@/lib/translations";

/**
 * Finished garments the atelier already has on the rail. Deliberately separate
 * from `Order`: a ready piece has no client, no measurements and no production
 * pipeline — it exists, it has a size, and it is either on the rail, held for
 * someone, or gone. Custom commissions remain the main line of work.
 */

export type ReadyPieceStatus = "available" | "reserved" | "sold";

export const READY_STATUSES: ReadyPieceStatus[] = [
  "available",
  "reserved",
  "sold",
];

export const READY_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "One size"];

export type ReadyPiece = {
  id: string;
  name: string;
  category: OrderCategory;
  size: string;
  /** EUR. 0 means the price is not set yet. */
  price: number;
  status: ReadyPieceStatus;
  photos: string[];
  notes: string;
  /** "YYYY-MM-DD" — when the piece was finished and put on the rail. */
  addedOn: string;
  /** Free text: who it is being held for, or who bought it. */
  heldFor: string;
  /** "YYYY-MM-DD", empty until the piece is marked sold. */
  soldOn: string;
};

const READY_KEY = "tidote_ready_pieces";

export const SEED_READY_PIECES: ReadyPiece[] = [
  {
    id: "rp-seed-1",
    name: "Olive Cargo Set",
    category: "Cargo Set",
    size: "M",
    price: 310,
    status: "available",
    photos: ["/photos/gallery-4.jpg"],
    notes: "Sample from the last run — never worn.",
    addedOn: "2026-07-14",
    heldFor: "",
    soldOn: "",
  },
  {
    id: "rp-seed-2",
    name: "Panelled Track Jacket",
    category: "Jacket",
    size: "L",
    price: 230,
    status: "available",
    photos: ["/photos/men-2.jpg"],
    notes: "",
    addedOn: "2026-07-28",
    heldFor: "",
    soldOn: "",
  },
  {
    id: "rp-seed-3",
    name: "Gold Graphic Hoodie",
    category: "Hoodie",
    size: "S",
    price: 190,
    status: "reserved",
    photos: ["/photos/casual-5.jpg"],
    notes: "Held until Friday.",
    addedOn: "2026-08-02",
    heldFor: "Mila",
    soldOn: "",
  },
  {
    id: "rp-seed-4",
    name: "Reworked Graphic Tee",
    category: "T-Shirt",
    size: "One size",
    price: 90,
    status: "sold",
    photos: ["/photos/gallery-7.jpg"],
    notes: "",
    addedOn: "2026-06-30",
    heldFor: "Kaloyan Ivanov",
    soldOn: "2026-08-11",
  },
];

/** Storage may hold rows from an older shape, so every field gets a floor. */
function normalize(raw: Partial<ReadyPiece>): ReadyPiece {
  const status = READY_STATUSES.includes(raw.status as ReadyPieceStatus)
    ? (raw.status as ReadyPieceStatus)
    : "available";
  return {
    id: raw.id ?? generateId("rp"),
    name: raw.name ?? "",
    category: (raw.category as OrderCategory) ?? "Accessory",
    size: raw.size ?? "",
    price: Number.isFinite(raw.price) ? Number(raw.price) : 0,
    status,
    photos: Array.isArray(raw.photos) ? raw.photos : [],
    notes: raw.notes ?? "",
    addedOn: raw.addedOn ?? "",
    heldFor: raw.heldFor ?? "",
    soldOn: raw.soldOn ?? "",
  };
}

/** Newest on the rail first. */
export function getReadyPieces(): ReadyPiece[] {
  return readJSON<Partial<ReadyPiece>[]>(READY_KEY, SEED_READY_PIECES)
    .map(normalize)
    .sort((a, b) => (a.addedOn < b.addedOn ? 1 : -1));
}

function persist(pieces: ReadyPiece[]): ReadyPiece[] {
  writeJSON(READY_KEY, pieces);
  return pieces.sort((a, b) => (a.addedOn < b.addedOn ? 1 : -1));
}

/** Insert or update in place, keyed on id. */
export function saveReadyPiece(piece: ReadyPiece): ReadyPiece[] {
  const current = getReadyPieces();
  const exists = current.some((p) => p.id === piece.id);
  return persist(
    exists
      ? current.map((p) => (p.id === piece.id ? piece : p))
      : [piece, ...current]
  );
}

export function deleteReadyPiece(id: string): ReadyPiece[] {
  return persist(getReadyPieces().filter((p) => p.id !== id));
}

/**
 * Marking a piece sold stamps the date, because the finance view reports sales
 * by the month they happened in. Moving it back onto the rail clears the stamp
 * so it stops counting as income.
 */
export function setReadyPieceStatus(
  id: string,
  status: ReadyPieceStatus,
  today: string
): ReadyPiece[] {
  return persist(
    getReadyPieces().map((p) =>
      p.id === id
        ? {
            ...p,
            status,
            soldOn: status === "sold" ? p.soldOn || today : "",
          }
        : p
    )
  );
}

export type ReadyStockSummary = {
  available: number;
  reserved: number;
  sold: number;
  /** What is still on the rail, at asking price. */
  stockValue: number;
  soldValue: number;
};

export function summarizeReadyStock(pieces: ReadyPiece[]): ReadyStockSummary {
  const by = (s: ReadyPieceStatus) => pieces.filter((p) => p.status === s);
  const sum = (list: ReadyPiece[]) =>
    list.reduce((total, p) => total + p.price, 0);
  const available = by("available");
  const reserved = by("reserved");
  const sold = by("sold");
  return {
    available: available.length,
    reserved: reserved.length,
    sold: sold.length,
    // Reserved pieces are still unsold stock, so they count toward its value.
    stockValue: sum(available) + sum(reserved),
    soldValue: sum(sold),
  };
}

export function readyStatusLabel(lang: Lang, status: string): string {
  return translate(lang, `ready.status.${status}`);
}

/** Numeric sizes pass through; only the named one needs translating. */
export function sizeLabel(lang: Lang, size: string): string {
  return size === "One size" ? translate(lang, "ready.oneSize") : size;
}
