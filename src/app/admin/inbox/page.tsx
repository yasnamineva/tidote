"use client";

import { useState } from "react";
import { AdminTopBar } from "@/components/admin/admin-shell";
import { MessageThread } from "@/components/messages/message-thread";
import { LoadFailed, Loading } from "@/components/data-state";
import { useLang } from "@/lib/i18n";
import { useAsync } from "@/lib/use-async";
import { useNotifications } from "@/lib/notifications";
import { getAllClientsWithLiveData, sendStudioMessage } from "@/lib/admin-data";
import { getLatestMessages, getMessages } from "@/lib/messages";
import { markReadWhere } from "@/lib/notifications-data";
import { getEnquiries, setEnquiryHandled } from "@/lib/enquiries";
import { seedTextById } from "@/lib/translations";
import type { Message } from "@/lib/mock-data";

export default function AdminInboxPage() {
  const { t, lang } = useLang();
  const { notifications, refresh: refreshBell } = useNotifications();
  const [selected, setSelected] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  // The last message of every thread, so the list can be ordered without one
  // request per client. Held beside the load rather than inside it, because
  // sending a message moves it on without a refetch of everything.
  const [latestSent, setLatestSent] = useState<Map<string, Message> | null>(null);

  const core = useAsync(async () => {
    const [clients, latest] = await Promise.all([
      getAllClientsWithLiveData(),
      getLatestMessages(),
    ]);
    return { clients, latest };
  }, "inbox-core");

  // Loaded separately on purpose: enquiries are a newer table, and if reading
  // them fails the studio must still be able to answer her clients. One dead
  // request should not take the inbox down with it.
  const enq = useAsync(() => getEnquiries(), "inbox-enquiries");

  const clients = core.state.status === "ready" ? core.state.data.clients : [];
  const latest =
    latestSent ??
    (core.state.status === "ready" ? core.state.data.latest : new Map<string, Message>());
  const enquiries = enq.state.status === "ready" ? enq.state.data : [];

  async function resolveEnquiry(id: string, handled: boolean) {
    await setEnquiryHandled(id, handled);
    enq.reload();
    // The bell pointed at this page; the reason has now been dealt with.
    await markReadWhere("admin", "", (n) => n.kind === "enquiry");
    refreshBell();
  }

  async function openConversation(clientId: string) {
    setSelected(clientId);
    setMessages(await getMessages(clientId));
    // mark this client's message notifications read
    await markReadWhere(
      "admin",
      "",
      (n) => n.kind === "message" && n.clientId === clientId
    );
    refreshBell();
  }

  async function handleSend(text: string) {
    if (!selected) return;
    await sendStudioMessage(selected, text);
    setMessages(await getMessages(selected));
    setLatestSent(await getLatestMessages());
  }

  const unreadByClient = new Set(
    notifications
      .filter((n) => n.kind === "message" && !n.read)
      .map((n) => n.clientId)
  );

  const conversations = clients
    .map((c) => ({ client: c, last: latest.get(c.id) }))
    .sort((a, b) => {
      const at = a.last?.createdAt ?? "";
      const bt = b.last?.createdAt ?? "";
      return at < bt ? 1 : -1;
    });

  const selectedClient = clients.find((c) => c.id === selected);
  const open = enquiries.filter((e) => !e.handled);

  return (
    <>
      <AdminTopBar title={t("inbox.title")} />
      <p className="text-sm text-ink-soft mb-8 -mt-4">{t("inbox.sub")}</p>

      {enq.state.status === "error" && (
        <div className="mb-8">
          <LoadFailed
            onRetry={enq.reload}
            title={t("enqadmin.failedTitle")}
            sub={t("enqadmin.failedSub")}
          />
        </div>
      )}

      {open.length > 0 && (
        <div className="mb-10 flex flex-col gap-3">
          <h2 className="font-display text-xl">
            {t("enqadmin.open", { n: open.length })}
          </h2>
          {open.map((e) => (
            <article key={e.id} className="border border-accent/30 bg-paper px-5 py-4">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <p className="font-display text-lg">{e.name}</p>
                <p className="text-xs uppercase tracking-[0.15em] text-ink-soft">
                  {new Date(e.createdAt).toLocaleString()} · {e.lang.toUpperCase()}
                </p>
              </div>
              {e.pieceName && (
                <p className="mt-1 text-xs uppercase tracking-[0.15em] text-moss-deep">
                  {e.pieceName}
                </p>
              )}
              <p className="mt-3 whitespace-pre-wrap text-sm">{e.message}</p>
              <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
                {e.email && (
                  <a href={`mailto:${e.email}`} className="link-underline text-ink-soft hover:text-moss-deep">
                    {e.email}
                  </a>
                )}
                {e.phone && (
                  <a href={`tel:${e.phone.replace(/\s+/g, "")}`} className="link-underline text-ink-soft hover:text-moss-deep">
                    {e.phone}
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => void resolveEnquiry(e.id, true)}
                  className="ml-auto border border-ink px-4 py-1.5 text-xs uppercase tracking-[0.15em] transition-colors hover:bg-ink hover:text-cream"
                >
                  {t("enqadmin.done")}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {core.state.status === "loading" && <Loading />}
      {core.state.status === "error" && <LoadFailed onRetry={core.reload} />}

      {/* Rendered only when the data is here: the `hidden` attribute would not
          hide it, because Tailwind's own `display: grid` beats the browser's
          rule for the attribute. */}
      {core.state.status === "ready" && (
      <div className="grid md:grid-cols-5 gap-8">
        {/* conversation list */}
        <div className="md:col-span-2 min-w-0 flex flex-col gap-2">
            {conversations.map(({ client, last }) => (
              <button
                key={client.id}
                type="button"
                onClick={() => openConversation(client.id)}
                className={`text-left border px-4 py-3 min-w-0 transition-colors ${
                  selected === client.id
                    ? "border-moss-deep bg-moss-soft"
                    : "border-line bg-paper hover:border-moss-deep"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-display text-lg truncate">{client.name}</p>
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
          <div className="md:col-span-3 min-w-0">
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
      )}
    </>
  );
}
