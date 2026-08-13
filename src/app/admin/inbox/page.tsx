"use client";

import { useEffect, useState } from "react";
import { AdminTopBar } from "@/components/admin/admin-shell";
import { MessageThread } from "@/components/messages/message-thread";
import { useLang } from "@/lib/i18n";
import { useNotifications } from "@/lib/notifications";
import { getAllClientsWithLiveData, sendStudioMessage } from "@/lib/admin-data";
import { getMessages } from "@/lib/messages";
import { markReadWhere } from "@/lib/notifications-data";
import { seedTextById } from "@/lib/translations";
import type { Client, Message } from "@/lib/mock-data";

export default function AdminInboxPage() {
  const { t, lang } = useLang();
  const { notifications, refresh: refreshBell } = useNotifications();
  const [clients, setClients] = useState<Client[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    setClients(getAllClientsWithLiveData());
  }, []);

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
      <AdminTopBar title={t("inbox.title")} />
      <p className="text-sm text-ink-soft mb-8 -mt-4">{t("inbox.sub")}</p>

      <div className="grid md:grid-cols-5 gap-8">
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
                    ? `${last.sender === "studio" ? t("inbox.you") : ""}${seedTextById(lang, last.id, last.text)}`
                    : t("inbox.noMessages")}
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
                  placeholder={t("adminclient.msgPlaceholder", {
                    name: selectedClient.name,
                  })}
                />
              </>
            ) : (
              <p className="text-sm text-ink-soft border border-line bg-paper px-6 py-10 text-center">
                {t("inbox.select")}
              </p>
            )}
          </div>
      </div>
    </>
  );
}
