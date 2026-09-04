/**
 * Runs the app's real queries against a real PostgREST — the same API layer
 * supabase-js talks to in production.
 *
 * The select strings are lifted out of `src/` rather than retyped, so this
 * proves the strings the app actually ships. That matters most for the nested
 * embeds in CLIENT_SELECT: a wrong relationship name there compiles fine,
 * passes typecheck, and fails only at runtime against a live database.
 *
 * Driven by ./run-wiring.sh, which brings PostgREST up and takes it down.
 */
import { createClient } from "@supabase/supabase-js";
import { createHmac } from "node:crypto";
import { readFileSync } from "node:fs";

const SECRET = "a-very-long-test-only-signing-secret-0123456789";
const b64 = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
function jwt(claims) {
  const head = b64({ alg: "HS256", typ: "JWT" });
  const body = b64({ ...claims, exp: Math.floor(Date.now() / 1000) + 3600 });
  const sig = createHmac("sha256", SECRET).update(`${head}.${body}`).digest("base64url");
  return `${head}.${body}.${sig}`;
}

// supabase-js prefixes /rest/v1; bare PostgREST serves at the root.
const strip = (input, init) =>
  fetch(String(input).replace("/rest/v1", ""), init);

const as = (token) =>
  createClient("http://localhost:3001", token, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: strip },
  });

const ANN    = "22222222-2222-2222-2222-222222222222";
const STUDIO = "11111111-1111-1111-1111-111111111111";
const client = as(jwt({ sub: ANN, role: "authenticated" }));
const studio = as(jwt({ sub: STUDIO, role: "authenticated" }));
const anon   = as(jwt({ role: "anon" }));

// The select strings are lifted out of the source, so this proves the strings
// the app actually ships — not a paraphrase of them.
const src = (f) => readFileSync(f, "utf8");
const between = (s, a, b) => s.slice(s.indexOf(a) + a.length, s.indexOf(b, s.indexOf(a)));
const pick = (file, name) => {
  const m = new RegExp(name + "\\s*=\\s*[`\"]([\\s\\S]*?)[`\"]").exec(src(file));
  if (!m) throw new Error("could not find " + name + " in " + file);
  return m[1];
};
const CLIENT_SELECT  = pick("src/lib/clients.ts", "CLIENT_SELECT");
const STUDIO_COLUMNS = pick("src/lib/ready-pieces.ts", "STUDIO_COLUMNS");
const NOTIF_COLUMNS  = pick("src/lib/notifications-data.ts", "COLUMNS");
const ORDER_CONTEXT  = between(src("src/lib/admin-data.ts"), '.select("', '")');

let bad = 0;
const check = (name, ok, detail = "") => {
  console.log(`  ${ok ? "PASS" : "** FAIL **"}  ${name}${detail ? "  — " + detail : ""}`);
  if (!ok) bad++;
};

console.log("QUERY SHAPES — the exact select strings from src/\n");

// 1. the big nested client query
{
  const { data, error } = await client.from("profiles").select(CLIENT_SELECT).eq("id", ANN).maybeSingle();
  check("clients.ts CLIENT_SELECT parses and returns", !error && !!data, error?.message ?? "");
  if (process.env.DEBUG) console.log("    keys:", Object.keys(data ?? {}).join(","));
  if (data) {
    const one = (v) => (Array.isArray(v) ? v[0] : v);
    check("  nested measurements arrive", !!one(data.measurements));
    check("  nested delivery_info arrives", !!one(data.delivery_info));
    const d = one(data.delivery_info);
    check("  delivery uses postal_code, which rows.ts maps to postalCode",
          d && "postal_code" in d);
    check("  nested orders arrive", Array.isArray(data.orders) && data.orders.length >= 1,
          `${data.orders?.length} order(s)`);
    check("  orders carry their nested order_notes", Array.isArray(data.orders?.[0]?.order_notes));
    const cols = Object.keys(data.orders?.[0] ?? {});
    for (const c of ["wear_photos", "photo_consent", "photo_consent_on", "returned_on", "review_status", "placed_on"])
      check(`  order column ${c} present`, cols.includes(c));
  }
}

// 2. RLS through the real API, not just psql
{
  const { data } = await client.from("orders").select("id,profile_id");
  check("a client's order list is only their own", (data ?? []).every((o) => o.profile_id === ANN),
        `${data?.length} row(s)`);
  const { data: all } = await studio.from("orders").select("id,profile_id");
  check("the studio sees every order", (all ?? []).length >= 2, `${all?.length} row(s)`);
}

// 3. the rail, both ways
{
  const { data: pub, error: pubErr } = await anon.from("public_stock")
    .select("id,name,category,size,price,status,photos,added_on").order("added_on", { ascending: false });
  check("ready-pieces.ts public select works for a stranger", !pubErr && (pub ?? []).length === 1, pubErr?.message ?? "");
  check("  no held_for leaks through the view", pub && !("held_for" in pub[0]));
  check("  no notes leak through the view", pub && !("notes" in pub[0]));
  const { error: tableErr } = await anon.from("ready_pieces").select(STUDIO_COLUMNS);
  check("a stranger is refused the rail table", !!tableErr, tableErr?.code ?? "");
  const { data: studioRail, error: sErr } = await studio.from("ready_pieces").select(STUDIO_COLUMNS)
    .order("added_on", { ascending: false });
  check("ready-pieces.ts studio select works", !sErr && (studioRail ?? []).length === 2, sErr?.message ?? "");
  check("  studio does see held_for", studioRail?.some((p) => p.held_for));
}

// 4. admin-data's order-context join
{
  const { data: order } = await studio.from("orders").select("id").limit(1).single();
  const { data, error } = await studio.from("orders").select(ORDER_CONTEXT).eq("id", order.id).maybeSingle();
  check("admin-data.ts orderContext join works", !error && !!data?.profiles, error?.message ?? "");
}

// 5. the writes a client is allowed to make, through the API
{
  const { data: mine } = await client.from("orders").select("id").limit(1).single();
  const { error } = await client.from("orders")
    .update({ wear_photos: ["client-photos/a.jpg"], photo_consent: true, photo_consent_on: "2026-09-04" })
    .eq("id", mine.id);
  check("a client can save photos + consent via the API", !error, error?.message ?? "");
  const { error: priceErr } = await client.from("orders").update({ total: "€1" }).eq("id", mine.id);
  check("a client is refused a price change via the API", !!priceErr, priceErr?.message?.slice(0, 60) ?? "");
}

// 6. a client with no delivery row must still map, not throw
{
  const BORIS = "33333333-3333-3333-3333-333333333333";
  const boris = as(jwt({ sub: BORIS, role: "authenticated" }));
  const { data, error } = await boris.from("profiles").select(CLIENT_SELECT).eq("id", BORIS).maybeSingle();
  const one = (v) => (Array.isArray(v) ? v[0] : v);
  check("a client with no address returns null, not an error", !error && !!data, error?.message ?? "");
  check("  rows.ts falls back rather than crashing", !one(data?.delivery_info));
}

// 7. notifications + messages column lists
{
  const { error } = await studio.from("notifications").select(NOTIF_COLUMNS).eq("audience", "admin");
  check("notifications-data.ts COLUMNS parse", !error, error?.message ?? "");
  const { error: mErr } = await client.from("messages")
    .select("id,profile_id,sender,text,created_at").eq("profile_id", ANN);
  check("messages.ts select parses", !mErr, mErr?.message ?? "");
}

console.log("\n" + (bad ? `${bad} PROBLEM(S)` : "ALL WIRING CHECKS PASSED"));
process.exit(bad ? 1 : 0);
