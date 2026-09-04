/**
 * Creates the studio's own login.
 *
 *   npm run create-admin -- support@tidoteatelier.com 'a-good-password'
 *
 * There is deliberately no sign-up form on the site — clients are added by the
 * studio, not by themselves — so the first account has to be made with the
 * service key. This does that, and then checks the account actually came out as
 * studio rather than as a client, which is the thing that silently goes wrong
 * if the address is not in `admin_emails`.
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

const { data: created, error } = await db.auth.admin.createUser({
  email,
  password,
  // These are people who have been met in person; making them chase a
  // verification email to reach their own account buys nothing.
  email_confirm: true,
  user_metadata: { name: "Tidote Atelier" },
});

if (error) {
  if (error.message?.toLowerCase().includes("already")) {
    console.error(`${email} already has an account. Reset its password from the Supabase dashboard instead.`);
  } else {
    console.error("Could not create the account:", error.message);
  }
  process.exit(1);
}

const { data: profile } = await db
  .from("profiles").select("role, name").eq("id", created.user.id).maybeSingle();

if (profile?.role !== "admin") {
  console.error(`Created, but the role came out as "${profile?.role}" instead of "admin".`);
  console.error("Check that 0004_admin_email.sql ran and lists this address.");
  process.exit(1);
}

console.log(`Created ${email} as studio. Sign in at /login and you will land on /admin.`);
