import { getServerSupabase } from "@/lib/supabase/server";

/**
 * Anything that needs the service-role key has to prove first that the *caller*
 * is the studio. The service key bypasses every policy in the database, so the
 * check cannot be skipped or done in the browser.
 */
export async function requireAdmin(): Promise<
  { ok: true; userId: string } | { ok: false; response: Response }
> {
  const supabase = await getServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return {
      ok: false,
      response: Response.json({ error: "Not signed in" }, { status: 401 }),
    };
  }
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (profile?.role !== "admin") {
    return {
      ok: false,
      response: Response.json({ error: "Not permitted" }, { status: 403 }),
    };
  }
  return { ok: true, userId: user.id };
}

/** Guards the cron and export endpoints, which have no signed-in user at all. */
export function hasCronSecret(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const header = request.headers.get("authorization");
  return header === `Bearer ${secret}`;
}
