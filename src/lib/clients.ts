import {
  CLIENTS,
  EMPTY_DELIVERY,
  EMPTY_ITEMS,
  EMPTY_MEASUREMENTS,
  generateId,
  type Client,
} from "@/lib/mock-data";
import {
  adminClientsKey,
  clientNotificationsKey,
  deletedClientsKey,
  deliveryKey,
  itemsKey,
  measurementsKey,
  messagesKey,
  ordersKey,
  readJSON,
  removeKey,
  writeJSON,
} from "@/lib/storage";

// Clients the admin created at runtime (persisted separately from the seeds).
export function getStoredClients(): Client[] {
  return readJSON<Client[]>(adminClientsKey(), []);
}

// Seed clients can't be spliced out of the imported array, so deletions of them
// are recorded as tombstones and filtered on read.
function getDeletedClientIds(): string[] {
  return readJSON<string[]>(deletedClientsKey(), []);
}

// The full set of base client records (seeds + admin-created), used by both the
// auth layer (login/hydration) and the admin data layer.
export function getBaseClients(): Client[] {
  const deleted = new Set(getDeletedClientIds());
  return [...CLIENTS, ...getStoredClients()].filter((c) => !deleted.has(c.id));
}

export function getBaseClientById(id: string): Client | undefined {
  return getBaseClients().find((c) => c.id === id);
}

export function emailExists(email: string): boolean {
  const normalized = email.trim().toLowerCase();
  return getBaseClients().some((c) => c.email === normalized);
}

type NewClientInput = {
  name: string;
  email: string;
  password: string;
  phone?: string;
};

export function addStoredClient(input: NewClientInput): Client {
  const client: Client = {
    id: generateId("client"),
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    password: input.password,
    role: "client",
    orders: [],
    measurements: { ...EMPTY_MEASUREMENTS },
    delivery: { ...EMPTY_DELIVERY, phone: input.phone?.trim() ?? "" },
    items: [...EMPTY_ITEMS],
  };
  const next = [...getStoredClients(), client];
  writeJSON(adminClientsKey(), next);
  return client;
}

/**
 * Permanently removes a client and every record attached to them. Irreversible —
 * callers are expected to confirm with the studio first.
 */
export function deleteClient(id: string) {
  const stored = getStoredClients();
  const remaining = stored.filter((c) => c.id !== id);
  if (remaining.length !== stored.length) {
    writeJSON(adminClientsKey(), remaining);
  } else {
    // A seed client — record a tombstone so it stays gone across reloads.
    writeJSON(deletedClientsKey(), [...getDeletedClientIds(), id]);
  }
  for (const key of [
    ordersKey,
    measurementsKey,
    deliveryKey,
    itemsKey,
    messagesKey,
    clientNotificationsKey,
  ]) {
    removeKey(key(id));
  }
}
