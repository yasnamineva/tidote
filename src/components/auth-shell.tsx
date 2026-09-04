"use client";

import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

/**
 * The frame the three account pages share — sign in, register, set a new
 * password. They were one page's worth of markup copied three times otherwise,
 * and the point of them being identical is that they feel like one place.
 */
export function AuthShell({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <SiteHeader />
      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-md animate-[fade-up_0.6s_cubic-bezier(0.16,1,0.3,1)_both]">
          <p className="text-xs uppercase tracking-[0.3em] text-moss-deep mb-3 text-center">
            {eyebrow}
          </p>
          <h1 className="font-display text-3xl md:text-4xl mb-8 text-center text-balance">
            {title}
          </h1>
          {children}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

export const fieldCls =
  "border border-line-strong bg-cream px-4 py-3 text-sm transition-colors focus:outline-none focus:border-moss-deep";
export const labelCls = "text-xs uppercase tracking-[0.15em]";
export const formCls =
  "flex flex-col gap-4 bg-paper border border-line px-6 py-8 shadow-[0_0_0_0_rgba(74,82,56,0)] transition-shadow duration-500 focus-within:shadow-[0_0_0_4px_rgba(74,82,56,0.12)]";
export const submitCls =
  "btn-sweep mt-2 bg-ink text-cream px-6 py-3 text-sm uppercase tracking-[0.15em] transition-transform duration-300 hover:-translate-y-0.5 disabled:opacity-60";

export function FormError({ children }: { children: React.ReactNode }) {
  return (
    // role="alert" so a screen reader announces the problem instead of leaving
    // it to be discovered by re-reading the form.
    <p
      role="alert"
      className="text-sm text-accent border border-accent/40 bg-accent/5 px-3 py-2 animate-[fade-up_0.3s_ease-out_both]"
    >
      {children}
    </p>
  );
}

export function FormNotice({ children }: { children: React.ReactNode }) {
  return (
    <p
      role="status"
      className="text-sm text-moss-deep border border-moss-deep/40 bg-moss-soft px-3 py-2 animate-[fade-up_0.3s_ease-out_both]"
    >
      {children}
    </p>
  );
}
