"use client";

import { useEffect, useState } from "react";
import { AdminTopBar } from "@/components/admin/admin-shell";
import { AnalyticsOverview } from "@/components/admin/analytics-overview";
import { DocumentsPanel } from "@/components/admin/documents-panel";
import { ExpensesPanel } from "@/components/admin/expenses-panel";
import { useLang } from "@/lib/i18n";
import { getAllClientsWithLiveData } from "@/lib/admin-data";
import type { Client } from "@/lib/mock-data";

const TABS = ["overview", "money", "documents"] as const;
type Tab = (typeof TABS)[number];

export default function AdminAnalyticsPage() {
  const { t } = useLang();
  const [clients, setClients] = useState<Client[] | null>(null);
  const [tab, setTab] = useState<Tab>("overview");

  useEffect(() => {
    setClients(getAllClientsWithLiveData());
  }, []);

  if (!clients) {
    return (
      <p className="text-ink-soft text-sm uppercase tracking-[0.15em] animate-pulse">
        {t("common.loading")}
      </p>
    );
  }

  return (
    <>
      <AdminTopBar title={t("an.title")} />
      <p className="text-sm text-ink-soft mb-6 -mt-4">{t(`an.sub.${tab}`)}</p>

      <div
        role="tablist"
        aria-label={t("an.title")}
        className="flex gap-1 border-b border-line mb-8 -mx-1 px-1 overflow-x-auto"
      >
        {TABS.map((name) => (
          <button
            key={name}
            role="tab"
            type="button"
            aria-selected={tab === name}
            onClick={() => setTab(name)}
            className={`px-4 py-2.5 text-xs uppercase tracking-[0.15em] whitespace-nowrap border-b-2 -mb-px transition-colors ${
              tab === name
                ? "border-ink text-ink"
                : "border-transparent text-ink-soft hover:text-ink"
            }`}
          >
            {t(`an.tab.${name}`)}
          </button>
        ))}
      </div>

      {tab === "overview" && <AnalyticsOverview clients={clients} />}
      {tab === "money" && <ExpensesPanel clients={clients} />}
      {tab === "documents" && <DocumentsPanel />}
    </>
  );
}
