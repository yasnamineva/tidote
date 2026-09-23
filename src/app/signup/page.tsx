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
import { useAuth } from "@/lib/auth";
import { useLang } from "@/lib/i18n";

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
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (ready && session) {
      router.replace(session.role === "admin" ? "/admin" : "/dashboard");
    }
  }, [ready, session, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      setError(t("signup.shortPassword"));
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
    const result = await signUp(name, email, password);
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
          <Link
            href="/login"
            className="link-underline inline-block py-2 text-sm text-ink-soft hover:text-ink"
          >
            {t("signup.toLogin")}
          </Link>
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

          <div className="flex flex-col gap-2">
            <label htmlFor="password" className={labelCls}>
              {t("login.password")}
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={fieldCls}
              placeholder="••••••••"
            />
            <p className="text-xs text-ink-soft">{t("signup.passwordHint")}</p>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="confirm" className={labelCls}>
              {t("signup.repeatPassword")}
            </label>
            <input
              id="confirm"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className={fieldCls}
              placeholder="••••••••"
            />
          </div>

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
