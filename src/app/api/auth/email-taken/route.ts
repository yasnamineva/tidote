import { getAdminSupabase } from "@/lib/supabase/admin";

/**
 * Whether an address already has an account here.
 *
 * Supabase deliberately will not tell you. A signup for an existing address is
 * answered exactly like a signup for a new one and no mail is sent, so that
 * this form cannot be used to find out who is registered — and the person who
 * owns that address is left watching an inbox for a message that was never
 * sent. That is what happened to the owner of this site.
 *
 * So the atelier chose the other side of the trade, knowingly: the form says
 * the address is taken. The cost is that someone can now ask this endpoint
 * whether a given person has an account at a small menswear studio. The
 * benefit is that nobody is ever stuck at that dead end again. For a shop with
 * a few dozen clients, that is the better bargain.
 *
 * What it will not do is make the asking cheap or informative. One bit comes
 * back and nothing else — no name, no role, no dates — and the rate limit is
 * low enough that a list of addresses is slow to walk through.
 */

const HOUR = 60 * 60 * 1000;
const asked = new Map<string, number[]>();

function tooMany(ip: string): boolean {
  const now = Date.now();
  const hits = (asked.get(ip) ?? []).filter((t) => now - t < HOUR);
  hits.push(now);
  asked.set(ip, hits);
  if (asked.size > 500) {
    for (const [key, times] of asked) {
      if (times.every((t) => now - t > HOUR)) asked.delete(key);
    }
  }
  return hits.length > 20;
}

function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || "unknown";
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = String(body?.email ?? "").trim().toLowerCase().slice(0, 160);

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return Response.json({ code: "bad_input" }, { status: 400 });
  }
  if (tooMany(clientIp(request))) {
    return Response.json({ code: "rate_limited" }, { status: 429 });
  }

  let admin;
  try {
    admin = getAdminSupabase();
  } catch {
    // No service key: the form carries on and Supabase's own answer stands.
    // Better a missing warning than a registration nobody can complete.
    return Response.json({ taken: false, checked: false }, { status: 200 });
  }

  const { data, error } = await admin
    .from("profiles")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (error) {
    console.error("email-taken check failed:", error.message);
    return Response.json({ taken: false, checked: false }, { status: 200 });
  }

  return Response.json({ taken: Boolean(data), checked: true }, { status: 200 });
}
