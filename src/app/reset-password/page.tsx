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
 * Where the link in a reset email lands.
 *
 * Supabase turns that link into a real, short-lived session before this page
 * renders, which is why there is no token to handle here — if `session` is set
 * the link was good, and if it is not the link has expired or was opened in a
 * different browser than it was requested from.
 */
export default function ResetPasswordPage() {
  const { session, ready, updatePassword } = useAuth();
  const { t } = useLang();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!done) return;
    const id = window.setTimeout(() => {
      router.replace(session?.role === "admin" ? "/admin" : "/dashboard");
    }, 1800);
    return () => window.clearTimeout(id);
  }, [done, session, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      setError(t("signup.shortPassword"));
      return;
    }
    if (password !== confirm) {
      setError(t("reset.mismatch"));
      return;
    }
    setBusy(true);
    setError(null);
    const result = await updatePassword(password);
    setBusy(false);
    if (!result.ok) {
      setError(result.error ?? t("reset.failed"));
      return;
    }
    setDone(true);
  }

  if (ready && !session) {
    return (
      <AuthShell eyebrow={t("reset.eyebrow")} title={t("reset.expiredTitle")}>
        <div className={formCls}>
          <p className="text-sm text-ink-soft">{t("reset.expiredBody")}</p>
          <Link
            href="/login"
            className="link-underline inline-block py-2 text-sm text-ink-soft hover:text-ink"
          >
            {t("reset.askAgain")}
          </Link>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell eyebrow={t("reset.eyebrow")} title={t("reset.title")}>
      {done ? (
        <div className={formCls}>
          <FormNotice>{t("reset.done")}</FormNotice>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className={formCls}>
          <div className="flex flex-col gap-2">
            <label htmlFor="password" className={labelCls}>
              {t("reset.newPassword")}
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
              {t("reset.confirm")}
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
            {busy ? t("reset.saving") : t("reset.submit")}
          </button>
        </form>
      )}
    </AuthShell>
  );
}
