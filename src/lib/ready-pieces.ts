import type { OrderCategory } from "@/lib/mock-data";
import { getSupabase } from "@/lib/supabase/client";
import { deletePhotos } from "@/lib/photos";
import { toReadyPiece, type ReadyPieceRow } from "@/lib/supabase/rows";
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
  /**
   * The order this piece came back from, when it reached the rail as a return.
   * Studio-side provenance only — it is never shown on the public page, and it
   * is what lets an undone return take its piece back off the rail.
   */
  fromOrderId: string;
};

/** Columns the studio may see. The rail table is admin-only under RLS. */
const STUDIO_COLUMNS =
  "id,name,category,size,price,status,photos,notes,held_for,from_order_id,added_on,sold_on";

/** Newest on the rail first. */
export async function getReadyPieces(): Promise<ReadyPiece[]> {
  const { data, error } = await getSupabase()
    .from("ready_pieces")
    .select(STUDIO_COLUMNS)
    .order("added_on", { ascending: false });
  if (error) throw error;
  return (data as unknown as ReadyPieceRow[]).map(toReadyPiece);
}

/**
 * What /in-stock shows a stranger. This reads the `public_stock` view, which
 * has no column for the buyer's name or the studio's notes and drops sold
 * pieces outright — so the privacy of the rail is a property of the database
 * rather than of remembering to leave fields out of the markup.
 */
export async function getPublicStock(): Promise<ReadyPiece[]> {
  const { data, error } = await getSupabase()
    .from("public_stock")
    .select("id,name,category,size,price,status,photos,added_on")
    .order("added_on", { ascending: false });
  if (error) throw error;
  return (data as unknown as ReadyPieceRow[]).map(toReadyPiece);
}

function toRow(piece: ReadyPiece) {
  return {
    name: piece.name,
    category: piece.category,
    size: piece.size,
    price: piece.price,
    status: piece.status,
    photos: piece.photos,
    notes: piece.notes,
    held_for: piece.heldFor,
    from_order_id: piece.fromOrderId || null,
    added_on: piece.addedOn,
    sold_on: piece.soldOn || null,
  };
}

/** Insert or update in place, keyed on id. */
export async function saveReadyPiece(piece: ReadyPiece): Promise<ReadyPiece[]> {
  const supabase = getSupabase();
  const row = toRow(piece);
  // A piece created in the browser has no database id yet; let Postgres mint it
  // rather than inventing one the database then has to trust.
  const { error } = piece.id
    ? await supabase.from("ready_pieces").update(row).eq("id", piece.id)
    : await supabase.from("ready_pieces").insert(row);
  if (error) throw error;
  return getReadyPieces();
}

export async function deleteReadyPiece(id: string): Promise<ReadyPiece[]> {
  const supabase = getSupabase();
  // Read the photos before the row goes, or there is nothing left to say which
  // files in the bucket belonged to it.
  const { data: existing } = await supabase
    .from("ready_pieces")
    .select("photos,from_order_id")
    .eq("id", id)
    .maybeSingle();
  const { error } = await supabase.from("ready_pieces").delete().eq("id", id);
  if (error) throw error;
  // A returned piece carries copies of the order's reference shots, and the
  // order still needs those, so only a piece of its own is cleared up.
  if (!existing?.from_order_id && existing?.photos?.length) {
    await deletePhotos(existing.photos as string[]);
  }
  return getReadyPieces();
}

export async function getReadyPieceByOrder(
  orderId: string
): Promise<ReadyPiece | undefined> {
  const { data, error } = await getSupabase()
    .from("ready_pieces")
    .select(STUDIO_COLUMNS)
    .eq("from_order_id", orderId)
    .maybeSingle();
  if (error) throw error;
  return data ? toReadyPiece(data as unknown as ReadyPieceRow) : undefined;
}

/**
 * Undoing a return should leave no trace on the rail, but only if nothing has
 * happened to the piece since — a sold piece stays sold, whatever the paperwork
 * says.
 */
export async function removeReturnedPiece(orderId: string): Promise<boolean> {
  const piece = await getReadyPieceByOrder(orderId);
  if (!piece || piece.status === "sold") return false;
  await deleteReadyPiece(piece.id);
  return true;
}

/**
 * Marking a piece sold stamps the date, because the finance view reports sales
 * by the month they happened in. Moving it back onto the rail clears the stamp
 * so it stops counting as income.
 */
export async function setReadyPieceStatus(
  id: string,
  status: ReadyPieceStatus,
  today: string
): Promise<ReadyPiece[]> {
  const supabase = getSupabase();
  const { data: current, error: readError } = await supabase
    .from("ready_pieces")
    .select("sold_on")
    .eq("id", id)
    .single();
  if (readError) throw readError;
  const { error } = await supabase
    .from("ready_pieces")
    .update({
      status,
      sold_on: status === "sold" ? (current?.sold_on ?? today) : null,
    })
    .eq("id", id);
  if (error) throw error;
  return getReadyPieces();
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
