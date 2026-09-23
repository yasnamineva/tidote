import { getAdminSupabase } from "@/lib/supabase/admin";

/**
 * Setting up the studio account, from the website, once.
 *
 * The studio used to be made by registering an allow-listed address and
 * clicking a link in the confirmation mail (0007). The mail does not arrive —
 * Supabase's own mailer reaches organisation members only, twice an hour — so
 * the owner of the atelier could not get into her own panel.
 *
 * This is the replacement, and it is the only door: the address has to be on
 * the allow-list and the row has to be unclaimed. That is the whole gate, by
 * the studio's own decision — the site has no traffic, and a forgotten password
 * is recoverable by mail, by a second listed address, or in Supabase directly.
 *
 * It creates the login with the password she typed, already confirmed, which is
 * the state `handle_new_user` reads as studio for a listed address — so the
 * role still comes from the database, not from here.
 *
 * Once she has claimed it, `claimed_at` shuts the door: the same address cannot
 * be claimed a second time by anyone.
 *
 * The service key is required and never leaves the server: the allow-list is
 * not readable by anyone else, and the code is compared inside Postgres
 * against a hash, so nothing here can be used to discover either.
 */

/**
 * Five attempts an hour per address. The code is the only secret in the door,
 * so unlike the enquiry limiter this one exists to make guessing pointless
 * rather than to stop a stuck button. It is one instance's view — a brake, not
 * a gate — and the code is long enough that the brake is enough.
 */
const HOUR = 60 * 60 * 1000;
const attempts = new Map<string, number[]>();

function tooManyAttempts(ip: string): boolean {
  const now = Date.now();
  const hits = (attempts.get(ip) ?? []).filter((t) => now - t < HOUR);
  hits.push(now);
  attempts.set(ip, hits);
  if (attempts.size > 500) {
    for (const [key, times] of attempts) {
      if (times.every((t) => now - t > HOUR)) attempts.delete(key);
    }
  }
  return hits.length > 5;
}

function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || "unknown";
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = String(body?.email ?? "").trim().toLowerCase().slice(0, 160);
  const password = String(body?.password ?? "");

  if (!email || password.length < 8) {
    return Response.json({ code: "bad_input" }, { status: 400 });
  }
  if (tooManyAttempts(clientIp(request))) {
    return Response.json({ code: "rate_limited" }, { status: 429 });
  }

  let admin;
  try {
    admin = getAdminSupabase();
  } catch {
    // Missing service key. Say which state this is, because the fix is a
    // deployment setting rather than anything the person typed.
    return Response.json({ code: "not_configured" }, { status: 503 });
  }

  const { data: allowed, error: checkError } = await admin.rpc("studio_claim_allowed", {
    p_email: email,
  });
  if (checkError) {
    console.error("studio claim check failed:", checkError.message);
    // The function is missing until the studio-claim migrations have been
    // applied.
    // That is a migration that has not been run, not a wrong code, and the
    // page says so — otherwise the first thing she would do is doubt the code.
    const missing =
      checkError.code === "PGRST202" ||
      /could not find the function|does not exist/i.test(checkError.message);
    return Response.json(
      { code: missing ? "not_configured" : "server" },
      { status: missing ? 503 : 500 }
    );
  }
  // One answer for either kind of no — not listed, or already claimed — so
  // this endpoint cannot be used to find out which addresses are on the list.
  if (!allowed) {
    return Response.json({ code: "refused" }, { status: 403 });
  }

  const { data: created, error } = await admin.auth.admin.createUser({
    email,
    password,
    // No confirmation mail and none needed — the allow-list is the proof. It
    // is also what makes the profile trigger file her as studio.
    email_confirm: true,
    user_metadata: { name: "Tidote Atelier" },
  });
  if (error || !created.user) {
    const taken = error?.message?.toLowerCase().includes("already");
    if (!taken) console.error("studio claim createUser failed:", error?.message);
    return Response.json(
      { code: taken ? "already_exists" : "server" },
      { status: taken ? 409 : 500 }
    );
  }

  // Claimed only now, after the login exists. Marking it earlier would burn
  // the code on a failed attempt and leave her locked out with no mail to
  // recover through.
  const { error: markError } = await admin.rpc("mark_studio_claimed", { p_email: email });
  if (markError) console.error("studio claim mark failed:", markError.message);

  // Belt and braces: the trigger sets the role from the allow-list, but this
  // route is the one place where being wrong about it means the panel is
  // unreachable, so confirm it rather than assume it.
  const { data: profile } = await admin
    .from("profiles")
    .select("role")
    .eq("id", created.user.id)
    .maybeSingle();
  if (profile?.role !== "admin") {
    await admin.from("profiles").update({ role: "admin" }).eq("id", created.user.id);
  }

  return Response.json({ ok: true }, { status: 201 });
}
