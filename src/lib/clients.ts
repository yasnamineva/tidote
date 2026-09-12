import {
  EMPTY_DELIVERY,
  EMPTY_MEASUREMENTS,
  type Client,
} from "@/lib/mock-data";
import { getSupabase } from "@/lib/supabase/client";
import {
  toDelivery,
  toMeasurements,
  toOrder,
  toOwnedItem,
  type DeliveryRow,
  type MeasurementRow,
  type OrderRow,
  type WardrobeRow,
} from "@/lib/supabase/rows";

/**
 * A client and everything hanging off them, in one round trip.
 *
 * The prototype stitched this together from six localStorage keys. Postgres can
 * return the whole shape in a single query, and row-level security decides what
 * comes back — so the studio gets every client and a client gets only their own,
 * from the same code.
 */
const CLIENT_SELECT = `
  id, name, email, phone, is_demo,
  measurements ( * ),
  delivery_info ( * ),
  wardrobe_items ( * ),
  orders ( *, order_notes ( * ) )
`;

type ProfileRow = {
  id: string;
  name: string;
  email: string;
  phone: string;
  is_demo: boolean;
  measurements: MeasurementRow | MeasurementRow[] | null;
  delivery_info: DeliveryRow | DeliveryRow[] | null;
  wardrobe_items: WardrobeRow[] | null;
  orders: OrderRow[] | null;
};

/** PostgREST returns a one-to-one either way depending on how it reads the FK. */
function one<T>(v: T | T[] | null | undefined): T | undefined {
  if (!v) return undefined;
  return Array.isArray(v) ? v[0] : v;
}

export function toClient(r: ProfileRow): Client {
  const m = one(r.measurements);
  const d = one(r.delivery_info);
  return {
    id: r.id,
    name: r.name,
    email: r.email,
    // Passwords live in Supabase Auth and are never readable. The field stays
    // on the type only because the seed data shape predates real auth.
    password: "",
    role: "client",
    orders: (r.orders ?? [])
      .map(toOrder)
      .sort((a, b) => b.placedOn.localeCompare(a.placedOn)),
    measurements: m ? toMeasurements(m) : { ...EMPTY_MEASUREMENTS },
    delivery: d
      ? toDelivery(d)
      : { ...EMPTY_DELIVERY, phone: r.phone ?? "" },
    items: (r.wardrobe_items ?? [])
      .map(toOwnedItem)
      .sort((a, b) => b.addedOn.localeCompare(a.addedOn)),
  };
}

export async function getBaseClients(): Promise<Client[]> {
  const { data, error } = await getSupabase()
    .from("profiles")
    .select(CLIENT_SELECT)
    .eq("role", "client")
    .order("name");
  if (error) throw error;
  return (data as unknown as ProfileRow[]).map(toClient);
}

export async function getBaseClientById(
  id: string
): Promise<Client | undefined> {
  const { data, error } = await getSupabase()
    .from("profiles")
    .select(CLIENT_SELECT)
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? toClient(data as unknown as ProfileRow) : undefined;
}

export async function emailExists(email: string): Promise<boolean> {
  const { data, error } = await getSupabase()
    .from("profiles")
    .select("id")
    .eq("email", email.trim().toLowerCase())
    .maybeSingle();
  if (error) throw error;
  return Boolean(data);
}

type NewClientInput = {
  name: string;
  email: string;
  password: string;
  phone?: string;
};

/**
 * Creating a client means creating a login, which the browser is not allowed to
 * do — it needs the service-role key. So both of these go through a route
 * handler that checks the caller is the studio before touching auth.
 */
export async function addStoredClient(input: NewClientInput): Promise<Client> {
  const response = await fetch("/api/clients", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const body = await response.json();
  // The code travels as the error's message, so the form can translate it.
  if (!response.ok) throw new Error(body.code ?? "server");
  return body.client as Client;
}

/**
 * Permanently removes a client, their login, and every record attached to them.
 * Irreversible — callers are expected to confirm with the studio first.
 */
export async function deleteClient(id: string): Promise<void> {
  const response = await fetch(`/api/clients/${id}`, { method: "DELETE" });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error ?? "Could not delete the client");
  }
}
