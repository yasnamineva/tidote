"use client";

import { useEffect, useState } from "react";
import { useLang } from "@/lib/i18n";
import { deleteClient } from "@/lib/clients";
import type { Client } from "@/lib/mock-data";

/**
 * Destructive-action guard: spells out exactly what disappears and makes the
 * studio retype the client's name before the delete button unlocks.
 */
export function DeleteClientModal({
  client,
  messageCount,
  onClose,
  onDeleted,
}: {
  client: Client;
  messageCount: number;
  onClose: () => void;
  onDeleted: () => void;
}) {
  const { t } = useLang();
  const [typed, setTyped] = useState("");

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const confirmed = typed.trim().toLowerCase() === client.name.trim().toLowerCase();
  const activeOrders = client.orders.filter(
    (o) => o.status !== "delivered" && o.reviewStatus !== "denied"
  ).length;

  const losses = [
    t("delclient.lossOrders", { n: client.orders.length }),
    t("delclient.lossMeasurements"),
    t("delclient.lossMessages", { n: messageCount }),
    t("delclient.lossItems", { n: client.items.length }),
  ];

  return (
    <div
      className="fixed inset-0 z-[60] bg-ink/50 flex items-center justify-center p-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-client-title"
    >
      <div
        className="w-full max-w-md bg-cream border border-line shadow-[0_20px_50px_-20px_rgba(34,30,25,0.5)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-line">
          <h2 id="delete-client-title" className="font-display text-xl text-accent">
            {t("delclient.title", { name: client.name })}
          </h2>
        </div>

        <div className="px-6 py-6 flex flex-col gap-4">
          <p className="text-sm">{t("delclient.intro")}</p>

          <ul className="flex flex-col gap-1.5 text-sm text-ink-soft border-l-2 border-accent/40 pl-4">
            {losses.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>

          {activeOrders > 0 && (
            <p className="text-sm text-accent bg-accent-soft/40 px-3 py-2">
              {t("delclient.activeWarning", { n: activeOrders })}
            </p>
          )}

          <p className="text-sm text-ink-soft">{t("delclient.irreversible")}</p>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="delete-confirm"
              className="text-xs uppercase tracking-[0.1em] text-ink-soft"
            >
              {t("delclient.typeName", { name: client.name })}
            </label>
            <input
              id="delete-confirm"
              value={typed}
              autoComplete="off"
              onChange={(e) => setTyped(e.target.value)}
              className="border border-line-strong bg-cream px-3 py-2 text-sm transition-colors focus:outline-none focus:border-accent"
            />
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              type="button"
              disabled={!confirmed}
              onClick={() => {
                deleteClient(client.id);
                onDeleted();
              }}
              className="bg-accent text-cream px-4 py-2 text-xs uppercase tracking-[0.15em] transition-colors hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {t("delclient.confirm")}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="border border-ink px-4 py-2 text-xs uppercase tracking-[0.15em] transition-colors hover:bg-ink hover:text-cream"
            >
              {t("delclient.cancel")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
