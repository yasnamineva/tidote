"use client";

import { useState } from "react";
import { AdminTopBar } from "@/components/admin/admin-shell";
import { AnalyticsOverview } from "@/components/admin/analytics-overview";
import { DocumentsPanel } from "@/components/admin/documents-panel";
import { ExpensesPanel } from "@/components/admin/expenses-panel";
import { LoadFailed, Loading } from "@/components/data-state";
import { useLang } from "@/lib/i18n";
import { useAsync } from "@/lib/use-async";
import { getAllClientsWithLiveData } from "@/lib/admin-data";
import type { Client } from "@/lib/mock-data";

const TABS = ["overview", "money", "documents"] as const;
type Tab = (typeof TABS)[number];

export default function AdminAnalyticsPage() {
  const { t } = useLang();
  const [tab, setTab] = useState<Tab>("overview");
  const { state, reload } = useAsync<Client[]>(
    () => getAllClientsWithLiveData(),
    "analytics-clients"
  );

  // Every number on this page is money. A failed load must not be rendered as
  // a page of zeroes.
  if (state.status === "loading") return <Loading />;
  if (state.status === "error") return <LoadFailed onRetry={reload} />;
  const clients = state.data;

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
