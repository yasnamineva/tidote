import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * A per-request client for route handlers, carrying the caller's session from
 * their cookies. Never share one between requests — the session travels with it.
 */
export async function getServerSupabase() {
  const store = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    // Both names, for the reason given in ./client.ts: Supabase renamed anon
    // to publishable, and picking one silently breaks every project that used
    // the other.
    (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)!,
    {
      cookies: {
        getAll: () => store.getAll(),
        setAll: (list) => {
          try {
            for (const { name, value, options } of list) {
              store.set(name, value, options);
            }
          } catch {
            // Called from a context that cannot set cookies. The proxy refreshes
            // the session on every request, so nothing is lost by ignoring it.
          }
        },
      },
    }
  );
}
