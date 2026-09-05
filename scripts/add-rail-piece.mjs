/**
 * Puts one piece on the public rail, so /in-stock has something to show.
 *
 *   npm run seed:rail
 *
 * `npm run seed` does this too, along with the demo client and their orders.
 * This is for when the rail is all you want -- a real studio account, an empty
 * client list, and one garment in the window.
 *
 * Safe to run twice: it looks for the piece by name first.
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

const PIECE = {
  name: "Olive Cargo Set",
  category: "Cargo Set",
  size: "M",
  price: 310,
  status: "available",
  // A file already in public/photos, so this works before any photo has been
  // uploaded to storage.
  photos: ["/photos/gallery-4.jpg"],
  notes: "Sample from the last run — never worn.",
};

const db = createClient(url, key, { auth: { persistSession: false } });

const { data: already, error: readErr } = await db
  .from("ready_pieces")
  .select("id")
  .eq("name", PIECE.name)
  .maybeSingle();

if (readErr) {
  console.error("Could not reach the database:", readErr.message);
  console.error("Check NEXT_PUBLIC_SUPABASE_URL and that the migrations have been applied.");
  process.exit(1);
}

if (already) {
  console.log(`"${PIECE.name}" is already on the rail. Nothing to do.`);
  process.exit(0);
}

const { error } = await db.from("ready_pieces").insert(PIECE);
if (error) {
  console.error("Could not add the piece:", error.message);
  process.exit(1);
}

console.log(`Added "${PIECE.name}" to the rail. It is now on /in-stock.`);
console.log("Remove it from the studio panel under In Stock when you no longer want it.");
