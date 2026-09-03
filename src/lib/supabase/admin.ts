import { createClient } from "@supabase/supabase-js";

/**
 * The service-role client. It bypasses row-level security completely, so it is
 * confined to two callers that have no user to act as: the daily keep-alive and
 * the studio's full export.
 *
 * `SUPABASE_SERVICE_ROLE_KEY` has no NEXT_PUBLIC_ prefix, so Next will not
 * inline it into the browser bundle. Importing this file from a client
 * component would be a real leak; it is only ever imported by route handlers.
 */
export function getAdminSupabase() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
