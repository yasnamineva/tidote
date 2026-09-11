/**
 * Outbound mail.
 *
 * Server only — it carries the API key. Every call is best-effort: a failure
 * here must never lose the thing the mail was about. The enquiry is already in
 * the database and the notification already raised before this is reached, so
 * the worst an outage costs is the nudge, not the message.
 *
 * Nothing is configured yet, and that is a supported state rather than a bug:
 * with no `RESEND_API_KEY` it reports `skipped` and says why. Turning it on is
 * two environment variables, and the sender has to be a subdomain
 * (`send.tidoteatelier.com`) with its own SPF and DKIM — the root SPF belongs
 * to the Hostinger mailboxes and must not be touched.
 */

export type MailResult =
  | { sent: true }
  | { sent: false; skipped: string }
  | { sent: false; error: string };

export async function sendEmail(input: {
  to: string;
  subject: string;
  /** Plain text. No template engine, no layout — these are short notes. */
  text: string;
  /** So she can hit reply and reach the person who asked. */
  replyTo?: string;
}): Promise<MailResult> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;

  if (!key) return { sent: false, skipped: "RESEND_API_KEY is not set" };
  if (!from) return { sent: false, skipped: "RESEND_FROM is not set" };

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [input.to],
        subject: input.subject,
        text: input.text,
        ...(input.replyTo ? { reply_to: input.replyTo } : {}),
      }),
      // A hanging mail provider must not hold a request open.
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) {
      const body = await response.text().catch(() => "");
      return { sent: false, error: `${response.status} ${body.slice(0, 200)}` };
    }
    return { sent: true };
  } catch (e) {
    return { sent: false, error: e instanceof Error ? e.message : "unknown" };
  }
}

/** Where studio notifications go. Her own mailbox, not the sending domain. */
export function studioInbox(): string {
  return process.env.STUDIO_EMAIL || "support@tidoteatelier.com";
}
