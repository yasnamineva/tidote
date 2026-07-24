"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { AdminNav } from "@/components/admin/admin-nav";
import { MessageThread } from "@/components/messages/message-thread";
import { useAuth } from "@/lib/auth";
import { useNotifications } from "@/lib/notifications";
import { getAllClientsWithLiveData, sendStudioMessage } from "@/lib/admin-data";
import { getMessages } from "@/lib/messages";
import { markReadWhere } from "@/lib/notifications-data";
import type { Client, Message } from "@/lib/mock-data";

export default function AdminInboxPage() {
  const { session, ready } = useAuth();
  const { notifications, refresh: refreshBell } = useNotifications();
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

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

  function openConversation(clientId: string) {
    setSelected(clientId);
    setMessages(getMessages(clientId));
    // mark this client's message notifications read
    markReadWhere(
      "admin",
      "",
      (n) => n.kind === "message" && n.clientId === clientId
    );
    refreshBell();
  }

  function handleSend(text: string) {
    if (!selected) return;
    sendStudioMessage(selected, text);
    setMessages(getMessages(selected));
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

  const unreadByClient = new Set(
    notifications
      .filter((n) => n.kind === "message" && !n.read)
      .map((n) => n.clientId)
  );

  const conversations = clients
    .map((c) => {
      const msgs = getMessages(c.id);
      const last = msgs[msgs.length - 1];
      return { client: c, last };
    })
    .sort((a, b) => {
      const at = a.last?.createdAt ?? "";
      const bt = b.last?.createdAt ?? "";
      return at < bt ? 1 : -1;
    });

  const selectedClient = clients.find((c) => c.id === selected);

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
            <h1 className="font-display text-3xl md:text-4xl">Inbox</h1>
            <p className="text-sm text-ink-soft mt-3">
              All client conversations in one place.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-12 grid md:grid-cols-5 gap-8">
          {/* conversation list */}
          <div className="md:col-span-2 flex flex-col gap-2">
            {conversations.map(({ client, last }) => (
              <button
                key={client.id}
                type="button"
                onClick={() => openConversation(client.id)}
                className={`text-left border px-4 py-3 transition-colors ${
                  selected === client.id
                    ? "border-moss-deep bg-moss-soft"
                    : "border-line bg-paper hover:border-moss-deep"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-display text-lg">{client.name}</p>
                  {unreadByClient.has(client.id) && (
                    <span className="h-2 w-2 rounded-full bg-accent shrink-0" />
                  )}
                </div>
                <p className="text-sm text-ink-soft truncate">
                  {last
                    ? `${last.sender === "studio" ? "You: " : ""}${last.text}`
                    : "No messages yet."}
                </p>
              </button>
            ))}
          </div>

          {/* thread */}
          <div className="md:col-span-3">
            {selectedClient ? (
              <>
                <h2 className="font-display text-2xl mb-4">
                  {selectedClient.name}
                </h2>
                <MessageThread
                  messages={messages}
                  viewerSender="studio"
                  onSend={handleSend}
                  placeholder={`Message ${selectedClient.name}…`}
                />
              </>
            ) : (
              <p className="text-sm text-ink-soft border border-line bg-paper px-6 py-10 text-center">
                Select a conversation to read and reply.
              </p>
            )}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
