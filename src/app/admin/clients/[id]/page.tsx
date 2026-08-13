"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AdminTopBar } from "@/components/admin/admin-shell";
import { DeleteClientModal } from "@/components/admin/delete-client-modal";
import { Reveal } from "@/components/reveal";
import { MeasurementDiagram } from "@/components/measurement-diagram";
import { InfoTip } from "@/components/info-tip";
import { PendingOrdersList } from "@/components/admin/pending-orders-list";
import { MessageThread } from "@/components/messages/message-thread";
import { WardrobeSection } from "@/components/wardrobe-section";
import { useLang } from "@/lib/i18n";
import { getClientWithLiveData, sendStudioMessage } from "@/lib/admin-data";
import { getMessages } from "@/lib/messages";
import { MEASUREMENT_FIELDS } from "@/lib/measurements";
import type { Client, Message } from "@/lib/mock-data";

export default function AdminClientPage() {
  const { t } = useLang();
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [client, setClient] = useState<Client | null | undefined>(undefined);
  const [messages, setMessages] = useState<Message[]>([]);
  const [showMessages, setShowMessages] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  useEffect(() => {
    if (!showMessages) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setShowMessages(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showMessages]);

  useEffect(() => {
    setClient(getClientWithLiveData(params.id) ?? null);
    setMessages(getMessages(params.id));
  }, [params.id]);

  function refresh() {
    setClient(getClientWithLiveData(params.id) ?? null);
    setMessages(getMessages(params.id));
  }

  function handleSend(text: string) {
    setMessages(sendStudioMessage(params.id, text));
  }

  if (client === undefined) {
    return (
      <p className="text-ink-soft text-sm uppercase tracking-[0.15em] animate-pulse">
        {t("common.loading")}
      </p>
    );
  }

  if (!client) {
    return (
      <div className="flex flex-col items-start gap-4">
        <p className="text-ink-soft">{t("adminclient.notFound")}</p>
        <Link href="/admin" className="link-underline text-ink hover:text-moss-deep">
          {t("adminclient.back")}
        </Link>
      </div>
    );
  }

  return (
    <>
      <Link
        href="/admin"
        aria-label={t("adminclient.back")}
        title={t("adminclient.back")}
        className="inline-flex items-center justify-center w-9 h-9 -ml-2 mb-2 text-xl text-ink-soft hover:text-ink transition-colors"
      >
        ←
      </Link>

      <AdminTopBar
        title={client.name}
        actions={
          <>
            <button
              type="button"
              onClick={() => setShowMessages(true)}
              aria-label={t("adminclient.messages")}
              title={t("adminclient.messages")}
              className="relative flex items-center justify-center w-10 h-10 border border-line bg-paper text-ink-soft hover:text-ink hover:border-line-strong transition-colors"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15a2 2 0 0 1-2 2H8l-4 4V5a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2z" />
              </svg>
              {messages.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-moss text-cream text-[10px] leading-[18px] text-center tabular-nums">
                  {messages.length}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setShowDelete(true)}
              className="text-xs uppercase tracking-[0.15em] border border-accent/50 text-accent px-4 py-2 transition-colors hover:bg-accent hover:text-cream"
            >
              {t("delclient.action")}
            </button>
          </>
        }
      />
      <p className="text-sm text-ink-soft mb-8 -mt-4">{client.email}</p>

      <div className="flex flex-col gap-14">
        {/* Contact details read as a compact strip so orders get the full width */}
        <Reveal>
          <h2 className="font-display text-2xl mb-2">
            {t("adminclient.delivery")}
          </h2>
          <p className="text-sm text-ink-soft mb-6">
            {client.delivery.updatedAt
              ? t("adminclient.lastUpdated", {
                  date: client.delivery.updatedAt,
                })
              : t("adminclient.notProvided")}
          </p>
          <div className="border border-line bg-paper px-6 py-5 grid gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-xs uppercase tracking-[0.1em] text-ink-soft mb-1">
                {t("deliv.address")}
              </p>
              <p className="text-sm">
                {client.delivery.address || t("adminclient.noAddress")}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.1em] text-ink-soft mb-1">
                {t("deliv.city")}
              </p>
              <p className="text-sm">
                {[client.delivery.city, client.delivery.postalCode]
                  .filter(Boolean)
                  .join(", ") || "—"}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.1em] text-ink-soft mb-1">
                {t("deliv.phone")}
              </p>
              <p className="text-sm">{client.delivery.phone || "—"}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.1em] text-ink-soft mb-1">
                {t("deliv.notes")}
              </p>
              <p className="text-sm text-ink-soft italic">
                {client.delivery.notes || "—"}
              </p>
            </div>
          </div>
        </Reveal>

        <div>
          <h2 className="font-display text-2xl mb-6">
            {t("adminclient.orders")}
          </h2>
          <Reveal>
            <PendingOrdersList clients={[client]} onChange={refresh} />
          </Reveal>
        </div>

        <Reveal>
          <h2 className="font-display text-2xl mb-2">
            {t("adminclient.measurements")}
          </h2>
          <p className="text-sm text-ink-soft mb-6">
            {client.measurements.updatedAt === "Not yet taken"
              ? t("adminclient.notProvided")
              : t("adminclient.lastUpdated", {
                  date: client.measurements.updatedAt,
                })}
          </p>
          {/* Diagram beside the values — at full width the guide is finally legible */}
          <div className="grid lg:grid-cols-2 gap-8 items-start">
            <MeasurementDiagram />
            <div className="border border-line bg-paper px-6 py-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-5">
                {MEASUREMENT_FIELDS.map((f) => (
                  <div key={f.key}>
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs uppercase tracking-[0.1em] text-ink-soft">
                        {f.num}. {t(f.labelKey)}
                      </p>
                      <InfoTip
                        text={t(f.helpKey)}
                        label={t("measure.help.aria", {
                          label: t(f.labelKey),
                        })}
                      />
                    </div>
                    <p className="text-sm mt-1">
                      {client.measurements[f.key] || "—"}
                    </p>
                  </div>
                ))}
              </div>
              {client.measurements.notes && (
                <div className="mt-6 pt-5 border-t border-line">
                  <p className="text-xs uppercase tracking-[0.1em] text-ink-soft">
                    {t("adminclient.fitNotes")}
                  </p>
                  <p className="text-sm mt-1">{client.measurements.notes}</p>
                </div>
              )}
            </div>
          </div>
        </Reveal>

        <Reveal>
          <h2 className="font-display text-2xl mb-2">
            {t("wardrobe.adminTitle")}
          </h2>
          <p className="text-sm text-ink-soft mb-6">{t("wardrobe.adminSub")}</p>
          <WardrobeSection items={client.items} editable={false} />
        </Reveal>

      </div>

      {showMessages && (
        <div
          className="fixed inset-0 z-[60] bg-ink/50 flex items-center justify-center p-4 sm:p-6"
          onClick={() => setShowMessages(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="client-messages-title"
        >
          <div
            className="w-full max-w-2xl max-h-[85vh] flex flex-col bg-cream border border-line shadow-[0_20px_50px_-20px_rgba(34,30,25,0.5)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-line flex items-start justify-between gap-4">
              <div>
                <h2 id="client-messages-title" className="font-display text-xl">
                  {t("adminclient.messages")}
                </h2>
                <p className="text-sm text-ink-soft mt-1">
                  {t("adminclient.replyHint", { name: client.name })}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowMessages(false)}
                aria-label={t("common.close")}
                className="text-xl leading-none text-ink-soft hover:text-ink transition-colors px-2"
              >
                ×
              </button>
            </div>
            <div className="px-6 py-5 overflow-y-auto">
              <MessageThread
                messages={messages}
                viewerSender="studio"
                onSend={handleSend}
                placeholder={t("adminclient.msgPlaceholder", {
                  name: client.name,
                })}
              />
            </div>
          </div>
        </div>
      )}

      {showDelete && (
        <DeleteClientModal
          client={client}
          messageCount={messages.length}
          onClose={() => setShowDelete(false)}
          onDeleted={() => router.push("/admin")}
        />
      )}
    </>
  );
}
