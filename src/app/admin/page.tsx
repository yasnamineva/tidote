"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { AdminNav } from "@/components/admin/admin-nav";
import { Reveal } from "@/components/reveal";
import { PendingOrdersList } from "@/components/admin/pending-orders-list";
import { ClientRoster } from "@/components/admin/client-roster";
import { useAuth } from "@/lib/auth";
import { useNotifications } from "@/lib/notifications";
import { getAllClientsWithLiveData } from "@/lib/admin-data";
import type { Client } from "@/lib/mock-data";

export default function AdminPage() {
  const { session, ready } = useAuth();
  const { notifications } = useNotifications();
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);

  useEffect(() => {
    if (ready && (!session || session.role !== "admin")) {
      router.replace("/login");
    }
  }, [ready, session, router]);

  useEffect(() => {
    if (ready && session?.role === "admin") {
      setClients(getAllClientsWithLiveData());
    }
  }, [ready, session]);

  function refresh() {
    setClients(getAllClientsWithLiveData());
  }

  if (!ready || !session || session.role !== "admin") {
    return (
      <>
        <SiteHeader />
        <main className="flex-1 flex items-center justify-center py-24">
          <p className="text-ink-soft text-sm uppercase tracking-[0.15em] animate-pulse">
            Loading&hellip;
          </p>
        </main>
        <SiteFooter />
      </>
    );
  }

  const pendingCount = clients.reduce(
    (n, c) => n + c.orders.filter((o) => o.status !== "delivered").length,
    0
  );
  const reviewCount = clients.reduce(
    (n, c) => n + c.orders.filter((o) => o.reviewStatus === "pending").length,
    0
  );
  const inProductionCount = clients.reduce(
    (n, c) => n + c.orders.filter((o) => o.status === "in_production").length,
    0
  );
  const unreadMessages = notifications.filter(
    (nt) => nt.kind === "message" && !nt.read
  ).length;

  const STATS = [
    { label: "Need review", value: reviewCount },
    { label: "In production", value: inProductionCount },
    { label: "Unread messages", value: unreadMessages },
  ];

  return (
    <>
      <SiteHeader />
      <AdminNav />
      <main className="flex-1">
        <section className="border-b border-line bg-paper">
          <div className="mx-auto max-w-7xl px-6 py-10">
            <p className="text-xs uppercase tracking-[0.3em] text-moss-deep mb-2">
              Studio Admin
            </p>
            <h1 className="font-display text-3xl md:text-4xl">Atelier Overview</h1>
            <div className="grid grid-cols-3 gap-3 mt-6 max-w-lg">
              {STATS.map((s) => (
                <div
                  key={s.label}
                  className="border border-line bg-cream px-4 py-3 text-center"
                >
                  <p className="font-display text-2xl text-accent">{s.value}</p>
                  <p className="text-[10px] uppercase tracking-[0.1em] text-ink-soft mt-1">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-12 grid lg:grid-cols-5 gap-10">
          <div className="lg:col-span-3 min-w-0">
            <h2 className="font-display text-2xl mb-1">Pending Orders</h2>
            <p className="text-sm text-ink-soft mb-6">
              {pendingCount} order{pendingCount === 1 ? "" : "s"} in progress
              across all clients.
            </p>
            {reviewCount > 0 && (
              <p className="text-sm text-accent border border-accent/40 bg-accent/5 px-4 py-3 mb-6">
                {reviewCount === 1
                  ? "1 new order request needs review."
                  : `${reviewCount} new order requests need review.`}
              </p>
            )}
            <Reveal>
              <PendingOrdersList clients={clients} onChange={refresh} />
            </Reveal>
          </div>

          <div className="lg:col-span-2 min-w-0">
            <h2 className="font-display text-2xl mb-1">Clients</h2>
            <p className="text-sm text-ink-soft mb-6">{clients.length} total.</p>
            <Reveal delay={100}>
              <ClientRoster clients={clients} />
            </Reveal>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
