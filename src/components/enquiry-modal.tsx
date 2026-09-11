"use client";

import { useState } from "react";
import { useLang } from "@/lib/i18n";

/**
 * Asking about a piece without having an account.
 *
 * The rail card used to send people to Instagram, which meant the studio read
 * DMs and the site never knew a question had been asked. This puts the
 * question in the database, on her panel, and in her inbox.
 *
 * Email or telephone — one of the two, not both. Somebody who would rather
 * not hand over an address should still be able to ask about a jacket.
 */
export function EnquiryModal({
  pieceName,
  pieceId,
  onClose,
}: {
  pieceName?: string;
  pieceId?: string;
  onClose: () => void;
}) {
  const { t, lang } = useLang();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const field =
    "border border-line-strong bg-cream px-3 py-2 text-sm transition-colors focus:outline-none focus:border-moss-deep";
  const label = "text-xs uppercase tracking-[0.1em] text-ink-soft";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const looksLikeEmail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
    if (!looksLikeEmail && phone.trim().length < 6) {
      setError(t("enq.needContact"));
      return;
    }
    setBusy(true);
    try {
      const response = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name, email, phone, message, website, lang,
          pieceName: pieceName ?? "",
          pieceId: pieceId ?? null,
        }),
      });
      if (!response.ok) {
        const b = await response.json().catch(() => ({}));
        setError(b.error ?? t("enq.failed"));
        return;
      }
      setSent(true);
    } catch {
      setError(t("enq.failed"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-ink/50 p-4 sm:p-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="enq-title"
    >
      <div
        className="flex max-h-[88vh] w-full max-w-lg flex-col overflow-y-auto border border-line bg-cream shadow-[0_20px_50px_-20px_rgba(34,30,25,0.5)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-line px-6 py-4">
          <div>
            <h2 id="enq-title" className="font-display text-xl">
              {t("enq.title")}
            </h2>
            <p className="mt-1 text-sm text-ink-soft">
              {pieceName ? t("enq.about", { piece: pieceName }) : t("enq.sub")}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("common.close")}
            className="px-2 text-xl leading-none text-ink-soft transition-colors hover:text-ink"
          >
            ×
          </button>
        </div>

        {sent ? (
          <div className="flex flex-col items-start gap-3 px-6 py-8">
            <p className="font-display text-lg">{t("enq.sent")}</p>
            <p className="text-sm text-ink-soft">{t("enq.sentSub")}</p>
            <button
              type="button"
              onClick={onClose}
              className="btn-sweep mt-2 border border-ink px-6 py-2.5 text-xs uppercase tracking-[0.2em] transition-colors duration-300 hover:text-cream"
            >
              {t("common.close")}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-6 py-6">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="enq-name" className={label}>{t("enq.name")}</label>
              <input id="enq-name" required value={name} onChange={(e) => setName(e.target.value)} className={field} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="enq-email" className={label}>{t("enq.email")}</label>
                <input id="enq-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={field} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="enq-phone" className={label}>{t("enq.phone")}</label>
                <input id="enq-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={field} />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="enq-message" className={label}>{t("enq.message")}</label>
              <textarea id="enq-message" required rows={4} value={message} onChange={(e) => setMessage(e.target.value)} className={field} />
            </div>

            {/* Off-screen rather than display:none — some bots skip hidden
                fields but fill anything they can reach. */}
            <div className="absolute left-[-9999px]" aria-hidden="true">
              <label htmlFor="enq-website">Website</label>
              <input
                id="enq-website"
                tabIndex={-1}
                autoComplete="off"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
            </div>

            {error && (
              <p role="alert" className="text-sm text-accent">{error}</p>
            )}

            <button
              type="submit"
              disabled={busy}
              className="btn-sweep btn-sweep-moss border border-ink bg-ink px-6 py-3 text-xs uppercase tracking-[0.2em] text-cream transition-colors duration-300 disabled:opacity-60"
            >
              {busy ? t("enq.sending") : t("enq.send")}
            </button>
            <p className="text-xs text-ink-soft/80">{t("enq.privacy")}</p>
          </form>
        )}
      </div>
    </div>
  );
}
