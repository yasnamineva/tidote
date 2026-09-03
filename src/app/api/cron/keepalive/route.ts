import { getAdminSupabase } from "@/lib/supabase/admin";
import { hasCronSecret } from "@/lib/supabase/guard";

/**
 * A free-tier Supabase project pauses after seven days with no database
 * activity, and waking it takes long enough that a client opening their portal
 * cold would think the site was broken. A daily write resets that timer and
 * costs nothing.
 *
 * It writes rather than reads on purpose: a read can be answered from a cache
 * without the database ever hearing about it.
 */
export async function GET(request: Request) {
  if (!hasCronSecret(request)) {
    return Response.json({ error: "Not permitted" }, { status: 401 });
  }
  const { error } = await getAdminSupabase()
    .from("heartbeat")
    .update({ beat_at: new Date().toISOString() })
    .eq("id", true);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true, at: new Date().toISOString() });
}
