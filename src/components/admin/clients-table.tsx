"use client";

import { useRouter } from "next/navigation";
import { useLang } from "@/lib/i18n";
import type { Client } from "@/lib/mock-data";

export function ClientsTable({ clients }: { clients: Client[] }) {
  const { t } = useLang();
  const router = useRouter();

  return (
    <div className="border border-line bg-paper overflow-hidden">
      <div className="hidden sm:grid grid-cols-[2fr_1.2fr_0.8fr_1fr] gap-4 px-6 py-3 border-b border-line text-[10px] uppercase tracking-[0.15em] text-ink-soft bg-cream/40">
        <span>{t("admin.col.client")}</span>
        <span>{t("admin.col.phone")}</span>
        <span>{t("admin.col.orders")}</span>
        <span>{t("admin.col.last")}</span>
      </div>

      {clients.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-20 text-ink-soft">
          <svg
            viewBox="0 0 24 24"
            className="h-9 w-9"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="8" r="4" />
            <path d="M4 21a8 8 0 0 1 16 0" />
          </svg>
          <p className="text-sm">{t("admin.clientsEmpty")}</p>
        </div>
      ) : (
        <ul>
          {clients.map((c) => {
            const lastOrder = [...c.orders].sort((a, b) =>
              a.placedOn < b.placedOn ? 1 : -1
            )[0];
            return (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => router.push(`/admin/clients/${c.id}`)}
                  className="w-full text-left grid sm:grid-cols-[2fr_1.2fr_0.8fr_1fr] gap-1 sm:gap-4 px-6 py-4 border-b border-line/60 last:border-b-0 hover:bg-cream/50 transition-colors items-center"
                >
                  <div className="min-w-0">
                    <p className="font-display text-base truncate">{c.name}</p>
                    <p className="text-xs text-ink-soft truncate">{c.email}</p>
                  </div>
                  <span className="text-sm text-ink-soft truncate">
                    {c.delivery.phone || "—"}
                  </span>
                  <span className="text-sm tabular-nums">{c.orders.length}</span>
                  <span className="text-sm text-ink-soft tabular-nums">
                    {lastOrder ? lastOrder.placedOn : "—"}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
