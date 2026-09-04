/**
 * Creates the studio's own login.
 *
 *   npm run create-admin -- support@tidoteatelier.com 'a-good-password'
 *
 * Signing up on the site always produces a client — deliberately, since anyone
 * can do it, and a trigger that read an address off a form and handed back the
 * studio role would be a way in for whoever typed the right address. Promotion
 * happens here instead: on the server, with the service key, after checking the
 * allow-list. Nothing typed into a browser can reach it.
 *
 * Use it once to make the studio account, and again to change its password.
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

try {
  for (const line of readFileSync(new URL("../.env.local", import.meta.url), "utf8").split("\n")) {
    const m = /^([A-Z_]+)=(.*)$/.exec(line.trim());
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
} catch {
  console.error("No .env.local found. Copy .env.example to .env.local first — see SETUP.md step 3.");
  process.exit(1);
}

const [email, password] = process.argv.slice(2);
if (!email || !password) {
  console.error("Usage: npm run create-admin -- <email> <password>");
  process.exit(1);
}
if (password.length < 8) {
  console.error("Supabase requires at least 8 characters.");
  process.exit(1);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local.");
  process.exit(1);
}
const db = createClient(url, key, { auth: { persistSession: false } });

// The trigger reads this table when the account is made, so a missing row here
// means the account would come out as a client and there would be no way in.
const { data: listed, error: listErr } = await db
  .from("admin_emails").select("email").eq("email", email.toLowerCase()).maybeSingle();
if (listErr) {
  console.error("Could not read admin_emails:", listErr.message);
  console.error("Have the migrations been run? See SETUP.md step 2.");
  process.exit(1);
}
if (!listed) {
  console.error(`${email} is not in admin_emails, so this account would be created as a client.`);
  console.error("Add it in the Supabase SQL editor first:\n");
  console.error(`  insert into admin_emails (email) values ('${email.toLowerCase()}');\n`);
  process.exit(1);
}

// Already there? Then this is a password change rather than a first account.
const { data: existing } = await db
  .from("profiles").select("id, role").eq("email", email.toLowerCase()).maybeSingle();

let userId;
if (existing) {
  const { error } = await db.auth.admin.updateUserById(existing.id, { password });
  if (error) {
    console.error("Could not set the password:", error.message);
    process.exit(1);
  }
  userId = existing.id;
  console.log(`Set a new password for ${email}.`);
} else {
  const { data: created, error } = await db.auth.admin.createUser({
    email,
    password,
    // Created by the studio, for the studio: there is nobody to verify to.
    email_confirm: true,
    user_metadata: { name: "Tidote Atelier" },
  });
  if (error) {
    console.error("Could not create the account:", error.message);
    process.exit(1);
  }
  userId = created.user.id;
  console.log(`Created ${email}.`);
}

// The trigger made a client, as it does for everyone. This is the promotion.
const { error: promoteError } = await db
  .from("profiles").update({ role: "admin" }).eq("id", userId);
if (promoteError) {
  console.error("Created, but could not set the studio role:", promoteError.message);
  process.exit(1);
}

const { data: profile } = await db
  .from("profiles").select("role").eq("id", userId).maybeSingle();
if (profile?.role !== "admin") {
  console.error(`The role came out as "${profile?.role}" instead of "admin".`);
  process.exit(1);
}

console.log(`${email} is studio. Sign in at /login and you will land on /admin.`);
