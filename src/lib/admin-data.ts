import {
  CLIENTS,
  ORDER_STATUS_LABEL,
  generateId,
  type Client,
  type OrderNote,
  type OrderNoteAuthor,
  type OrderStatus,
} from "@/lib/mock-data";
import {
  deliveryKey,
  measurementsKey,
  ordersKey,
  readJSON,
  writeJSON,
} from "@/lib/storage";
import { appendMessage } from "@/lib/messages";
import { pushNotification } from "@/lib/notifications-data";

export function getClientWithLiveData(clientId: string): Client | undefined {
  const seed = CLIENTS.find((c) => c.id === clientId);
  if (!seed) return undefined;
  return {
    ...seed,
    orders: readJSON(ordersKey(clientId), seed.orders),
    measurements: readJSON(measurementsKey(clientId), seed.measurements),
    delivery: readJSON(deliveryKey(clientId), seed.delivery),
  };
}

export function getAllClientsWithLiveData(): Client[] {
  return CLIENTS.map((c) => getClientWithLiveData(c.id)!);
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
  pushNotification("client", clientId, {
    kind: "status_changed",
    text: `"${order.piece}" is now ${ORDER_STATUS_LABEL[status]}.`,
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
  pushNotification("client", clientId, {
    kind: "status_changed",
    text: `New target date for "${order.piece}": ${eta}.`,
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
  appendMessage(
    clientId,
    "studio",
    `Great news — your order for "${order.piece}" has been accepted! Price: ${total}. We'll keep you updated as it moves through production.`
  );
  pushNotification("client", clientId, {
    kind: "order_reviewed",
    text: `Your order "${order.piece}" was accepted (${total}).`,
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
  const trimmedReason = reason?.trim();
  appendMessage(
    clientId,
    "studio",
    `We're sorry, but we can't take on your order for "${order.piece}" right now.${
      trimmedReason ? ` ${trimmedReason}` : ""
    }`
  );
  pushNotification("client", clientId, {
    kind: "order_reviewed",
    text: `Your order "${order.piece}" was declined.`,
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

  if (author === "client") {
    pushNotification("admin", clientId, {
      kind: "order_note",
      text: `${client.name} added info to "${order.piece}".`,
      href: adminOrderHref(clientId, orderId),
    });
  } else {
    pushNotification("client", clientId, {
      kind: "order_note",
      text: `The studio added a note to "${order.piece}".`,
      href: `/dashboard/orders/${orderId}`,
    });
  }
  return { ...client, orders: nextOrders };
}

export function sendStudioMessage(clientId: string, text: string) {
  const messages = appendMessage(clientId, "studio", text);
  pushNotification("client", clientId, {
    kind: "message",
    text: "The studio sent you a message.",
    href: "/dashboard#messages",
  });
  return messages;
}
