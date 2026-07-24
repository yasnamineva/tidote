export function ordersKey(clientId: string) {
  return `tidote_orders_${clientId}`;
}

export function measurementsKey(clientId: string) {
  return `tidote_measurements_${clientId}`;
}

export function deliveryKey(clientId: string) {
  return `tidote_delivery_${clientId}`;
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
