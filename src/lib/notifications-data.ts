import {
  SEED_ADMIN_NOTIFICATIONS,
  SEED_CLIENT_NOTIFICATIONS,
  generateId,
  type Notification,
  type NotificationAudience,
  type NotificationKind,
} from "@/lib/mock-data";
import {
  adminNotificationsKey,
  clientNotificationsKey,
  readJSON,
  writeJSON,
} from "@/lib/storage";

function keyFor(audience: NotificationAudience, clientId: string) {
  return audience === "admin"
    ? adminNotificationsKey()
    : clientNotificationsKey(clientId);
}

function seedFor(audience: NotificationAudience, clientId: string) {
  return audience === "admin"
    ? SEED_ADMIN_NOTIFICATIONS
    : SEED_CLIENT_NOTIFICATIONS[clientId] ?? [];
}

export function getNotifications(
  audience: NotificationAudience,
  clientId = ""
): Notification[] {
  const list = readJSON<Notification[]>(
    keyFor(audience, clientId),
    seedFor(audience, clientId)
  );
  return [...list].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export function pushNotification(
  audience: NotificationAudience,
  clientId: string,
  input: { kind: NotificationKind; text: string; href: string }
): Notification[] {
  const current = getNotifications(audience, clientId);
  const next: Notification[] = [
    {
      id: generateId("ntf"),
      audience,
      clientId,
      kind: input.kind,
      text: input.text,
      href: input.href,
      createdAt: new Date().toISOString(),
      read: false,
    },
    ...current,
  ];
  writeJSON(keyFor(audience, clientId), next);
  return next;
}

export function markAllRead(
  audience: NotificationAudience,
  clientId = ""
): Notification[] {
  const next = getNotifications(audience, clientId).map((n) => ({
    ...n,
    read: true,
  }));
  writeJSON(keyFor(audience, clientId), next);
  return next;
}

export function markRead(
  audience: NotificationAudience,
  clientId: string,
  id: string
): Notification[] {
  const next = getNotifications(audience, clientId).map((n) =>
    n.id === id ? { ...n, read: true } : n
  );
  writeJSON(keyFor(audience, clientId), next);
  return next;
}

export function markReadWhere(
  audience: NotificationAudience,
  clientId: string,
  predicate: (n: Notification) => boolean
): Notification[] {
  const next = getNotifications(audience, clientId).map((n) =>
    predicate(n) ? { ...n, read: true } : n
  );
  writeJSON(keyFor(audience, clientId), next);
  return next;
}
