/**
 * Puts the demo account and a starting rail into a fresh database.
 *
 * Run once, after the migrations:  node scripts/seed.mjs
 *
 * Everything it creates is invented. That is the point: the demo login can be
 * printed on a public page precisely because nothing behind it belongs to a
 * real person. Running it twice is safe — it checks before it inserts.
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

for (const line of readFileSync(new URL("../.env.local", import.meta.url), "utf8").split("\n")) {
  const match = /^([A-Z_]+)=(.*)$/.exec(line.trim());
  if (match && !process.env[match[1]]) process.env[match[1]] = match[2];
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local first.");
  process.exit(1);
}

const DEMO_EMAIL = process.env.NEXT_PUBLIC_DEMO_EMAIL || "demo@tidoteatelier.com";
const DEMO_PASSWORD = process.env.NEXT_PUBLIC_DEMO_PASSWORD || "";
if (DEMO_PASSWORD.length < 12) {
  console.error(
    "Set NEXT_PUBLIC_DEMO_PASSWORD in .env.local to something at least 12 characters.\n" +
      "It will be printed on the public login page, so it is a label, not a secret —\n" +
      "but it must not be guessable enough to try against a real client's email."
  );
  process.exit(1);
}

const db = createClient(url, key, { auth: { persistSession: false } });

async function demoProfile() {
  const { data: existing } = await db
    .from("profiles").select("id").eq("email", DEMO_EMAIL).maybeSingle();
  if (existing) {
    console.log("• demo account already exists");
    return existing.id;
  }
  const { data, error } = await db.auth.admin.createUser({
    email: DEMO_EMAIL,
    password: DEMO_PASSWORD,
    email_confirm: true,
    user_metadata: { name: "Dimitar Kolev" },
  });
  if (error) throw error;
  await db.from("profiles")
    .update({ name: "Dimitar Kolev", is_demo: true, phone: "+359 88 000 0000" })
    .eq("id", data.user.id);
  console.log("• created demo account", DEMO_EMAIL);
  return data.user.id;
}

const id = await demoProfile();

await db.from("measurements").upsert({
  profile_id: id,
  height: "182", shoulders: "46", chest: "102",
  waist_natural: "84", lower_waist: "88",
  upper_arm: "33", biceps: "35", wrist: "18",
  inseam: "82", thigh: "58", ankle: "24",
  notes: "Prefers a relaxed shoulder and a slightly longer sleeve.",
  updated_at: new Date().toISOString(),
});

await db.from("delivery_info").upsert({
  profile_id: id,
  address: "ul. Shishman 14, ap. 3",
  city: "Sofia",
  postal_code: "1000",
  phone: "+359 88 000 0000",
  notes: "Buzzer is the second one.",
  updated_at: new Date().toISOString(),
});

const { count: orderCount } = await db
  .from("orders").select("id", { count: "exact", head: true }).eq("profile_id", id);

if (!orderCount) {
  await db.from("orders").insert([
    {
      profile_id: id, piece: "Burgundy Track Jacket", category: "Jacket",
      photos: ["/photos/gallery-2.jpg"], placed_on: "2026-06-02",
      status: "in_production", review_status: "accepted",
      eta: "2026-07-28", total: "€420",
      notes: "Burgundy panelling, custom shoulder taping.",
    },
    {
      profile_id: id, piece: "Olive Cargo Set", category: "Cargo Set",
      photos: ["/photos/gallery-4.jpg"], placed_on: "2026-05-11",
      status: "delivered", review_status: "accepted",
      eta: "2026-05-30", total: "€310",
      // Both answers to the photo permission, so each state is visible.
      wear_photos: ["/photos/casual-2.jpg", "/photos/casual-6.jpg"],
      photo_consent: true, photo_consent_on: "2026-06-04",
    },
    {
      profile_id: id, piece: "Gold Graphic Hoodie", category: "Hoodie",
      photos: ["/photos/casual-5.jpg"], placed_on: "2026-06-20",
      status: "ready", review_status: "accepted",
      eta: "2026-07-05", total: "€190",
    },
    {
      profile_id: id, piece: "Black Puffer Jacket", category: "Jacket",
      photos: ["/photos/men-2.jpg"], placed_on: "2026-07-10",
      status: "received", review_status: "accepted",
      eta: "2026-09-01", total: "€520",
      notes: "Matte shell, no branding.",
    },
  ]);
  console.log("• seeded 4 demo orders");
}

const { count: itemCount } = await db
  .from("wardrobe_items").select("id", { count: "exact", head: true }).eq("profile_id", id);
if (!itemCount) {
  await db.from("wardrobe_items").insert([
    { profile_id: id, name: "Denim Sherpa Jacket", category: "Jacket",
      photos: ["/photos/casual-3.jpg"], notes: "Fits the way I like across the back." },
    { profile_id: id, name: "Tan Wide-Leg Pants", category: "Pants",
      photos: ["/photos/casual-7.jpg"], notes: "" },
  ]);
  console.log("• seeded demo wardrobe");
}

const { count: railCount } = await db
  .from("ready_pieces").select("id", { count: "exact", head: true });
if (!railCount) {
  await db.from("ready_pieces").insert([
    { name: "Olive Cargo Set", category: "Cargo Set", size: "M", price: 310,
      status: "available", photos: ["/photos/gallery-4.jpg"],
      notes: "Sample from the last run — never worn.", added_on: "2026-07-14" },
    { name: "Panelled Track Jacket", category: "Jacket", size: "L", price: 230,
      status: "available", photos: ["/photos/men-2.jpg"], added_on: "2026-07-28" },
    { name: "Gold Graphic Hoodie", category: "Hoodie", size: "S", price: 190,
      status: "reserved", photos: ["/photos/casual-5.jpg"],
      notes: "Held until Friday.", held_for: "Mila", added_on: "2026-08-02" },
  ]);
  console.log("• seeded the rail");
}

console.log("\nDone. Sign in as", DEMO_EMAIL);
