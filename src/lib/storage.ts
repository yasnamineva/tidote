export function ordersKey(clientId: string) {
  return `tidote_orders_${clientId}`;
}

export function measurementsKey(clientId: string) {
  return `tidote_measurements_${clientId}`;
}

export function deliveryKey(clientId: string) {
  return `tidote_delivery_${clientId}`;
}

export function itemsKey(clientId: string) {
  return `tidote_items_${clientId}`;
}

export function adminClientsKey() {
  return `tidote_admin_clients`;
}

/** Tombstones for seed clients the studio deleted (seeds can't be removed in place). */
export function deletedClientsKey() {
  return `tidote_deleted_clients`;
}

export function messagesKey(clientId: string) {
  return `tidote_messages_${clientId}`;
}

export function adminNotificationsKey() {
  return `tidote_notifications_admin`;
}

export function clientNotificationsKey(clientId: string) {
  return `tidote_notifications_${clientId}`;
}

export function readJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  const raw = window.localStorage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeJSON(key: string, value: unknown) {
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function removeKey(key: string) {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(key);
}
