import type { Message, MessageSender } from "@/lib/mock-data";
import { getSupabase } from "@/lib/supabase/client";
import { toMessage, type MessageRow } from "@/lib/supabase/rows";

/**
 * The thread between one client and the studio. Row-level security decides who
 * can read it: the client it belongs to, or the studio. There is no query here
 * that could return someone else's thread even if it asked for one.
 */
export async function getMessages(clientId: string): Promise<Message[]> {
  const { data, error } = await getSupabase()
    .from("messages")
    .select("id,profile_id,sender,text,created_at")
    .eq("profile_id", clientId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data as MessageRow[]).map(toMessage);
}

export async function appendMessage(
  clientId: string,
  sender: MessageSender,
  text: string
): Promise<Message[]> {
  const { error } = await getSupabase()
    .from("messages")
    .insert({ profile_id: clientId, sender, text });
  if (error) throw error;
  return getMessages(clientId);
}

/**
 * The last message in every thread, in one query.
 *
 * The inbox lists conversations newest-first, which needs the latest message
 * from each. Asking per client was free when it was a localStorage read; as a
 * round trip each it would be one request per client on every render.
 */
export async function getLatestMessages(): Promise<Map<string, Message>> {
  const { data, error } = await getSupabase()
    .from("messages")
    .select("id,profile_id,sender,text,created_at")
    .order("created_at", { ascending: false });
  if (error) throw error;
  const latest = new Map<string, Message>();
  for (const row of data as MessageRow[]) {
    // Ordered newest first, so the first one seen for a client is the latest.
    if (!latest.has(row.profile_id)) latest.set(row.profile_id, toMessage(row));
  }
  return latest;
}
