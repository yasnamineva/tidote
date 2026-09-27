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

/**
 * Raises an alert — and sends the email that goes with it.
 *
 * The two used to be separate, which meant they were separate in practice:
 * nine events rang the bell and none of them wrote to anybody, so a client
 * learned their jacket was ready by opening the website and wondering. They
 * are one call now, and that is deliberate — it should be difficult to add an
 * event that does one and not the other.
 *
 * Which kinds actually become mail is decided on the server, in
 * `notification-mail.ts`. Some are bell-only on purpose.
 */
export async function pushNotification(
  audience: NotificationAudience,
  clientId: string,
  input: {
    kind: NotificationKind;
    text: string;
    href: string;
    /** What it is about, so the email can be written in the reader's language. */
    data?: Record<string, string>;
  }
): Promise<Notification[]> {
  // The id is minted here rather than read back. A client may raise an alert
  // for the studio and may not read the studio's inbox — correctly — so asking
  // for the row back after inserting it was refused, and an order that had
  // been placed reported that it had not been. The id is only a pointer: the
  // route still reads the row on the server and decides everything from there.
  const id = crypto.randomUUID();
  const base = {
    id,
    audience,
    profile_id: clientId || null,
    kind: input.kind,
    text: input.text,
    href: input.href,
  };

  // `data` arrives with 0010. Writing to a column that is not there yet fails
  // the whole insert, and this insert is how an order gets placed — so the
  // detail is dropped rather than the event. Only for that error, never for a
  // connection that is down.
  let { error } = await getSupabase()
    .from("notifications")
    .insert({ ...base, data: input.data ?? {} });
  if (
    error &&
    (error.code === "42703" ||
      error.code === "PGRST204" ||
      /column .* does not exist|'data'/i.test(error.message))
  ) {
    ({ error } = await getSupabase().from("notifications").insert(base));
  }
  if (error) throw error;

  // Best effort, and never awaited for its result: the alert is already saved
  // and on screen, and mail that does not go out must not undo that.
  void sendNotificationMail(id);

  return getNotifications(audience, clientId);
}

async function sendNotificationMail(id: string): Promise<void> {
  try {
    await fetch("/api/notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
  } catch {
    // Offline, or the route is not there. The bell still rang.
  }
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
