"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
 * Setting up the studio account, once, from the website.
 *
 * Two fields, because two things decide it: the address is on the allow-list in
 * the database, and the password is hers to choose. Nothing is emailed, which is
 * the point of this page — the confirmation mail Supabase's own mailer will not
 * send is what made registering impossible.
 *
 * On success it signs her straight in, because the password she just typed is
 * the password of the account that now exists, and asking her to type it again
 * on the login page would be a step with no purpose.
 */
export default function StudioSetupPage() {
  const { session, ready, login } = useAuth();
  const { t } = useLang();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Already signed in as the studio: there is nothing to set up.
  useEffect(() => {
    if (ready && session?.role === "admin") router.replace("/admin");
  }, [ready, session, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      setError(t("signup.shortPassword"));
      return;
    }
    if (password !== confirm) {
      setError(t("studio.mismatch"));
      return;
    }
    setBusy(true);
    setError(null);

    let response;
    try {
      response = await fetch("/api/studio/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
    } catch {
      setBusy(false);
      setError(t("auth.unreachable"));
      return;
    }

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      // The route answers with a code and never with the database's words, and
      // every kind of "no" on the allow-list arrives as one answer — so this
      // page cannot be used to find out which addresses are listed either.
      const byCode: Record<string, string> = {
        refused: t("studio.refused"),
        already_exists: t("studio.exists"),
        rate_limited: t("studio.tooMany"),
        bad_input: t("studio.badInput"),
        not_configured: t("studio.notReady"),
      };
      setBusy(false);
      setError(byCode[body.code] ?? t("studio.failed"));
      return;
    }

    // The account exists with this password; sign in with it rather than
    // sending her to the door she has just been given the key to.
    const result = await login(email, password);
    setBusy(false);
    if (!result.ok) {
      setError(t("studio.madeButNoSignIn"));
      return;
    }
    router.replace("/admin");
  }

  return (
    <AuthShell eyebrow={t("studio.eyebrow")} title={t("studio.title")}>
      <form onSubmit={handleSubmit} className={formCls}>
        <FormNotice>{t("studio.blurb")}</FormNotice>

        <div className="flex flex-col gap-2">
          <label htmlFor="studio-email" className={labelCls}>
            {t("login.email")}
          </label>
          <input
            id="studio-email"
            type="email"
            required
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={fieldCls}
            placeholder="you@tidoteatelier.com"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="studio-password" className={labelCls}>
            {t("studio.newPassword")}
          </label>
          <input
            id="studio-password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={fieldCls}
            placeholder="••••••••"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="studio-confirm" className={labelCls}>
            {t("studio.repeatPassword")}
          </label>
          <input
            id="studio-confirm"
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
          {busy ? t("common.saving") : t("studio.submit")}
        </button>
      </form>
    </AuthShell>
  );
}
