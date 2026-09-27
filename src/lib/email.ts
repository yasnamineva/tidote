/**
 * Outbound mail.
 *
 * Server only — it carries the API key. Every call is best-effort: a failure
 * here must never lose the thing the mail was about. The enquiry is already in
 * the database and the notification already raised before this is reached, so
 * the worst an outage costs is the nudge, not the message.
 *
 * Two ways out, and it takes whichever is configured.
 *
 * **SMTP** is the one to use here. The atelier already owns mailboxes at
 * Hostinger, so mail goes out as `support@tidoteatelier.com` from a domain
 * whose SPF already says Hostinger may send for it. Nothing to verify, no DNS
 * to touch, and the same credentials that make Supabase's confirmation and
 * reset mail work make these work — one password, pasted twice.
 *
 * **Resend** is the alternative, and the sender then has to be a subdomain
 * (`send.tidoteatelier.com`) with its own SPF and DKIM. Resend must never be
 * added to the root SPF record: that one belongs to the Hostinger mailboxes,
 * and breaking it breaks the atelier's actual email.
 *
 * Neither configured is a supported state rather than a bug — it reports
 * `skipped` and says which variable is missing, and nothing that calls this
 * fails because of it.
 */

export type MailResult =
  | { sent: true }
  | { sent: false; skipped: string }
  | { sent: false; error: string };

export type MailInput = {
  to: string;
  subject: string;
  /** Plain text. No template engine, no layout — these are short notes. */
  text: string;
  /** So she can hit reply and reach the person who asked. */
  replyTo?: string;
};

export async function sendEmail(input: MailInput): Promise<MailResult> {
  if (process.env.SMTP_HOST) return sendOverSmtp(input);
  return sendOverResend(input);
}

/**
 * The atelier's own mailbox. `SMTP_FROM` should be the same address as
 * `SMTP_USER`, because a mailbox provider will refuse to send as anyone else.
 */
async function sendOverSmtp(input: MailInput): Promise<MailResult> {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;
  const from = process.env.SMTP_FROM || user;
  if (!host) return { sent: false, skipped: "SMTP_HOST is not set" };
  if (!user) return { sent: false, skipped: "SMTP_USER is not set" };
  if (!pass) return { sent: false, skipped: "SMTP_PASSWORD is not set" };

  const port = Number(process.env.SMTP_PORT || 465);
  try {
    // Imported here rather than at the top so that the module stays loadable
    // in places that never send — and so a missing dependency cannot take a
    // page down with it.
    const { createTransport } = await import("nodemailer");
    const transport = createTransport({
      host,
      port,
      // 465 is implicit TLS; 587 upgrades with STARTTLS.
      secure: port === 465,
      auth: { user, pass },
      connectionTimeout: 8000,
      greetingTimeout: 8000,
      socketTimeout: 8000,
    });
    await transport.sendMail({
      from: `Tidote Atelier <${from}>`,
      to: input.to,
      subject: input.subject,
      text: input.text,
      replyTo: input.replyTo,
    });
    return { sent: true };
  } catch (e) {
    return { sent: false, error: e instanceof Error ? e.message : "unknown" };
  }
}

async function sendOverResend(input: MailInput): Promise<MailResult> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;

  if (!key) return { sent: false, skipped: "no mail transport configured (SMTP_HOST or RESEND_API_KEY)" };
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
