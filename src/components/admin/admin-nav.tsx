"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

const LINKS = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/inbox", label: "Inbox" },
  { href: "/admin/calendar", label: "Calendar" },
];

export function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();

  function isActive(href: string) {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  }

  return (
    <div className="border-b border-line bg-paper">
      <div className="mx-auto max-w-7xl px-6 py-3 flex items-center justify-between gap-4">
        <nav className="flex items-center gap-5 text-sm uppercase tracking-[0.15em]">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`link-underline transition-colors whitespace-nowrap ${
                isActive(l.href) ? "text-accent" : "hover:text-accent"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <button
          type="button"
          onClick={() => {
            logout();
            router.push("/");
          }}
          className="btn-sweep text-xs uppercase tracking-[0.15em] border border-ink px-3 py-1.5 transition-colors duration-300 hover:text-cream"
        >
          Log Out
        </button>
      </div>
    </div>
  );
}
