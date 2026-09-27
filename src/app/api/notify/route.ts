import { getAdminSupabase } from "@/lib/supabase/admin";
import { getServerSupabase } from "@/lib/supabase/server";
import { sendEmail, studioInbox } from "@/lib/email";
import {
  renderNotificationMail,
  type MailLang,
  type NotificationData,
} from "@/lib/notification-mail";
import type { NotificationKind } from "@/lib/mock-data";

/**
 * Sends the email for a notification that has just been raised.
 *
 * The bell is written from the browser, by whoever caused the event. Mail
 * cannot be: it needs credentials that must never reach a page. So the browser
 * writes the row and then points here, and this reads that row back on the
 * server and decides for itself what to send.
 *
 * Reading it back is the whole of the security. The caller sends an id and
 * nothing else — no address, no subject, no text — so the worst a signed-in
 * person can do by calling this is cause an email that the database already
 * says should exist, to the person the database says it belongs to. They
 * cannot compose one, and they cannot aim one.
 *
 * Failure is never the caller's problem. The event has already happened and
 * the bell is already ringing; a mail provider having a bad afternoon must not
 * turn that into an error on someone's screen.
 */

export async function POST(request: Request) {
  // Signed in as somebody — that is all this needs. The row itself decides who
  // is written to.
  const caller = await getServerSupabase();
  const {
    data: { user },
  } = await caller.auth.getUser();
  if (!user) return Response.json({ code: "not_signed_in" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const id = String(body?.id ?? "");
  if (!id) return Response.json({ code: "bad_input" }, { status: 400 });

  let admin;
  try {
    admin = getAdminSupabase();
  } catch {
    return Response.json({ sent: false, skipped: "no service key" }, { status: 200 });
  }

  // `*` rather than naming `data`: that column arrives with 0010, and asking
  // for a column that is not there yet fails the whole read — which turns
  // "here is the email for this alert" into "there is no such alert". The rows
  // are four short fields; there is nothing to save by naming them.
  const { data: row, error } = await admin
    .from("notifications")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error || !row) {
    return Response.json({ sent: false, skipped: "no such notification" }, { status: 200 });
  }

  // Who it is for, and in which language. A client's alert carries their id; the
  // studio's goes to her own mailbox, which is not a profile at all.
  let to = "";
  let recipientName = "";
  let lang: MailLang = "bg";

  if (row.audience === "client") {
    if (!row.profile_id) {
      return Response.json({ sent: false, skipped: "no recipient" }, { status: 200 });
    }
    const { data: profile } = await admin
      .from("profiles")
      .select("*")
      .eq("id", row.profile_id)
      .maybeSingle();
    if (!profile?.email) {
      return Response.json({ sent: false, skipped: "no address" }, { status: 200 });
    }
    to = profile.email;
    recipientName = profile.name ?? "";
    lang = profile.lang === "en" ? "en" : "bg";
  } else {
    to = studioInbox();
  }

  const mail = renderNotificationMail({
    kind: row.kind as NotificationKind,
    audience: row.audience as "client" | "admin",
    href: row.href || "/dashboard",
    data: (row.data ?? {}) as NotificationData,
    recipientName,
    lang,
  });
  // Some kinds are deliberately bell-only; see notification-mail.ts.
  if (!mail) return Response.json({ sent: false, skipped: "no mail for this kind" }, { status: 200 });

  const result = await sendEmail({ to, subject: mail.subject, text: mail.text });
  if (!result.sent && "error" in result) {
    console.error("notification mail failed:", row.kind, result.error);
  }
  return Response.json(result, { status: 200 });
}
