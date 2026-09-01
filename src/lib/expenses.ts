import { lastTwelveMonths, monthKey } from "@/lib/analytics";
import { generateId } from "@/lib/mock-data";
import { readJSON, writeJSON } from "@/lib/storage";
import { translate, type Lang } from "@/lib/translations";

/**
 * What the atelier spends, kept alongside what it earns so the studio can see a
 * net figure rather than a turnover figure. Categories are the ones a small
 * Bulgarian workshop actually books against, not a generic chart of accounts.
 */

export type ExpenseCategory =
  | "materials"
  | "trims"
  | "equipment"
  | "rent"
  | "utilities"
  | "shipping"
  | "packaging"
  | "marketing"
  | "software"
  | "accounting"
  | "socialSecurity"
  | "taxes"
  | "subcontract"
  | "transport"
  | "other";

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  "materials",
  "trims",
  "equipment",
  "rent",
  "utilities",
  "shipping",
  "packaging",
  "marketing",
  "software",
  "accounting",
  "socialSecurity",
  "taxes",
  "subcontract",
  "transport",
  "other",
];

export type Expense = {
  id: string;
  /** "YYYY-MM-DD" — the date on the invoice, not the date it was typed in. */
  date: string;
  category: ExpenseCategory;
  vendor: string;
  description: string;
  /** EUR, what actually left the account. */
  amount: number;
  /**
   * Whether the invoice or receipt is filed. An expense with no document behind
   * it cannot be deducted, so this is the field the studio is nagged about.
   */
  hasDocument: boolean;
  documentNo: string;
  createdAt: string;
};

const EXPENSES_KEY = "tidote_expenses";

export const SEED_EXPENSES: Expense[] = [
  {
    id: "ex-seed-1",
    date: "2026-08-04",
    category: "materials",
    vendor: "Textil Trade",
    description: "Cotton twill, 24 m",
    amount: 384,
    hasDocument: true,
    documentNo: "0000004512",
    createdAt: "2026-08-04T09:00:00.000Z",
  },
  {
    id: "ex-seed-2",
    date: "2026-08-01",
    category: "rent",
    vendor: "Elin Vruh 16",
    description: "Atelier rent — August",
    amount: 450,
    hasDocument: true,
    documentNo: "0000000188",
    createdAt: "2026-08-01T09:00:00.000Z",
  },
  {
    id: "ex-seed-3",
    date: "2026-08-12",
    category: "trims",
    vendor: "Merkuri",
    description: "YKK zips, thread, labels",
    amount: 96.4,
    hasDocument: false,
    documentNo: "",
    createdAt: "2026-08-12T09:00:00.000Z",
  },
  {
    id: "ex-seed-4",
    date: "2026-08-15",
    category: "shipping",
    vendor: "Econt",
    description: "Courier — August deliveries",
    amount: 42.8,
    hasDocument: true,
    documentNo: "0000031244",
    createdAt: "2026-08-15T09:00:00.000Z",
  },
  {
    id: "ex-seed-5",
    date: "2026-07-25",
    category: "socialSecurity",
    vendor: "НАП",
    description: "Self-insured contributions — July",
    amount: 178,
    hasDocument: true,
    documentNo: "",
    createdAt: "2026-07-25T09:00:00.000Z",
  },
  {
    id: "ex-seed-6",
    date: "2026-07-18",
    category: "equipment",
    vendor: "Juki BG",
    description: "Overlock servicing",
    amount: 120,
    hasDocument: false,
    documentNo: "",
    createdAt: "2026-07-18T09:00:00.000Z",
  },
];

function normalize(raw: Partial<Expense>): Expense {
  const category = EXPENSE_CATEGORIES.includes(raw.category as ExpenseCategory)
    ? (raw.category as ExpenseCategory)
    : "other";
  return {
    id: raw.id ?? generateId("ex"),
    date: raw.date ?? "",
    category,
    vendor: raw.vendor ?? "",
    description: raw.description ?? "",
    amount: Number.isFinite(raw.amount) ? Number(raw.amount) : 0,
    hasDocument: raw.hasDocument === true,
    documentNo: raw.documentNo ?? "",
    createdAt: raw.createdAt ?? new Date().toISOString(),
  };
}

/** Newest invoice date first. */
export function getExpenses(): Expense[] {
  return readJSON<Partial<Expense>[]>(EXPENSES_KEY, SEED_EXPENSES)
    .map(normalize)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

function persist(list: Expense[]): Expense[] {
  writeJSON(EXPENSES_KEY, list);
  return list.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function saveExpense(expense: Expense): Expense[] {
  const current = getExpenses();
  const exists = current.some((e) => e.id === expense.id);
  return persist(
    exists
      ? current.map((e) => (e.id === expense.id ? expense : e))
      : [expense, ...current]
  );
}

export function deleteExpense(id: string): Expense[] {
  return persist(getExpenses().filter((e) => e.id !== id));
}

export type ExpenseSummary = {
  total: number;
  /** Only what is dated inside the current calendar year — the tax year. */
  thisYear: number;
  missingDocs: number;
  missingDocsValue: number;
  byCategory: { category: ExpenseCategory; total: number }[];
  byMonth: { key: string; date: Date; total: number }[];
};

export function summarizeExpenses(
  expenses: Expense[],
  now = new Date()
): ExpenseSummary {
  const months = lastTwelveMonths(now).map((m) => ({ ...m, total: 0 }));
  const index = new Map(months.map((m) => [m.key, m]));
  const year = String(now.getFullYear());

  let total = 0;
  let thisYear = 0;
  for (const e of expenses) {
    total += e.amount;
    if (e.date.startsWith(year)) thisYear += e.amount;
    const [y, m] = e.date.split("-").map(Number);
    if (!y || !m) continue;
    const bucket = index.get(monthKey(new Date(y, m - 1, 1)));
    if (bucket) bucket.total += e.amount;
  }

  const missing = expenses.filter((e) => !e.hasDocument);

  return {
    total,
    thisYear,
    missingDocs: missing.length,
    missingDocsValue: missing.reduce((sum, e) => sum + e.amount, 0),
    byCategory: EXPENSE_CATEGORIES.map((category) => ({
      category,
      total: expenses
        .filter((e) => e.category === category)
        .reduce((sum, e) => sum + e.amount, 0),
    }))
      .filter((row) => row.total > 0)
      .sort((a, b) => b.total - a.total),
    byMonth: months,
  };
}

export function expenseCategoryLabel(lang: Lang, category: string): string {
  return translate(lang, `exp.cat.${category}`);
}
