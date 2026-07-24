"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { AdminNav } from "@/components/admin/admin-nav";
import { Reveal } from "@/components/reveal";
import { OrderDetail } from "@/components/order-detail";
import { useAuth } from "@/lib/auth";
import { useBooking } from "@/lib/booking";
import { appendOrderNote, getClientWithLiveData } from "@/lib/admin-data";
import type { Client } from "@/lib/mock-data";

export default function AdminOrderPage() {
  const { session, ready } = useAuth();
  const { bookings } = useBooking();
  const router = useRouter();
  const params = useParams<{ clientId: string; orderId: string }>();
  const [client, setClient] = useState<Client | null | undefined>(undefined);

  useEffect(() => {
    if (ready && (!session || session.role !== "admin")) {
      router.replace("/login");
    }
  }, [ready, session, router]);

  useEffect(() => {
    if (ready && session?.role === "admin") {
      setClient(getClientWithLiveData(params.clientId) ?? null);
    }
  }, [ready, session, params.clientId]);

  function refresh() {
    setClient(getClientWithLiveData(params.clientId) ?? null);
  }

  if (!ready || !session || session.role !== "admin" || client === undefined) {
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

  const order = client?.orders.find((o) => o.id === params.orderId);
  const booking = bookings.find((b) => b.orderId === params.orderId);

  return (
    <>
      <SiteHeader />
      <AdminNav />
      <main className="flex-1">
        <section className="mx-auto max-w-3xl px-6 py-12">
          <Link
            href={client ? `/admin/clients/${client.id}` : "/admin"}
            className="link-underline text-sm text-ink-soft hover:text-ink"
          >
            &larr; Back to client
          </Link>
          {client && order ? (
            <Reveal className="mt-8">
              <OrderDetail
                order={order}
                clientId={client.id}
                clientName={client.name}
                role="admin"
                booking={booking}
                onAddNote={(text, photos) => {
                  appendOrderNote(client.id, order.id, "studio", text, photos);
                  refresh();
                }}
                onChange={refresh}
              />
            </Reveal>
          ) : (
            <p className="text-ink-soft mt-8">Order not found.</p>
          )}
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
