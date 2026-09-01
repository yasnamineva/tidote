"use client";

import { useState } from "react";
import { useLang } from "@/lib/i18n";
import { todayKey } from "@/lib/hours";
import { generateId } from "@/lib/mock-data";
import {
  EXPENSE_CATEGORIES,
  expenseCategoryLabel,
  saveExpense,
  type Expense,
  type ExpenseCategory,
} from "@/lib/expenses";

/** Create when `expense` is undefined, edit in place when it is given. */
export function ExpenseModal({
  expense,
  onClose,
  onSaved,
}: {
  expense?: Expense;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { t, lang } = useLang();
  const [date, setDate] = useState(expense?.date || todayKey());
  const [category, setCategory] = useState<ExpenseCategory>(
    expense?.category ?? "materials"
  );
  const [vendor, setVendor] = useState(expense?.vendor ?? "");
  const [description, setDescription] = useState(expense?.description ?? "");
  const [amount, setAmount] = useState(
    expense ? String(expense.amount || "") : ""
  );
  const [hasDocument, setHasDocument] = useState(expense?.hasDocument ?? true);
  const [documentNo, setDocumentNo] = useState(expense?.documentNo ?? "");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = Number.parseFloat(amount.replace(",", "."));
    if (!Number.isFinite(parsed) || parsed <= 0) {
      setError(t("exp.badAmount"));
      return;
    }
    saveExpense({
      id: expense?.id ?? generateId("ex"),
      date: date || todayKey(),
      category,
      vendor: vendor.trim(),
      description: description.trim(),
      amount: parsed,
      hasDocument,
      documentNo: hasDocument ? documentNo.trim() : "",
      createdAt: expense?.createdAt ?? new Date().toISOString(),
    });
    onSaved();
    onClose();
  }

  const fieldCls =
    "border border-line-strong bg-cream px-3 py-2 text-sm transition-colors focus:outline-none focus:border-moss-deep";
  const labelCls = "text-xs uppercase tracking-[0.1em] text-ink-soft";

  return (
    <div
      className="fixed inset-0 z-[60] bg-ink/50 flex items-start sm:items-center justify-center p-4 sm:p-6 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md my-auto bg-cream border border-line shadow-[0_20px_50px_-20px_rgba(34,30,25,0.5)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-line">
          <h2 className="font-display text-xl">
            {expense ? t("exp.editTitle") : t("exp.newTitle")}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-6 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="ex-date" className={labelCls}>
                {t("exp.date")}
              </label>
              <input
                id="ex-date"
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={`${fieldCls} tabular-nums`}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="ex-amount" className={labelCls}>
                {t("exp.amount")}
              </label>
              <input
                id="ex-amount"
                required
                inputMode="decimal"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setError(null);
                }}
                placeholder="0.00"
                className={`${fieldCls} tabular-nums`}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="ex-category" className={labelCls}>
              {t("exp.category")}
            </label>
            <select
              id="ex-category"
              value={category}
              onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
              className={fieldCls}
            >
              {EXPENSE_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {expenseCategoryLabel(lang, c)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="ex-vendor" className={labelCls}>
              {t("exp.vendor")}
            </label>
            <input
              id="ex-vendor"
              value={vendor}
              onChange={(e) => setVendor(e.target.value)}
              placeholder={t("exp.vendorPlaceholder")}
              className={fieldCls}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="ex-desc" className={labelCls}>
              {t("exp.description")}
            </label>
            <input
              id="ex-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={fieldCls}
            />
          </div>

          <div className="border border-line-strong bg-paper px-3 py-3 flex flex-col gap-3">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={hasDocument}
                onChange={(e) => setHasDocument(e.target.checked)}
                className="h-4 w-4 mt-0.5 accent-[var(--moss-deep)] shrink-0"
              />
              <span className="text-sm leading-snug">
                {t("exp.hasDocument")}
                <span className="block text-xs text-ink-soft mt-0.5">
                  {t("exp.hasDocumentHint")}
                </span>
              </span>
            </label>
            {hasDocument && (
              <div className="flex flex-col gap-1.5">
                <label htmlFor="ex-docno" className={labelCls}>
                  {t("exp.documentNo")}
                </label>
                <input
                  id="ex-docno"
                  value={documentNo}
                  onChange={(e) => setDocumentNo(e.target.value)}
                  className={`${fieldCls} tabular-nums`}
                />
              </div>
            )}
          </div>

          {error && <p className="text-sm text-accent">{error}</p>}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="text-xs uppercase tracking-[0.15em] text-ink-soft hover:text-ink transition-colors px-3 py-2"
            >
              {t("newclient.cancel")}
            </button>
            <button
              type="submit"
              className="bg-accent text-cream px-5 py-2.5 text-xs uppercase tracking-[0.15em] transition-colors hover:bg-accent/85"
            >
              {t("exp.save")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
