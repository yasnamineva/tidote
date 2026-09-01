"use client";

import { useEffect, useState } from "react";
import { BarList, ColumnChart } from "@/components/admin/charts";
import { ExpenseModal } from "@/components/admin/expense-modal";
import { Panel, StatTile } from "@/components/admin/panels";
import { Reveal } from "@/components/reveal";
import { useLang } from "@/lib/i18n";
import {
  computeAnalytics,
  formatMoney,
  formatMoneyExact,
  monthLabel,
} from "@/lib/analytics";
import {
  deleteExpense,
  expenseCategoryLabel,
  getExpenses,
  summarizeExpenses,
  type Expense,
} from "@/lib/expenses";
import { getReadyPieces, summarizeReadyStock } from "@/lib/ready-pieces";
import type { Client } from "@/lib/mock-data";

export function ExpensesPanel({ clients }: { clients: Client[] }) {
  const { t, lang } = useLang();
  const [expenses, setExpenses] = useState<Expense[] | null>(null);
  const [readySales, setReadySales] = useState(0);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [creating, setCreating] = useState(false);
  const [missingOnly, setMissingOnly] = useState(false);
  const [confirming, setConfirming] = useState<string | null>(null);

  function refresh() {
    setExpenses(getExpenses());
    setReadySales(summarizeReadyStock(getReadyPieces()).soldValue);
  }

  useEffect(() => {
    refresh();
  }, []);

  if (!expenses) {
    return (
      <p className="text-ink-soft text-sm uppercase tracking-[0.15em] animate-pulse">
        {t("common.loading")}
      </p>
    );
  }

  // Ledger figures keep their cents; only the chart axis rounds.
  const money = (v: number) => formatMoneyExact(v, lang);
  const axisMoney = (v: number) => formatMoney(v, lang);
  const summary = summarizeExpenses(expenses);
  const orderRevenue = computeAnalytics(clients).revenue;
  const income = orderRevenue + readySales;
  const net = income - summary.total;

  const visible = missingOnly
    ? expenses.filter((e) => !e.hasDocument)
    : expenses;

  return (
    <div className="max-w-6xl flex flex-col gap-8">
      <Reveal>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatTile label={t("exp.income")} value={money(income)} />
          <StatTile label={t("exp.spend")} value={money(summary.total)} />
          <StatTile
            label={t("exp.net")}
            value={money(net)}
            tone={net < 0 ? "warn" : "normal"}
          />
          <StatTile
            label={t("exp.missingDocs")}
            value={String(summary.missingDocs)}
            tone={summary.missingDocs > 0 ? "warn" : "normal"}
          />
        </div>
      </Reveal>

      <Reveal>
        <div className="border border-line bg-paper px-6 py-5 text-sm">
          <p className="text-xs uppercase tracking-[0.1em] text-ink-soft mb-3">
            {t("exp.reconTitle")}
          </p>
          <dl className="flex flex-col gap-1.5">
            <div className="flex justify-between gap-4">
              <dt className="text-ink-soft">{t("exp.fromOrders")}</dt>
              <dd className="tabular-nums">{money(orderRevenue)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-ink-soft">{t("exp.fromReady")}</dt>
              <dd className="tabular-nums">{money(readySales)}</dd>
            </div>
            <div className="flex justify-between gap-4 border-t border-line pt-1.5">
              <dt className="text-ink-soft">{t("exp.spend")}</dt>
              <dd className="tabular-nums">−{money(summary.total)}</dd>
            </div>
            <div className="flex justify-between gap-4 border-t border-line pt-1.5">
              <dt>{t("exp.net")}</dt>
              <dd className={`tabular-nums ${net < 0 ? "text-accent" : ""}`}>
                {money(net)}
              </dd>
            </div>
          </dl>
          <p className="text-xs text-ink-soft mt-4">{t("exp.reconNote")}</p>
        </div>
      </Reveal>

      {summary.missingDocs > 0 && (
        <Reveal>
          <div className="border border-accent/30 bg-accent/5 px-6 py-4">
            <p className="text-sm">
              {t("exp.missingCallout", {
                n: summary.missingDocs,
                value: money(summary.missingDocsValue),
              })}
            </p>
          </div>
        </Reveal>
      )}

      <Reveal>
        <Panel title={t("exp.perMonth")} sub={t("an.last12")}>
          <ColumnChart
            points={summary.byMonth.map((m) => ({
              label: monthLabel(m.date, lang),
              caption: `${monthLabel(m.date, lang)} ${m.date.getFullYear()}`,
              value: m.total,
            }))}
            formatValue={axisMoney}
          />
        </Panel>
      </Reveal>

      <Reveal>
        <Panel title={t("exp.byCategory")}>
          {summary.byCategory.length === 0 ? (
            <p className="text-sm text-ink-soft">{t("exp.empty")}</p>
          ) : (
            <BarList
              rows={summary.byCategory.map((r) => ({
                label: expenseCategoryLabel(lang, r.category),
                value: r.total,
              }))}
              formatValue={axisMoney}
            />
          )}
        </Panel>
      </Reveal>

      <Reveal>
        <Panel
          title={t("exp.listTitle")}
          sub={t("exp.listSub", { n: expenses.length })}
          actions={
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMissingOnly((v) => !v)}
                aria-pressed={missingOnly}
                className={`border px-3 py-1.5 text-xs uppercase tracking-[0.1em] transition-colors ${
                  missingOnly
                    ? "border-ink bg-ink text-cream"
                    : "border-line-strong text-ink-soft hover:text-ink"
                }`}
              >
                {t("exp.filterMissing")}
              </button>
              <button
                type="button"
                onClick={() => setCreating(true)}
                className="bg-accent text-cream px-4 py-2 text-xs uppercase tracking-[0.15em] transition-colors hover:bg-accent/85 whitespace-nowrap"
              >
                + {t("exp.newExpense")}
              </button>
            </div>
          }
        >
          {visible.length === 0 ? (
            <p className="text-sm text-ink-soft">
              {expenses.length === 0 ? t("exp.empty") : t("exp.emptyFilter")}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[40rem]">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-[0.1em] text-ink-soft">
                    <th className="py-2 pr-4 font-normal">{t("exp.date")}</th>
                    <th className="py-2 pr-4 font-normal">{t("exp.category")}</th>
                    <th className="py-2 pr-4 font-normal">{t("exp.vendor")}</th>
                    <th className="py-2 pr-4 font-normal">{t("exp.document")}</th>
                    <th className="py-2 pr-4 font-normal text-right">
                      {t("exp.amount")}
                    </th>
                    <th className="py-2 font-normal" />
                  </tr>
                </thead>
                <tbody>
                  {visible.map((e) => (
                    <tr key={e.id} className="border-t border-line align-top">
                      <td className="py-2.5 pr-4 tabular-nums whitespace-nowrap">
                        {e.date}
                      </td>
                      <td className="py-2.5 pr-4">
                        {expenseCategoryLabel(lang, e.category)}
                        {e.description && (
                          <span className="block text-xs text-ink-soft">
                            {e.description}
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 pr-4 text-ink-soft">
                        {e.vendor || "—"}
                      </td>
                      <td className="py-2.5 pr-4">
                        {e.hasDocument ? (
                          <span className="text-xs text-moss-deep tabular-nums">
                            {e.documentNo || t("exp.onFile")}
                          </span>
                        ) : (
                          <span className="text-xs text-accent">
                            {t("exp.noDocument")}
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 pr-4 tabular-nums text-right whitespace-nowrap">
                        {money(e.amount)}
                      </td>
                      <td className="py-2.5 text-right whitespace-nowrap">
                        {confirming === e.id ? (
                          <span className="flex gap-3 justify-end text-xs">
                            <button
                              type="button"
                              onClick={() => {
                                deleteExpense(e.id);
                                setConfirming(null);
                                refresh();
                              }}
                              className="text-accent hover:underline"
                            >
                              {t("ready.delete")}
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirming(null)}
                              className="text-ink-soft hover:text-ink"
                            >
                              {t("newclient.cancel")}
                            </button>
                          </span>
                        ) : (
                          <span className="flex gap-3 justify-end text-xs">
                            <button
                              type="button"
                              onClick={() => setEditing(e)}
                              className="text-ink-soft hover:text-ink"
                            >
                              {t("ready.edit")}
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirming(e.id)}
                              className="text-ink-soft hover:text-accent"
                            >
                              {t("ready.delete")}
                            </button>
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>
      </Reveal>

      {(creating || editing) && (
        <ExpenseModal
          expense={editing ?? undefined}
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
          onSaved={refresh}
        />
      )}
    </div>
  );
}
