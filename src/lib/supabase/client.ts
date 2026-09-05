"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * The browser's connection to the database.
 *
 * It carries the signed-in person's own token, so every query it makes is
 * checked against the row-level security policies in
 * `supabase/migrations/0002_rls.sql`. That is the actual boundary: this file
 * being readable by anyone who opens devtools is fine, because the publishable
 * key grants nothing on its own.
 */
let browserClient: SupabaseClient | undefined;

/**
 * Supabase renamed this key from **anon** to **publishable** (the old name is
 * deprecated at the end of 2026), so a project set up today has one name in its
 * dashboard and an older one may have the other. Reading both is not
 * indecision: naming it wrong made the whole portal silently unconfigured —
 * an empty rail and a sign-in that said the database was unreachable — with
 * nothing anywhere to say which of two nearly identical names was expected.
 *
 * Next inlines `process.env.NEXT_PUBLIC_*` at build time by matching the
 * literal text, so both have to be written out in full. Neither can be built
 * from a variable.
 */
function publishableKey(): string | undefined {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

/**
 * Whether the keys are present. The public brand pages do not need a database,
 * so they must not go blank just because it has not been connected yet.
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && publishableKey());
}

export function getSupabase(): SupabaseClient {
  if (!browserClient) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = publishableKey();
    // A missing key would otherwise surface as an opaque network failure on the
    // first query, long after the cause. Fail where the cause is.
    if (!url) throw new Error(missing("NEXT_PUBLIC_SUPABASE_URL"));
    if (!key) throw new Error(missing("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"));
    browserClient = createBrowserClient(url, key);
  }
  return browserClient;
}

function missing(name: string) {
  return (
    `${name} is not set. Copy .env.example to .env.local and fill in the ` +
    `project URL and publishable key from the Supabase dashboard ` +
    `(Settings → API Keys).`
  );
}
