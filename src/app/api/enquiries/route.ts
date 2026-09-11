import { getAdminSupabase } from "@/lib/supabase/admin";
import { sendEmail, studioInbox } from "@/lib/email";

/**
 * A question from someone without an account.
 *
 * This is the site's only public write, so it is the only endpoint a stranger
 * can reach at all — which is why the rate limit lives here and nowhere else.
 *
 * It runs with the service key, because one request has to do three things a
 * visitor has no right to do: file the enquiry, raise a notification for the
 * studio, and send her the mail. The order matters. The row is written first
 * and the notification second; the mail is last and its failure is not the
 * caller's problem, because by then the enquiry is already safe and visible in
 * the panel. A mail provider being down must not lose a customer's question.
 */

const MAX = { name: 120, email: 160, phone: 40, message: 2000, piece: 160 };

/**
 * Six per hour per address, counted in memory.
 *
 * Deliberately modest: this is one instance's view, and on Vercel a second
 * instance starts with an empty map, so it is a brake and not a gate. It costs
 * nothing and stops the obvious case — someone holding down a submit button.
 * A real limit would need shared state, which is not worth a table yet.
 */
const HOUR = 60 * 60 * 1000;
const seen = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const hits = (seen.get(ip) ?? []).filter((t) => now - t < HOUR);
  hits.push(now);
  seen.set(ip, hits);
  // Without this the map grows for as long as the instance lives.
  if (seen.size > 500) {
    for (const [key, times] of seen) {
      if (times.every((t) => now - t > HOUR)) seen.delete(key);
    }
  }
  return hits.length > 6;
}

function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || "unknown";
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  // A field no person sees and no person fills.
  if (typeof body?.website === "string" && body.website.trim() !== "") {
    return Response.json({ ok: true }, { status: 202 });
  }

  const name = String(body?.name ?? "").trim().slice(0, MAX.name);
  const email = String(body?.email ?? "").trim().toLowerCase().slice(0, MAX.email);
  const phone = String(body?.phone ?? "").trim().slice(0, MAX.phone);
  const message = String(body?.message ?? "").trim().slice(0, MAX.message);
  const pieceName = String(body?.pieceName ?? "").trim().slice(0, MAX.piece);
  const pieceId = typeof body?.pieceId === "string" ? body.pieceId : null;
  const lang = body?.lang === "en" ? "en" : "bg";

  if (!name || !message) {
    return Response.json({ error: "A name and a message." }, { status: 400 });
  }
  // One way to reach them back, or the enquiry is a dead end.
  const looksLikeEmail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
  if (!looksLikeEmail && phone.length < 6) {
    return Response.json({ error: "An email address or a telephone number." }, { status: 400 });
  }

  if (rateLimited(clientIp(request))) {
    return Response.json(
      { error: "Too many enquiries from here just now. Try again later." },
      { status: 429 }
    );
  }

  const admin = getAdminSupabase();

  const { data: row, error } = await admin
    .from("enquiries")
    .insert({
      name,
      email: looksLikeEmail ? email : "",
      phone,
      message,
      piece_id: pieceId,
      piece_name: pieceName,
      lang,
    })
    .select("id")
    .single();
  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  // In the panel, whether or not the mail gets through.
  await admin.from("notifications").insert({
    audience: "admin",
    profile_id: null,
    kind: "enquiry",
    text: pieceName
      ? `${name} asked about ${pieceName}.`
      : `${name} sent an enquiry.`,
    href: "/admin/inbox",
  });

  const mail = await sendEmail({
    to: studioInbox(),
    subject: pieceName
      ? `Enquiry: ${pieceName} — ${name}`
      : `Enquiry from ${name}`,
    replyTo: looksLikeEmail ? email : undefined,
    text: [
      `${name} sent an enquiry through tidoteatelier.com.`,
      "",
      pieceName ? `Piece:   ${pieceName}` : null,
      looksLikeEmail ? `Email:   ${email}` : null,
      phone ? `Phone:   ${phone}` : null,
      `Written in: ${lang === "bg" ? "Bulgarian" : "English"}`,
      "",
      message,
      "",
      "— Reply to this mail to answer them directly.",
    ]
      .filter((line) => line !== null)
      .join("\n"),
  });

  // Reported, not thrown: the enquiry is already filed and already on screen
  // in the panel. The caller is told it worked, because it did.
  return Response.json(
    { ok: true, id: row.id, email: mail.sent ? "sent" : "not_sent" },
    { status: 201 }
  );
}
