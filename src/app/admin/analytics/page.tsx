"use client";

import { useEffect, useState } from "react";
import { AdminTopBar } from "@/components/admin/admin-shell";
import { BarList, ColumnChart } from "@/components/admin/charts";
import { Reveal } from "@/components/reveal";
import { useLang } from "@/lib/i18n";
import { getAllClientsWithLiveData } from "@/lib/admin-data";
import {
  computeAnalytics,
  formatMoney,
  monthLabel,
  type Analytics,
} from "@/lib/analytics";
import { categoryLabel, statusLabel } from "@/lib/translations";
import type { Client } from "@/lib/mock-data";

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-line bg-paper px-5 py-4">
      <p className="text-xs uppercase tracking-[0.1em] text-ink-soft">{label}</p>
      <p className="text-2xl mt-1.5">{value}</p>
    </div>
  );
}

function Panel({
  title,
  sub,
  children,
}: {
  title: string;
  sub?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-line bg-paper px-6 py-5">
      <h2 className="font-display text-xl">{title}</h2>
      {sub && <p className="text-xs text-ink-soft mt-1">{sub}</p>}
      <div className="mt-5">{children}</div>
    </div>
  );
}

export default function AdminAnalyticsPage() {
  const { lang, t } = useLang();
  const [clients, setClients] = useState<Client[] | null>(null);
  const [showTable, setShowTable] = useState(false);

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

  const a: Analytics = computeAnalytics(clients);
  const money = (v: number) => formatMoney(v, lang);
  const monthPoints = a.months.map((m) => ({
    label: monthLabel(m.date, lang),
    caption: `${monthLabel(m.date, lang)} ${m.date.getFullYear()}`,
  }));

  return (
    <>
      <AdminTopBar title={t("an.title")} />
      <p className="text-sm text-ink-soft mb-8 -mt-4">{t("an.sub")}</p>

      <div className="max-w-6xl flex flex-col gap-8">
        {/* Hero figure — the one number the view leads with */}
        <Reveal>
          <div className="border border-line bg-paper px-6 py-6">
            <p className="text-xs uppercase tracking-[0.1em] text-ink-soft">
              {t("an.revenueToDate")}
            </p>
            <p className="text-5xl md:text-6xl mt-2 leading-none">
              {money(a.revenue)}
            </p>
            <p className="text-xs text-ink-soft mt-3">
              {t("an.declinedExcluded")}
              {a.quotePending > 0 && ` · ${t("an.quotePending", { n: a.quotePending })}`}
            </p>
          </div>
        </Reveal>

        <Reveal>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatTile label={t("an.orders")} value={String(a.totalOrders)} />
            <StatTile label={t("an.clients")} value={String(a.totalClients)} />
            <StatTile label={t("an.avgOrder")} value={money(a.avgOrder)} />
            <StatTile
              label={t("an.awaiting")}
              value={String(a.awaitingReview)}
            />
          </div>
        </Reveal>

        {/* Two measures, two charts — never a second y-axis on one plot */}
        <Reveal>
          <Panel title={t("an.ordersPerMonth")} sub={t("an.last12")}>
            <ColumnChart
              points={a.months.map((m, i) => ({
                ...monthPoints[i],
                value: m.orders,
              }))}
              formatValue={(v) => String(v)}
            />
          </Panel>
        </Reveal>

        <Reveal>
          <Panel title={t("an.revenuePerMonth")} sub={t("an.last12")}>
            <ColumnChart
              points={a.months.map((m, i) => ({
                ...monthPoints[i],
                value: m.revenue,
              }))}
              formatValue={money}
            />
          </Panel>
        </Reveal>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          <Reveal>
            <Panel title={t("an.byCategory")}>
              {a.byCategory.length === 0 ? (
                <p className="text-sm text-ink-soft">{t("an.noData")}</p>
              ) : (
                <BarList
                  rows={a.byCategory.map((r) => ({
                    label: categoryLabel(lang, r.category),
                    value: r.count,
                  }))}
                />
              )}
            </Panel>
          </Reveal>

          <Reveal>
            <Panel title={t("an.byStatus")}>
              <BarList
                rows={a.byStatus.map((r) => ({
                  label: statusLabel(lang, r.status),
                  value: r.count,
                }))}
              />
            </Panel>
          </Reveal>
        </div>

        {/* Table view so nothing is gated behind reading a chart */}
        <Reveal>
          <div className="border border-line bg-paper px-6 py-5">
            <button
              type="button"
              onClick={() => setShowTable((v) => !v)}
              className="text-xs uppercase tracking-[0.15em] text-ink-soft hover:text-ink transition-colors"
              aria-expanded={showTable}
            >
              {showTable ? "− " : "+ "}
              {t("an.tableView")}
            </button>
            {showTable && (
              <div className="overflow-x-auto mt-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-[0.1em] text-ink-soft">
                      <th className="py-2 pr-4 font-normal">{t("an.month")}</th>
                      <th className="py-2 pr-4 font-normal">{t("an.orders")}</th>
                      <th className="py-2 font-normal">
                        {t("an.revenuePerMonth")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {a.months.map((m, i) => (
                      <tr key={m.key} className="border-t border-line">
                        <td className="py-2 pr-4">
                          {monthPoints[i].caption}
                        </td>
                        <td className="py-2 pr-4 tabular-nums">{m.orders}</td>
                        <td className="py-2 tabular-nums">
                          {money(m.revenue)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </Reveal>
      </div>
    </>
  );
}
