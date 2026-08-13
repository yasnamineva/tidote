"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { useAuth } from "@/lib/auth";
import { useLang } from "@/lib/i18n";
import { ADMIN, CLIENTS } from "@/lib/mock-data";

const DEMO_CLIENT = CLIENTS[0];

export default function LoginPage() {
  const { session, ready, login } = useAuth();
  const { t } = useLang();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (ready && session) {
      router.replace(session.role === "admin" ? "/admin" : "/dashboard");
    }
  }, [ready, session, router]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = login(email, password);
    if (!result.ok) {
      setError(result.error ?? t("auth.badLogin"));
      return;
    }
    setError(null);
    const normalized = email.trim().toLowerCase();
    router.push(normalized === ADMIN.email ? "/admin" : "/dashboard");
  }

  function fillClientDemo() {
    setEmail(DEMO_CLIENT.email);
    setPassword(DEMO_CLIENT.password);
    setError(null);
  }

  function fillAdminDemo() {
    setEmail(ADMIN.email);
    setPassword(ADMIN.password);
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
              <p className="text-sm text-accent border border-accent/40 bg-accent/5 px-3 py-2 animate-[fade-up_0.3s_ease-out_both]">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="btn-sweep mt-2 bg-ink text-cream px-6 py-3 text-sm uppercase tracking-[0.15em] transition-transform duration-300 hover:-translate-y-0.5"
            >
              {t("login.submit")}
            </button>

            <div className="flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={fillClientDemo}
                className="text-xs uppercase tracking-[0.15em] text-ink-soft hover:text-moss-deep transition-colors underline underline-offset-4"
              >
                {t("login.useClientDemo")}
              </button>
              <button
                type="button"
                onClick={fillAdminDemo}
                className="text-xs uppercase tracking-[0.15em] text-ink-soft hover:text-moss-deep transition-colors underline underline-offset-4"
              >
                {t("login.useAdminDemo")}
              </button>
            </div>
          </form>

          <p className="text-xs text-ink-soft text-center mt-6">
            {t("login.demoNote")} {t("login.demoClient")}:{" "}
            <span className="text-ink">{DEMO_CLIENT.email}</span> /{" "}
            <span className="text-ink">{DEMO_CLIENT.password}</span>,{" "}
            {t("login.demoAdmin")}: <span className="text-ink">{ADMIN.email}</span> /{" "}
            <span className="text-ink">{ADMIN.password}</span>
          </p>

          <p className="text-sm text-center mt-8">
            <Link href="/" className="link-underline text-ink-soft hover:text-ink">
              {t("login.back")}
            </Link>
          </p>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
