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

/**
 * Fired when the browser refuses a write. Everything in this prototype lives in
 * localStorage, so a refusal means the change the person just made is gone —
 * which they must be told about rather than left to discover later.
 */
export const STORAGE_FULL_EVENT = "tidote:storage-full";

/**
 * Returns false instead of throwing. `setItem` raises QuotaExceededError once
 * the origin's ~5 MB budget is used up, and it also throws outright in some
 * privacy modes; letting that escape aborts the surrounding handler mid-save
 * and leaves the UI looking as though nothing happened.
 */
export function writeJSON(key: string, value: unknown): boolean {
  if (typeof window === "undefined") return false;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    window.dispatchEvent(new CustomEvent(STORAGE_FULL_EVENT, { detail: { key } }));
    return false;
  }
}

export function removeKey(key: string) {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(key);
}
