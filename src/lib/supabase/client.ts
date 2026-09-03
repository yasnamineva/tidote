"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * The browser's connection to the database.
 *
 * It carries the signed-in person's own token, so every query it makes is
 * checked against the row-level security policies in
 * `supabase/migrations/0002_rls.sql`. That is the actual boundary: this file
 * being readable by anyone who opens devtools is fine, because the anon key
 * grants nothing on its own.
 */
let browserClient: SupabaseClient | undefined;

/**
 * Whether the keys are present. The public brand pages do not need a database,
 * so they must not go blank just because it has not been connected yet.
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export function getSupabase(): SupabaseClient {
  if (!browserClient) {
    browserClient = createBrowserClient(
      requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
      requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
    );
  }
  return browserClient;
}

/**
 * A missing key would otherwise surface as an opaque network failure on the
 * first query, long after the cause. Fail where the cause is.
 */
function requireEnv(name: "NEXT_PUBLIC_SUPABASE_URL" | "NEXT_PUBLIC_SUPABASE_ANON_KEY") {
  // Next inlines these at build time, so they must be referenced by literal name.
  const value =
    name === "NEXT_PUBLIC_SUPABASE_URL"
      ? process.env.NEXT_PUBLIC_SUPABASE_URL
      : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!value) {
    throw new Error(
      `${name} is not set. Copy .env.example to .env.local and fill in the ` +
        `project URL and anon key from the Supabase dashboard (Settings → API).`
    );
  }
  return value;
}
