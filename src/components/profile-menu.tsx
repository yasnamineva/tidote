"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

/**
 * The menu for a signed-in account: a full-height column down the left, the
 * way an application's own navigation usually sits.
 *
 * Not a panel floating in the margin — it holds the left edge from under the
 * site header to the foot of the window, and stays there as the page scrolls.
 * Same shape as the studio panel's sidebar, so the two feel like one product.
 * Sign out sits at the bottom, below a rule, away from anything you might
 * click on purpose.
 *
 * Below `lg` there is no room for a column beside the content, so it becomes a
 * drawer over the same edge — opened from a pinned button, not the site's own
 * hamburger, which is a different menu about a different thing.
 */

const ICONS: Record<string, React.ReactNode> = {
  ruler: (
    <>
      <rect x="2" y="8" width="20" height="8" rx="1" />
      <path d="M7 8v3M12 8v4M17 8v3" />
    </>
  ),
  tag: (
    <>
      <path d="M3 7v6l8 8 8-8-8-8H5a2 2 0 0 0-2 2z" />
      <circle cx="8" cy="10" r="1.2" />
    </>
  ),
  calendar: (
    <>
      <rect x="4" y="5" width="16" height="16" rx="2" />
      <path d="M4 10h16M9 3v4M15 3v4" />
    </>
  ),
  truck: (
    <>
      <path d="M2 7h11v9H2zM13 10h4l4 3v3h-8" />
      <circle cx="6" cy="18" r="1.6" />
      <circle cx="17" cy="18" r="1.6" />
    </>
  ),
  hanger: (
    <>
      <path d="M12 6a1.8 1.8 0 1 1 1.3 1.73L12 9" />
      <path d="M12 9 3.6 15.2A1 1 0 0 0 4.2 17h15.6a1 1 0 0 0 .6-1.8z" />
    </>
  ),
  inbox: (
    <>
      <path d="M4 13h4l2 3h4l2-3h4" />
      <path d="M4 13 6 5h12l2 8v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  home: (
    <>
      <path d="M3 11l9-7 9 7" />
      <path d="M5 10v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-9" />
      <path d="M10 20v-6h4v6" />
    </>
  ),
  logout: (
    <>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5M21 12H9" />
    </>
  ),
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
};

function MenuIcon({ name }: { name: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {ICONS[name]}
    </svg>
  );
}

export type MenuItem = {
  key: string;
  icon: string;
  label: string;
  badge?: number;
  active?: boolean;
  /** A link, or a button — one of the two. */
  href?: string;
  onSelect?: () => void;
  /** Sign out reads red on hover; nothing else does. */
  danger?: boolean;
};

function Row({ item, onNavigate }: { item: MenuItem; onNavigate: () => void }) {
  const cls = `flex w-full items-center gap-2.5 rounded px-3 py-2 text-left text-sm transition-colors ${
    item.active
      ? "bg-accent-soft/40 text-accent"
      : item.danger
        ? "text-ink-soft hover:bg-ink/[0.04] hover:text-accent"
        : "text-ink-soft hover:bg-ink/[0.04] hover:text-ink"
  }`;
  const inner = (
    <>
      <MenuIcon name={item.icon} />
      <span className="flex-1 truncate">{item.label}</span>
      {item.badge !== undefined && item.badge > 0 && (
        <span className="text-xs tabular-nums text-ink-soft/70">{item.badge}</span>
      )}
    </>
  );

  if (item.href) {
    return (
      <Link href={item.href} onClick={onNavigate} className={cls}>
        {inner}
      </Link>
    );
  }
  return (
    <button
      type="button"
      onClick={() => {
        item.onSelect?.();
        onNavigate();
      }}
      className={cls}
    >
      {inner}
    </button>
  );
}

export function ProfileMenu({
  title,
  items,
  bottom,
  stickyTop,
  openLabel,
  closeLabel,
}: {
  title: string;
  /** The places in the account. */
  items: MenuItem[];
  /** Below the rule. Sign out belongs last. */
  bottom: MenuItem[];
  /** Where the rail should stop when it sticks — under the page's fixed bars. */
  stickyTop: number;
  openLabel: string;
  closeLabel: string;
}) {
  const [open, setOpen] = useState(false);

  // A drawer that survives a rotation into the desktop rail leaves an
  // invisible overlay swallowing clicks.
  useEffect(() => {
    if (!open) return;
    const mq = window.matchMedia("(min-width: 1024px)");
    const close = () => mq.matches && setOpen(false);
    close();
    mq.addEventListener("change", close);
    return () => mq.removeEventListener("change", close);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const panel = (
    <nav className="flex h-full flex-col border-line bg-paper px-3 py-4">
      <p className="px-3 pb-3 text-[10px] uppercase tracking-[0.2em] text-ink-soft/60">
        {title}
      </p>
      <div className="flex flex-col gap-0.5 overflow-y-auto">
        {items.map((item) => (
          <Row key={item.key} item={item} onNavigate={() => setOpen(false)} />
        ))}
      </div>
      <div className="mt-auto flex flex-col gap-0.5 border-t border-line pt-3">
        {bottom.map((item) => (
          <Row key={item.key} item={item} onNavigate={() => setOpen(false)} />
        ))}
      </div>
    </nav>
  );

  return (
    <>
      {/* The column. Sticks under the site header and runs to the foot of the
          window; its list scrolls on its own, so a long account cannot push
          sign out off the bottom. */}
      <aside className="hidden w-60 shrink-0 border-r border-line bg-paper lg:block">
        <div
          className="sticky flex flex-col"
          style={{ top: stickyTop, height: `calc(100vh - ${stickyTop}px)` }}
        >
          {panel}
        </div>
      </aside>

      {/* Below lg: a pinned button, and the same list as a drawer over the
          same edge it holds on a wide screen. */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="btn-sweep fixed bottom-5 right-5 z-40 flex items-center gap-2 border border-ink bg-cream px-4 py-3 text-xs uppercase tracking-[0.15em] shadow-[0_10px_30px_-12px_rgba(34,30,25,0.6)] transition-colors duration-300 hover:text-cream lg:hidden"
      >
        <MenuIcon name="menu" />
        {openLabel}
      </button>

      {open && (
        <div className="fixed inset-0 z-[70] flex lg:hidden">
          <div className="w-64 max-w-[80vw] border-r border-line bg-paper">
            {panel}
          </div>
          <button
            type="button"
            aria-label={closeLabel}
            className="flex-1 bg-ink/40"
            onClick={() => setOpen(false)}
          />
        </div>
      )}
    </>
  );
}
