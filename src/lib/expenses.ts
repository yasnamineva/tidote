import { lastTwelveMonths, monthKey } from "@/lib/analytics";
import { getSupabase } from "@/lib/supabase/client";
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

type ExpenseRow = {
  id: string; date: string; category: string; vendor: string;
  description: string; amount: number | string;
  has_document: boolean; document_no: string; created_at: string;
};

function toExpense(r: ExpenseRow): Expense {
  return {
    id: r.id,
    date: r.date,
    category: r.category as ExpenseCategory,
    vendor: r.vendor,
    description: r.description,
    amount: Number(r.amount) || 0,
    hasDocument: r.has_document,
    documentNo: r.document_no,
    createdAt: r.created_at,
  };
}

const COLUMNS =
  "id,date,category,vendor,description,amount,has_document,document_no,created_at";

/** Newest invoice first — the studio works backwards from what just arrived. */
export async function getExpenses(): Promise<Expense[]> {
  const { data, error } = await getSupabase()
    .from("expenses")
    .select(COLUMNS)
    .order("date", { ascending: false });
  if (error) throw error;
  return (data as ExpenseRow[]).map(toExpense);
}

export async function saveExpense(expense: Expense): Promise<Expense[]> {
  const row = {
    date: expense.date,
    category: expense.category,
    vendor: expense.vendor,
    description: expense.description,
    amount: expense.amount,
    has_document: expense.hasDocument,
    document_no: expense.documentNo,
  };
  const supabase = getSupabase();
  const { error } = expense.id
    ? await supabase.from("expenses").update(row).eq("id", expense.id)
    : await supabase.from("expenses").insert(row);
  if (error) throw error;
  return getExpenses();
}

export async function deleteExpense(id: string): Promise<Expense[]> {
  const { error } = await getSupabase().from("expenses").delete().eq("id", id);
  if (error) throw error;
  return getExpenses();
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
