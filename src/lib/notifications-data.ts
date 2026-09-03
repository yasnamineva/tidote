import type {
  Notification,
  NotificationAudience,
  NotificationKind,
} from "@/lib/mock-data";
import { getSupabase } from "@/lib/supabase/client";
import { toNotification, type NotificationRow } from "@/lib/supabase/rows";

const COLUMNS = "id,audience,profile_id,kind,text,href,read,created_at";

/**
 * Two inboxes in one table, told apart by `audience`. The studio's alerts carry
 * the client they are about; a client's carry only their own id, and the policy
 * on the table makes sure that is the only one they can read.
 */
export async function getNotifications(
  audience: NotificationAudience,
  clientId = ""
): Promise<Notification[]> {
  let query = getSupabase()
    .from("notifications")
    .select(COLUMNS)
    .eq("audience", audience)
    .order("created_at", { ascending: false });
  if (audience === "client") query = query.eq("profile_id", clientId);
  const { data, error } = await query;
  if (error) throw error;
  return (data as NotificationRow[]).map(toNotification);
}

export async function pushNotification(
  audience: NotificationAudience,
  clientId: string,
  input: { kind: NotificationKind; text: string; href: string }
): Promise<Notification[]> {
  const { error } = await getSupabase().from("notifications").insert({
    audience,
    profile_id: clientId || null,
    kind: input.kind,
    text: input.text,
    href: input.href,
  });
  if (error) throw error;
  return getNotifications(audience, clientId);
}

export async function markAllRead(
  audience: NotificationAudience,
  clientId = ""
): Promise<Notification[]> {
  let query = getSupabase()
    .from("notifications")
    .update({ read: true })
    .eq("audience", audience)
    .eq("read", false);
  if (audience === "client") query = query.eq("profile_id", clientId);
  const { error } = await query;
  if (error) throw error;
  return getNotifications(audience, clientId);
}

export async function markRead(
  audience: NotificationAudience,
  clientId: string,
  id: string
): Promise<Notification[]> {
  const { error } = await getSupabase()
    .from("notifications")
    .update({ read: true })
    .eq("id", id);
  if (error) throw error;
  return getNotifications(audience, clientId);
}

/**
 * The predicate is a JavaScript function, so it cannot travel to Postgres.
 * Read, decide here, then update the ids that matched — which is fine at the
 * size of one person's notification list.
 */
export async function markReadWhere(
  audience: NotificationAudience,
  clientId: string,
  predicate: (n: Notification) => boolean
): Promise<Notification[]> {
  const current = await getNotifications(audience, clientId);
  const ids = current.filter((n) => !n.read && predicate(n)).map((n) => n.id);
  if (ids.length === 0) return current;
  const { error } = await getSupabase()
    .from("notifications")
    .update({ read: true })
    .in("id", ids);
  if (error) throw error;
  return getNotifications(audience, clientId);
}
