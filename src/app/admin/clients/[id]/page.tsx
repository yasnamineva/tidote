"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { AdminNav } from "@/components/admin/admin-nav";
import { Reveal } from "@/components/reveal";
import { MeasurementDiagram } from "@/components/measurement-diagram";
import { PendingOrdersList } from "@/components/admin/pending-orders-list";
import { MessageThread } from "@/components/messages/message-thread";
import { useAuth } from "@/lib/auth";
import { getClientWithLiveData, sendStudioMessage } from "@/lib/admin-data";
import { getMessages } from "@/lib/messages";
import type { Client, Message } from "@/lib/mock-data";

const MEASUREMENT_LABELS: { key: keyof Client["measurements"]; label: string }[] = [
  { key: "height", label: "Height" },
  { key: "chest", label: "Chest" },
  { key: "waist", label: "Waist" },
  { key: "hips", label: "Hips" },
  { key: "shoulder", label: "Shoulder" },
  { key: "sleeve", label: "Sleeve" },
  { key: "inseam", label: "Inseam" },
];

export default function AdminClientPage() {
  const { session, ready } = useAuth();
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [client, setClient] = useState<Client | null | undefined>(undefined);
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    if (ready && (!session || session.role !== "admin")) {
      router.replace("/login");
    }
  }, [ready, session, router]);

  useEffect(() => {
    if (ready && session?.role === "admin") {
      setClient(getClientWithLiveData(params.id) ?? null);
      setMessages(getMessages(params.id));
    }
  }, [ready, session, params.id]);

  function refresh() {
    setClient(getClientWithLiveData(params.id) ?? null);
    setMessages(getMessages(params.id));
  }

  function handleSend(text: string) {
    setMessages(sendStudioMessage(params.id, text));
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

  if (!client) {
    return (
      <>
        <SiteHeader />
        <main className="flex-1 flex flex-col items-center justify-center py-24 gap-4">
          <p className="text-ink-soft">No client found with that id.</p>
          <Link href="/admin" className="link-underline text-ink hover:text-moss-deep">
            &larr; Back to Overview
          </Link>
        </main>
        <SiteFooter />
      </>
    );
  }

  return (
    <>
      <SiteHeader />
      <AdminNav />
      <main className="flex-1">
        <section className="border-b border-line bg-paper">
          <div className="mx-auto max-w-7xl px-6 py-10">
            <p className="text-xs uppercase tracking-[0.3em] text-moss-deep mb-2">
              Client Profile
            </p>
            <h1 className="font-display text-3xl md:text-4xl">{client.name}</h1>
            <p className="text-sm text-ink-soft mt-2">{client.email}</p>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-12 grid lg:grid-cols-5 gap-10">
          <div className="lg:col-span-3">
            <h2 className="font-display text-2xl mb-6">Orders</h2>
            <Reveal>
              <PendingOrdersList clients={[client]} onChange={refresh} />
            </Reveal>
          </div>

          <div className="lg:col-span-2 flex flex-col gap-10">
            <Reveal>
              <h2 className="font-display text-2xl mb-2">Measurements</h2>
              <p className="text-sm text-ink-soft mb-6">
                {client.measurements.updatedAt === "Not yet taken"
                  ? "Not yet provided."
                  : `Last updated ${client.measurements.updatedAt}.`}
              </p>
              <MeasurementDiagram className="mb-4" />
              <div className="border border-line bg-paper px-6 py-6">
                <div className="grid grid-cols-2 gap-4">
                  {MEASUREMENT_LABELS.map((f) => (
                    <div key={f.key}>
                      <p className="text-xs uppercase tracking-[0.1em] text-ink-soft">
                        {f.label}
                      </p>
                      <p className="text-sm mt-1">
                        {client.measurements[f.key] || "—"}
                      </p>
                    </div>
                  ))}
                </div>
                {client.measurements.notes && (
                  <div className="mt-4">
                    <p className="text-xs uppercase tracking-[0.1em] text-ink-soft">
                      Fit Notes
                    </p>
                    <p className="text-sm mt-1">{client.measurements.notes}</p>
                  </div>
                )}
              </div>
            </Reveal>

            <Reveal delay={100}>
              <h2 className="font-display text-2xl mb-2">Delivery Info</h2>
              <p className="text-sm text-ink-soft mb-6">
                {client.delivery.updatedAt
                  ? `Last updated ${client.delivery.updatedAt}.`
                  : "Not yet provided."}
              </p>
              <div className="border border-line bg-paper px-6 py-6 flex flex-col gap-3 text-sm">
                <p>{client.delivery.address || "No address on file."}</p>
                <p>
                  {[client.delivery.city, client.delivery.postalCode]
                    .filter(Boolean)
                    .join(", ") || " "}
                </p>
                <p>{client.delivery.phone}</p>
                {client.delivery.notes && (
                  <p className="text-ink-soft italic">{client.delivery.notes}</p>
                )}
              </div>
            </Reveal>

            <Reveal delay={150}>
              <h2 className="font-display text-2xl mb-2">Messages</h2>
              <p className="text-sm text-ink-soft mb-6">
                Reply to {client.name} here &mdash; they&rsquo;ll see it in
                their account.
              </p>
              <MessageThread
                messages={messages}
                viewerSender="studio"
                onSend={handleSend}
                placeholder={`Message ${client.name}…`}
              />
            </Reveal>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 pb-16">
          <Link href="/admin" className="link-underline text-sm text-ink-soft hover:text-ink">
            &larr; Back to Overview
          </Link>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
