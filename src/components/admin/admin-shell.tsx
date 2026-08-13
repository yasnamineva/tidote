"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { useLang } from "@/lib/i18n";
import { useNotifications } from "@/lib/notifications";
import { categoryLabel } from "@/lib/translations";
import { getAllClientsWithLiveData } from "@/lib/admin-data";
import {
  ORDER_CATEGORIES,
  type Client,
  type OrderCategory,
} from "@/lib/mock-data";
import { Wordmark } from "@/components/wordmark";

export const ALL_ORDERS_HREF = "/admin/orders/category/all";

/**
 * Lets the All Orders page tell the sidebar which category its filter is on,
 * so the nav highlight follows the filter instead of staying on "All".
 */
const OrderFilterContext = createContext<{
  filterCategory: OrderCategory | null;
  setFilterCategory: (category: OrderCategory | null) => void;
}>({ filterCategory: null, setFilterCategory: () => {} });

export function useOrderFilter() {
  return useContext(OrderFilterContext);
}

/** Reusable page top bar for admin routes. */
export function AdminTopBar({
  title,
  actions,
}: {
  title: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex items-start sm:items-center justify-between gap-4 flex-wrap mb-8">
      <h1 className="font-display text-2xl md:text-3xl">{title}</h1>
      {actions && <div className="flex items-center gap-3 flex-wrap">{actions}</div>}
    </div>
  );
}

const ICONS: Record<string, React.ReactNode> = {
  people: (
    <path d="M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm7 0a3 3 0 1 0 0-6M3 20a6 6 0 0 1 12 0M14 14a6 6 0 0 1 7 6" />
  ),
  tag: (
    <>
      <path d="M3 7v6l8 8 8-8-8-8H5a2 2 0 0 0-2 2z" />
      <circle cx="8" cy="10" r="1.2" />
    </>
  ),
  inbox: (
    <>
      <path d="M4 13h4l2 3h4l2-3h4" />
      <path d="M4 13 6 5h12l2 8v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z" />
    </>
  ),
  calendar: (
    <>
      <rect x="4" y="5" width="16" height="16" rx="2" />
      <path d="M4 10h16M9 3v4M15 3v4" />
    </>
  ),
  chart: (
    <>
      <path d="M4 20V10M10 20V5M16 20v-7M22 20H2" />
    </>
  ),
  logout: (
    <>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5M21 12H9" />
    </>
  ),
};

function NavIcon({ name }: { name: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {ICONS[name]}
    </svg>
  );
}

function NavItem({
  href,
  icon,
  label,
  badge,
  active,
  onNavigate,
}: {
  href: string;
  icon: string;
  label: string;
  badge?: number;
  active: boolean;
  onNavigate: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={`flex items-center gap-2.5 px-3 py-2 rounded text-sm transition-colors ${
        active
          ? "bg-accent-soft/40 text-accent"
          : "text-ink-soft hover:text-ink hover:bg-ink/[0.04]"
      }`}
    >
      <NavIcon name={icon} />
      <span className="flex-1 truncate">{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className="text-xs text-ink-soft/70 tabular-nums">{badge}</span>
      )}
    </Link>
  );
}

function GroupLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-3 mt-6 mb-2 text-[10px] uppercase tracking-[0.2em] text-ink-soft/60">
      {children}
    </p>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const { session, ready, logout } = useAuth();
  const { notifications } = useNotifications();
  const { t, lang } = useLang();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [filterCategory, setFilterCategory] = useState<OrderCategory | null>(
    null
  );

  useEffect(() => {
    if (ready && (!session || session.role !== "admin")) {
      router.replace("/login");
    }
  }, [ready, session, router]);

  useEffect(() => {
    if (ready && session?.role === "admin") {
      setClients(getAllClientsWithLiveData());
    }
  }, [ready, session, pathname]);

  if (!ready || !session || session.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-ink-soft text-sm uppercase tracking-[0.15em] animate-pulse">
          {t("common.loading")}
        </p>
      </div>
    );
  }

  const orders = clients.flatMap((c) => c.orders);
  const categoryCount = (cat: string) =>
    orders.filter((o) => o.category === cat).length;
  const unread = notifications.filter(
    (n) => n.kind === "message" && !n.read
  ).length;
  const onAllOrders = pathname === ALL_ORDERS_HREF;

  function close() {
    setOpen(false);
  }

  const nav = (
    <nav className="flex flex-col h-full px-3 py-5">
      <Link
        href="/admin"
        onClick={close}
        className="flex items-center gap-2.5 px-2 mb-2"
      >
        <Image
          src="/brand/logo.png"
          alt="Tidote Atelier"
          width={36}
          height={36}
          className="h-9 w-9 object-contain"
        />
        <Wordmark size="sm" />
      </Link>

      <div className="flex-1 overflow-y-auto">
        <GroupLabel>{t("admin.group.clients")}</GroupLabel>
        <NavItem
          href="/admin"
          icon="people"
          label={t("admin.allClients")}
          badge={clients.length}
          active={pathname === "/admin"}
          onNavigate={close}
        />

        <GroupLabel>{t("admin.group.orders")}</GroupLabel>
        <NavItem
          href={ALL_ORDERS_HREF}
          icon="tag"
          label={t("admin.allOrders")}
          badge={orders.length}
          active={onAllOrders && !filterCategory}
          onNavigate={close}
        />
        {ORDER_CATEGORIES.map((cat) => (
          <NavItem
            key={cat}
            href={`/admin/orders/category/${encodeURIComponent(cat)}`}
            icon="tag"
            label={categoryLabel(lang, cat)}
            badge={categoryCount(cat)}
            active={
              pathname === `/admin/orders/category/${encodeURIComponent(cat)}` ||
              (onAllOrders && filterCategory === cat)
            }
            onNavigate={close}
          />
        ))}

        <GroupLabel>{t("admin.group.studio")}</GroupLabel>
        <NavItem
          href="/admin/inbox"
          icon="inbox"
          label={t("adminnav.inbox")}
          badge={unread}
          active={pathname.startsWith("/admin/inbox")}
          onNavigate={close}
        />
        <NavItem
          href="/admin/calendar"
          icon="calendar"
          label={t("adminnav.calendar")}
          active={pathname.startsWith("/admin/calendar")}
          onNavigate={close}
        />
        <NavItem
          href="/admin/analytics"
          icon="chart"
          label={t("adminnav.analytics")}
          active={pathname.startsWith("/admin/analytics")}
          onNavigate={close}
        />
      </div>

      <button
        type="button"
        onClick={() => {
          logout();
          router.push("/");
        }}
        className="flex items-center gap-2.5 px-3 py-2 mt-2 rounded text-sm text-ink-soft hover:text-accent hover:bg-ink/[0.04] transition-colors"
      >
        <NavIcon name="logout" />
        {t("adminnav.logout")}
      </button>
    </nav>
  );

  return (
    <OrderFilterContext.Provider value={{ filterCategory, setFilterCategory }}>
    <div className="min-h-screen flex bg-cream">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-60 shrink-0 border-r border-line bg-paper sticky top-0 h-screen">
        {nav}
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="w-60 bg-paper border-r border-line h-full">{nav}</div>
          <button
            type="button"
            aria-label="Close menu"
            className="flex-1 bg-ink/40"
            onClick={close}
          />
        </div>
      )}

      <div className="flex-1 min-w-0 flex flex-col">
        {/* Mobile top bar with menu toggle */}
        <div className="md:hidden flex items-center justify-between border-b border-line bg-paper px-4 py-3 sticky top-0 z-40">
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            className="flex flex-col gap-1.5 p-1"
          >
            <span className="block h-0.5 w-6 bg-ink" />
            <span className="block h-0.5 w-6 bg-ink" />
            <span className="block h-0.5 w-6 bg-ink" />
          </button>
          <Wordmark size="sm" />
        </div>

        <main className="flex-1 px-5 md:px-8 py-8">{children}</main>
      </div>
    </div>
    </OrderFilterContext.Provider>
  );
}
