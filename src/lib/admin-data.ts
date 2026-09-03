import type { Client, OrderNoteAuthor, OrderStatus } from "@/lib/mock-data";
import { getBaseClientById, getBaseClients } from "@/lib/clients";
import { todayKey } from "@/lib/hours";
import { parseTotal } from "@/lib/analytics";
import { removeReturnedPiece, saveReadyPiece } from "@/lib/ready-pieces";
import { appendMessage } from "@/lib/messages";
import { pushNotification } from "@/lib/notifications-data";
import { getSupabase } from "@/lib/supabase/client";
import {
  getStoredLang,
  pieceLabel,
  statusLabel,
  translate,
} from "@/lib/translations";

/**
 * The studio's side of a client's record.
 *
 * Every function here used to read a localStorage key, change it, and write it
 * back. They now go to Postgres, and the access rules live in the database
 * rather than in the fact that the studio panel is the only page that calls
 * them — which was never a rule at all.
 */
export async function getClientWithLiveData(
  clientId: string
): Promise<Client | undefined> {
  return getBaseClientById(clientId);
}

export async function getAllClientsWithLiveData(): Promise<Client[]> {
  return getBaseClients();
}

function adminOrderHref(clientId: string, orderId: string) {
  return `/admin/orders/${clientId}/${orderId}`;
}

/** Reads one order back with its client, for the notification text. */
async function orderContext(orderId: string) {
  const { data, error } = await getSupabase()
    .from("orders")
    .select("id,piece,total,category,photos,profile_id,profiles(name)")
    .eq("id", orderId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return undefined;
  const profiles = data.profiles as unknown as { name: string } | { name: string }[] | null;
  return {
    clientId: data.profile_id as string,
    clientName: (Array.isArray(profiles) ? profiles[0]?.name : profiles?.name) ?? "",
    piece: data.piece as string,
    total: data.total as string,
    category: data.category as string,
    photos: (data.photos as string[] | null) ?? [],
  };
}

export async function updateOrderStatus(
  clientId: string,
  orderId: string,
  status: OrderStatus
): Promise<Client | undefined> {
  const context = await orderContext(orderId);
  if (!context) return undefined;
  const { error } = await getSupabase()
    .from("orders")
    .update({ status })
    .eq("id", orderId);
  if (error) throw error;
  const lang = getStoredLang();
  await pushNotification("client", clientId, {
    kind: "status_changed",
    text: translate(lang, "gen.notif.statusChanged", {
      piece: pieceLabel(lang, context.piece),
      status: statusLabel(lang, status),
    }),
    href: `/dashboard/orders/${orderId}`,
  });
  return getClientWithLiveData(clientId);
}

export async function updateOrderDeadline(
  clientId: string,
  orderId: string,
  eta: string
): Promise<Client | undefined> {
  const context = await orderContext(orderId);
  if (!context) return undefined;
  const { error } = await getSupabase()
    .from("orders")
    .update({ eta })
    .eq("id", orderId);
  if (error) throw error;
  const lang = getStoredLang();
  await pushNotification("client", clientId, {
    kind: "status_changed",
    text: translate(lang, "gen.notif.deadline", {
      piece: pieceLabel(lang, context.piece),
      eta,
    }),
    href: `/dashboard/orders/${orderId}`,
  });
  return getClientWithLiveData(clientId);
}

export async function acceptOrder(
  clientId: string,
  orderId: string,
  price: string,
  eta?: string
): Promise<Client | undefined> {
  const context = await orderContext(orderId);
  if (!context) return undefined;
  const total = `€${price.trim()}`;
  const trimmedEta = eta?.trim();
  const patch: Record<string, unknown> = { review_status: "accepted", total };
  if (trimmedEta) patch.eta = trimmedEta;
  const { error } = await getSupabase()
    .from("orders")
    .update(patch)
    .eq("id", orderId);
  if (error) throw error;

  const lang = getStoredLang();
  const piece = pieceLabel(lang, context.piece);
  await appendMessage(
    clientId,
    "studio",
    translate(lang, "gen.msg.accepted", { piece, total })
  );
  await pushNotification("client", clientId, {
    kind: "order_reviewed",
    text: translate(lang, "gen.notif.acceptedClient", { piece, total }),
    href: `/dashboard/orders/${orderId}`,
  });
  return getClientWithLiveData(clientId);
}

export async function denyOrder(
  clientId: string,
  orderId: string,
  reason?: string
): Promise<Client | undefined> {
  const context = await orderContext(orderId);
  if (!context) return undefined;
  const { error } = await getSupabase()
    .from("orders")
    .update({ review_status: "denied" })
    .eq("id", orderId);
  if (error) throw error;

  const lang = getStoredLang();
  const piece = pieceLabel(lang, context.piece);
  const trimmedReason = reason?.trim();
  await appendMessage(
    clientId,
    "studio",
    translate(lang, "gen.msg.denied", {
      piece,
      reason: trimmedReason ? ` ${trimmedReason}` : "",
    })
  );
  await pushNotification("client", clientId, {
    kind: "order_reviewed",
    text: translate(lang, "gen.notif.deniedClient", { piece }),
    href: `/dashboard/orders/${orderId}`,
  });
  return getClientWithLiveData(clientId);
}

export async function appendOrderNote(
  clientId: string,
  orderId: string,
  author: OrderNoteAuthor,
  text: string,
  photos: string[]
): Promise<Client | undefined> {
  const context = await orderContext(orderId);
  if (!context) return undefined;
  const { error } = await getSupabase()
    .from("order_notes")
    .insert({ order_id: orderId, author, text, photos });
  if (error) throw error;

  const lang = getStoredLang();
  const piece = pieceLabel(lang, context.piece);
  if (author === "client") {
    await pushNotification("admin", clientId, {
      kind: "order_note",
      text: translate(lang, "gen.notif.noteFromClient", {
        name: context.clientName,
        piece,
      }),
      href: adminOrderHref(clientId, orderId),
    });
  } else {
    await pushNotification("client", clientId, {
      kind: "order_note",
      text: translate(lang, "gen.notif.noteFromStudio", { piece }),
      href: `/dashboard/orders/${orderId}`,
    });
  }
  return getClientWithLiveData(clientId);
}

export type ReturnOptions = {
  /** Put the piece straight back on the rail. On unless she says otherwise. */
  toStock: boolean;
  size: string;
  /** EUR asking price. Empty falls back to what the order was billed at. */
  price: string;
};

/**
 * The client changed their mind and the garment came back.
 *
 * Recording the return does two things at once, because in the workshop they
 * are one thing: the piece stops being the client's — it leaves their wardrobe
 * and stops counting as income — and, unless she says otherwise, it goes onto
 * the rail as stock, since a finished garment nobody owns is exactly what the
 * In Stock page is for.
 */
export async function returnOrder(
  clientId: string,
  orderId: string,
  options: ReturnOptions
): Promise<Client | undefined> {
  const context = await orderContext(orderId);
  if (!context) return undefined;

  const today = todayKey();
  const { error } = await getSupabase()
    .from("orders")
    .update({ returned_on: today })
    .eq("id", orderId)
    .is("returned_on", null);
  if (error) throw error;

  if (options.toStock) {
    const asked = Number.parseFloat(options.price.replace(",", "."));
    await saveReadyPiece({
      id: "",
      name: context.piece,
      category: context.category as never,
      size: options.size,
      price:
        Number.isFinite(asked) && asked > 0 ? asked : parseTotal(context.total),
      status: "available",
      // The studio's own reference shots, never the client's photos of
      // themselves — those are theirs and carry their own permission.
      photos: context.photos,
      notes: "",
      addedOn: today,
      heldFor: "",
      soldOn: "",
      fromOrderId: orderId,
    });
  }

  const lang = getStoredLang();
  await pushNotification("client", clientId, {
    kind: "status_changed",
    text: translate(lang, "gen.notif.returned", {
      piece: pieceLabel(lang, context.piece),
    }),
    href: `/dashboard/orders/${orderId}`,
  });
  return getClientWithLiveData(clientId);
}

/** Undo a return recorded by mistake, taking the rail piece back off with it. */
export async function undoOrderReturn(
  clientId: string,
  orderId: string
): Promise<{ client?: Client; stockRemoved: boolean }> {
  const { error } = await getSupabase()
    .from("orders")
    .update({ returned_on: null })
    .eq("id", orderId);
  if (error) throw error;
  const stockRemoved = await removeReturnedPiece(orderId);
  return { client: await getClientWithLiveData(clientId), stockRemoved };
}

export async function sendStudioMessage(clientId: string, text: string) {
  const messages = await appendMessage(clientId, "studio", text);
  await pushNotification("client", clientId, {
    kind: "message",
    text: translate(getStoredLang(), "gen.notif.msgFromStudio"),
    href: "/dashboard#messages",
  });
  return messages;
}
