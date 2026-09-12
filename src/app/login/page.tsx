"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { useAuth } from "@/lib/auth";
import { useLang } from "@/lib/i18n";

/**
 * The one account whose credentials may be shown on a public page. It is a real
 * login like any other — the difference is that everything behind it is invented,
 * so handing it out costs no client their measurements. Unset the two variables
 * and the demo button disappears.
 */
const DEMO_EMAIL = process.env.NEXT_PUBLIC_DEMO_EMAIL ?? "";
const DEMO_PASSWORD = process.env.NEXT_PUBLIC_DEMO_PASSWORD ?? "";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const { session, ready, sessionError, login, requestPasswordReset } = useAuth();
  const { t } = useLang();
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  /** Where the proxy turned them away from, so they land where they meant to. */
  const next = params.get("next");

  useEffect(() => {
    if (ready && session) {
      const home = session.role === "admin" ? "/admin" : "/dashboard";
      router.replace(next && next.startsWith("/") ? next : home);
    }
  }, [ready, session, router, next]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const result = await login(email, password);
      if (!result.ok) {
        setError(result.error ?? t("auth.badLogin"));
        return;
      }
      // The redirect happens in the effect above once the session lands, so
      // both routes through this page end up in the same place.
    } catch {
      setError(t("auth.badLogin"));
    } finally {
      setBusy(false);
    }
  }

  /** Never says whether the address exists — that would make this a way to
   *  find out who has an account here. */
  async function handleForgot() {
    if (!email.trim()) {
      setError(t("forgot.needEmail"));
      return;
    }
    setBusy(true);
    setError(null);
    const result = await requestPasswordReset(email);
    setBusy(false);
    if (!result.ok) {
      setError(result.error ?? t("auth.unreachable"));
      return;
    }
    setResetSent(true);
  }

  function fillClientDemo() {
    setEmail(DEMO_EMAIL);
    setPassword(DEMO_PASSWORD);
    setError(null);
  }

  return (
    <>
      <SiteHeader />
      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-md animate-[fade-up_0.6s_cubic-bezier(0.16,1,0.3,1)_both]">
          <p className="text-xs uppercase tracking-[0.3em] text-moss-deep mb-3 text-center">
            {t("login.eyebrow")}
          </p>
          <h1 className="font-display text-3xl md:text-4xl mb-8 text-center">
            {t("login.title")}
          </h1>

          {/* Sent here by a failed read rather than by signing out: the
              session is still in the cookies and there is nothing wrong with
              the password, so saying nothing would have them hunting for a
              typo that is not there. */}
          {sessionError && (
            <p
              role="alert"
              className="mb-4 border border-accent/40 bg-accent/5 px-4 py-3 text-sm text-ink-soft"
            >
              {t("login.sessionUnreadable")}
            </p>
          )}

          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4 bg-paper border border-line px-6 py-8 shadow-[0_0_0_0_rgba(74,82,56,0)] transition-shadow duration-500 focus-within:shadow-[0_0_0_4px_rgba(74,82,56,0.12)]"
          >
            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="text-xs uppercase tracking-[0.15em]">
                {t("login.email")}
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border border-line-strong bg-cream px-4 py-3 text-sm transition-colors focus:outline-none focus:border-moss-deep"
                placeholder="you@email.com"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="password" className="text-xs uppercase tracking-[0.15em]">
                {t("login.password")}
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border border-line-strong bg-cream px-4 py-3 text-sm transition-colors focus:outline-none focus:border-moss-deep"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p
                role="alert"
                className="text-sm text-accent border border-accent/40 bg-accent/5 px-3 py-2 animate-[fade-up_0.3s_ease-out_both]"
              >
                {error}
              </p>
            )}

            {resetSent && (
              <p
                role="status"
                className="text-sm text-moss-deep border border-moss-deep/40 bg-moss-soft px-3 py-2 animate-[fade-up_0.3s_ease-out_both]"
              >
                {t("forgot.sent")}
              </p>
            )}

            <button
              type="submit"
              disabled={busy}
              className="btn-sweep mt-2 bg-ink text-cream px-6 py-3 text-sm uppercase tracking-[0.15em] transition-transform duration-300 hover:-translate-y-0.5 disabled:opacity-60"
            >
              {busy ? t("login.submitting") : t("login.submit")}
            </button>

            <div className="flex items-center justify-center">
              <button
                type="button"
                onClick={handleForgot}
                disabled={busy}
                className="text-xs uppercase tracking-[0.15em] py-2 -my-1 text-ink-soft hover:text-moss-deep transition-colors underline underline-offset-4 disabled:opacity-60"
              >
                {t("forgot.link")}
              </button>
            </div>

            {DEMO_EMAIL && (
              <div className="flex items-center justify-center">
                <button
                  type="button"
                  onClick={fillClientDemo}
                  className="text-xs uppercase tracking-[0.15em] py-2 -my-1 text-ink-soft hover:text-moss-deep transition-colors underline underline-offset-4"
                >
                  {t("login.useClientDemo")}
                </button>
              </div>
            )}
          </form>

          {DEMO_EMAIL && (
            <p className="text-xs text-ink-soft text-center mt-6">
              {t("login.demoNote")}
            </p>
          )}

          <p className="text-sm text-center text-ink-soft mt-6">
            {t("login.noAccount")}{" "}
            <Link
              href="/signup"
              className="link-underline text-ink hover:text-moss-deep"
            >
              {t("login.createOne")}
            </Link>
          </p>

          <p className="text-sm text-center mt-6">
            <Link href="/" className="link-underline inline-block py-2 text-ink-soft hover:text-ink">
              {t("login.back")}
            </Link>
          </p>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
