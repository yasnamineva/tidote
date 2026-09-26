"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  AuthShell,
  FormError,
  FormNotice,
  fieldCls,
  formCls,
  labelCls,
  submitCls,
} from "@/components/auth-shell";
import { PasswordField } from "@/components/password-field";
import { useAuth } from "@/lib/auth";
import { useLang } from "@/lib/i18n";
import { passwordAcceptable } from "@/lib/password";

/**
 * Registering yourself. The other way in is the studio adding you from the
 * panel, which produces exactly the same kind of account — a client, with an
 * empty measurement sheet and nothing ordered.
 */
export default function SignupPage() {
  const { session, ready, signUp } = useAuth();
  const { t } = useLang();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [taken, setTaken] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (ready && session) {
      router.replace(session.role === "admin" ? "/admin" : "/dashboard");
    }
  }, [ready, session, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!passwordAcceptable(password)) {
      // The list under the field has been saying which one all along; this is
      // the backstop for someone who submitted anyway.
      setError(t("pw.notYet"));
      return;
    }
    // Asked twice and checked here: the field hides what was typed, so a typo
    // in it is otherwise discovered at the next sign-in, by which time there is
    // an account nobody can get into and a confirmation mail that will not
    // arrive twice.
    if (password !== confirm) {
      setError(t("auth.passwordMismatch"));
      return;
    }
    setBusy(true);
    setError(null);

    // Asked before registering, because Supabase will not say. It answers a
    // signup for an existing address exactly as it answers a new one and sends
    // no mail, which leaves the person who owns that address watching an inbox
    // for nothing. The studio would rather be told.
    try {
      const probe = await fetch("/api/auth/email-taken", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const seen = await probe.json().catch(() => ({}));
      if (seen.taken) {
        setBusy(false);
        setTaken(true);
        setError(null);
        return;
      }
    } catch {
      // Unreachable, or the server has no key to ask with. Carry on: a
      // registration that might work beats a warning that might be wrong.
    }

    const result = await signUp(name, email, password, marketing);
    setBusy(false);
    if (!result.ok) {
      setError(result.error ?? t("signup.failed"));
      return;
    }
    // With confirmation on they cannot sign in yet; with it off the session
    // arrives and the effect above moves them along.
    if (result.needsConfirmation) setSent(true);
  }

  return (
    <AuthShell eyebrow={t("signup.eyebrow")} title={t("signup.title")}>
      {sent ? (
        <div className={formCls}>
          <FormNotice>{t("signup.checkEmail", { email })}</FormNotice>
          <p className="text-sm text-ink-soft">{t("signup.checkEmailSub")}</p>
          {/* Said to everyone, in the same words, whether or not the address
              already has an account — so it still reveals nothing about who is
              registered here. Without it, the one case where no mail is sent
              (an address that already exists) looks exactly like the case where
              one is, and the person waits for something that is never coming.
              It happened to the owner of this site. */}
          <p className="border-t border-line pt-4 text-sm text-ink-soft">
            {t("signup.alreadyHave")}
          </p>
          <div className="flex flex-wrap items-center gap-x-5">
            <Link
              href="/login"
              className="link-underline inline-block py-2 text-sm text-ink-soft hover:text-ink"
            >
              {t("signup.toLogin")}
            </Link>
            <Link
              href="/reset-password"
              className="link-underline inline-block py-2 text-sm text-ink-soft hover:text-ink"
            >
              {t("signup.forgotInstead")}
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className={formCls}>
          <div className="flex flex-col gap-2">
            <label htmlFor="name" className={labelCls}>
              {t("signup.name")}
            </label>
            <input
              id="name"
              type="text"
              required
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={fieldCls}
              placeholder={t("signup.namePlaceholder")}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="email" className={labelCls}>
              {t("login.email")}
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={fieldCls}
              placeholder="you@email.com"
            />
          </div>

          <PasswordField
            id="password"
            label={t("login.password")}
            value={password}
            onChange={setPassword}
            autoComplete="new-password"
            minLength={8}
            showRules
          />

          <PasswordField
            id="confirm"
            label={t("signup.repeatPassword")}
            value={confirm}
            onChange={setConfirm}
            autoComplete="new-password"
            minLength={8}
          />

          {/* Asked once, here, and changeable afterwards from the account. Off
              by default: nobody is subscribed to anything by not noticing a
              ticked box. */}
          <label className="flex items-start gap-3 text-sm text-ink-soft">
            <input
              type="checkbox"
              checked={marketing}
              onChange={(e) => setMarketing(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 accent-moss-deep"
            />
            <span>
              {t("signup.marketing")}
              <span className="mt-0.5 block text-xs text-ink-soft/80">
                {t("signup.marketingHint")}
              </span>
            </span>
          </label>

          {taken && (
            <div
              role="alert"
              className="flex flex-col gap-2 border border-accent/40 bg-accent/5 px-3 py-3 text-sm animate-[fade-up_0.3s_ease-out_both]"
            >
              <p className="text-accent">{t("signup.taken")}</p>
              <div className="flex flex-wrap items-center gap-x-5">
                <Link
                  href="/login"
                  className="link-underline inline-block py-1 text-ink-soft hover:text-ink"
                >
                  {t("signup.toLogin")}
                </Link>
                <Link
                  href="/reset-password"
                  className="link-underline inline-block py-1 text-ink-soft hover:text-ink"
                >
                  {t("signup.forgotInstead")}
                </Link>
              </div>
            </div>
          )}

          {error && <FormError>{error}</FormError>}

          <button type="submit" disabled={busy} className={submitCls}>
            {busy ? t("signup.submitting") : t("signup.submit")}
          </button>

          <p className="text-sm text-center text-ink-soft">
            {t("signup.haveAccount")}{" "}
            <Link href="/login" className="link-underline text-ink hover:text-moss-deep">
              {t("signup.signIn")}
            </Link>
          </p>
        </form>
      )}
    </AuthShell>
  );
}
