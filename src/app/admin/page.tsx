"use client";

import { useEffect, useState } from "react";
import { AdminTopBar } from "@/components/admin/admin-shell";
import { ClientsTable } from "@/components/admin/clients-table";
import { NewClientModal } from "@/components/admin/new-client-modal";
import { useLang } from "@/lib/i18n";
import { getAllClientsWithLiveData } from "@/lib/admin-data";
import type { Client } from "@/lib/mock-data";

function parseTotal(total: string): number {
  const m = total.replace(/[^0-9.]/g, "");
  const n = parseFloat(m);
  return Number.isFinite(n) ? n : 0;
}

export default function AdminOverviewPage() {
  const { t } = useLang();
  const [clients, setClients] = useState<Client[]>([]);
  const [query, setQuery] = useState("");
  const [showModal, setShowModal] = useState(false);

  function refresh() {
    setClients(getAllClientsWithLiveData());
  }

  useEffect(() => {
    refresh();
  }, []);

  const orders = clients.flatMap((c) => c.orders);
  const inProgress = orders.filter((o) => o.status !== "delivered").length;
  const revenue = orders
    .filter((o) => o.reviewStatus === "accepted")
    .reduce((sum, o) => sum + parseTotal(o.total), 0);

  const stats = [
    { label: t("admin.stat.clientsCount"), value: String(clients.length) },
    { label: t("admin.stat.totalOrders"), value: String(orders.length) },
    { label: t("admin.stat.inProgress"), value: String(inProgress) },
    {
      label: t("admin.stat.revenue"),
      value: revenue > 0 ? `€${revenue.toLocaleString()}` : "—",
    },
  ];

  const q = query.trim().toLowerCase();
  const filtered = q
    ? clients.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          (c.delivery.phone || "").toLowerCase().includes(q)
      )
    : clients;

  return (
    <>
      <AdminTopBar
        title={t("admin.allClients")}
        actions={
          <>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("admin.search")}
              className="w-56 md:w-72 border border-line bg-paper px-4 py-2.5 text-sm rounded transition-colors focus:outline-none focus:border-moss-deep"
            />
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="bg-accent text-cream px-4 py-2.5 text-sm rounded transition-colors hover:bg-accent/85 whitespace-nowrap"
            >
              + {t("admin.newClient")}
            </button>
          </>
        }
      />

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 border border-line bg-paper mb-8 divide-x divide-y lg:divide-y-0 divide-line">
        {stats.map((s) => (
          <div key={s.label} className="px-6 py-5">
            <p className="font-display text-3xl">{s.value}</p>
            <p className="text-[10px] uppercase tracking-[0.15em] text-ink-soft mt-1">
              {s.label}
            </p>
          </div>
        ))}
      </div>

      <ClientsTable clients={filtered} />

      {showModal && (
        <NewClientModal
          onClose={() => setShowModal(false)}
          onCreated={refresh}
        />
      )}
    </>
  );
}
