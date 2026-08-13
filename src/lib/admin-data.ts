import {
  generateId,
  mergeOrdersWithSeed,
  type Client,
  type OrderNote,
  type OrderNoteAuthor,
  type OrderStatus,
} from "@/lib/mock-data";
import {
  deliveryKey,
  itemsKey,
  measurementsKey,
  ordersKey,
  readJSON,
  writeJSON,
} from "@/lib/storage";
import { getBaseClientById, getBaseClients } from "@/lib/clients";
import { appendMessage } from "@/lib/messages";
import { pushNotification } from "@/lib/notifications-data";
import {
  getStoredLang,
  pieceLabel,
  statusLabel,
  translate,
} from "@/lib/translations";

export function getClientWithLiveData(clientId: string): Client | undefined {
  const seed = getBaseClientById(clientId);
  if (!seed) return undefined;
  return {
    ...seed,
    orders: mergeOrdersWithSeed(
      readJSON(ordersKey(clientId), seed.orders),
      seed.orders
    ),
    measurements: readJSON(measurementsKey(clientId), seed.measurements),
    delivery: readJSON(deliveryKey(clientId), seed.delivery),
    items: readJSON(itemsKey(clientId), seed.items),
  };
}

export function getAllClientsWithLiveData(): Client[] {
  return getBaseClients().map((c) => getClientWithLiveData(c.id)!);
}

function adminOrderHref(clientId: string, orderId: string) {
  return `/admin/orders/${clientId}/${orderId}`;
}

export function updateOrderStatus(
  clientId: string,
  orderId: string,
  status: OrderStatus
): Client | undefined {
  const client = getClientWithLiveData(clientId);
  if (!client) return undefined;
  const order = client.orders.find((o) => o.id === orderId);
  if (!order) return undefined;
  const nextOrders = client.orders.map((o) =>
    o.id === orderId ? { ...o, status } : o
  );
  writeJSON(ordersKey(clientId), nextOrders);
  const lang = getStoredLang();
  pushNotification("client", clientId, {
    kind: "status_changed",
    text: translate(lang, "gen.notif.statusChanged", {
      piece: pieceLabel(lang, order.piece),
      status: statusLabel(lang, status),
    }),
    href: `/dashboard/orders/${orderId}`,
  });
  return { ...client, orders: nextOrders };
}

export function updateOrderDeadline(
  clientId: string,
  orderId: string,
  eta: string
): Client | undefined {
  const client = getClientWithLiveData(clientId);
  if (!client) return undefined;
  const order = client.orders.find((o) => o.id === orderId);
  if (!order) return undefined;
  const nextOrders = client.orders.map((o) =>
    o.id === orderId ? { ...o, eta } : o
  );
  writeJSON(ordersKey(clientId), nextOrders);
  const lang = getStoredLang();
  pushNotification("client", clientId, {
    kind: "status_changed",
    text: translate(lang, "gen.notif.deadline", {
      piece: pieceLabel(lang, order.piece),
      eta,
    }),
    href: `/dashboard/orders/${orderId}`,
  });
  return { ...client, orders: nextOrders };
}

export function acceptOrder(
  clientId: string,
  orderId: string,
  price: string,
  eta?: string
): Client | undefined {
  const client = getClientWithLiveData(clientId);
  if (!client) return undefined;
  const order = client.orders.find((o) => o.id === orderId);
  if (!order) return undefined;
  const total = `€${price.trim()}`;
  const trimmedEta = eta?.trim();
  const nextOrders = client.orders.map((o) =>
    o.id === orderId
      ? {
          ...o,
          reviewStatus: "accepted" as const,
          total,
          eta: trimmedEta || o.eta,
        }
      : o
  );
  writeJSON(ordersKey(clientId), nextOrders);
  const lang = getStoredLang();
  const piece = pieceLabel(lang, order.piece);
  appendMessage(
    clientId,
    "studio",
    translate(lang, "gen.msg.accepted", { piece, total })
  );
  pushNotification("client", clientId, {
    kind: "order_reviewed",
    text: translate(lang, "gen.notif.acceptedClient", { piece, total }),
    href: `/dashboard/orders/${orderId}`,
  });
  return { ...client, orders: nextOrders };
}

export function denyOrder(
  clientId: string,
  orderId: string,
  reason?: string
): Client | undefined {
  const client = getClientWithLiveData(clientId);
  if (!client) return undefined;
  const order = client.orders.find((o) => o.id === orderId);
  if (!order) return undefined;
  const nextOrders = client.orders.map((o) =>
    o.id === orderId ? { ...o, reviewStatus: "denied" as const } : o
  );
  writeJSON(ordersKey(clientId), nextOrders);
  const lang = getStoredLang();
  const piece = pieceLabel(lang, order.piece);
  const trimmedReason = reason?.trim();
  appendMessage(
    clientId,
    "studio",
    translate(lang, "gen.msg.denied", {
      piece,
      reason: trimmedReason ? ` ${trimmedReason}` : "",
    })
  );
  pushNotification("client", clientId, {
    kind: "order_reviewed",
    text: translate(lang, "gen.notif.deniedClient", { piece }),
    href: `/dashboard/orders/${orderId}`,
  });
  return { ...client, orders: nextOrders };
}

export function appendOrderNote(
  clientId: string,
  orderId: string,
  author: OrderNoteAuthor,
  text: string,
  photos: string[]
): Client | undefined {
  const client = getClientWithLiveData(clientId);
  if (!client) return undefined;
  const order = client.orders.find((o) => o.id === orderId);
  if (!order) return undefined;
  const note: OrderNote = {
    id: generateId("note"),
    orderId,
    author,
    text,
    photos,
    createdAt: new Date().toISOString(),
  };
  const nextOrders = client.orders.map((o) =>
    o.id === orderId ? { ...o, updates: [...o.updates, note] } : o
  );
  writeJSON(ordersKey(clientId), nextOrders);

  const lang = getStoredLang();
  const piece = pieceLabel(lang, order.piece);
  if (author === "client") {
    pushNotification("admin", clientId, {
      kind: "order_note",
      text: translate(lang, "gen.notif.noteFromClient", {
        name: client.name,
        piece,
      }),
      href: adminOrderHref(clientId, orderId),
    });
  } else {
    pushNotification("client", clientId, {
      kind: "order_note",
      text: translate(lang, "gen.notif.noteFromStudio", { piece }),
      href: `/dashboard/orders/${orderId}`,
    });
  }
  return { ...client, orders: nextOrders };
}

export function sendStudioMessage(clientId: string, text: string) {
  const messages = appendMessage(clientId, "studio", text);
  pushNotification("client", clientId, {
    kind: "message",
    text: translate(getStoredLang(), "gen.notif.msgFromStudio"),
    href: "/dashboard#messages",
  });
  return messages;
}
