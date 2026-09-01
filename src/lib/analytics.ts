import {
  ORDER_CATEGORIES,
  ORDER_STATUS_SEQUENCE,
  type Client,
  type Order,
  type OrderCategory,
  type OrderStatus,
} from "@/lib/mock-data";

export type MonthPoint = { key: string; date: Date; orders: number; revenue: number };

export type Analytics = {
  months: MonthPoint[];
  totalOrders: number;
  totalClients: number;
  revenue: number;
  avgOrder: number;
  awaitingReview: number;
  quotePending: number;
  byCategory: { category: OrderCategory; count: number }[];
  byStatus: { status: OrderStatus; count: number }[];
};

/** Seed totals look like "€420"; anything unpriced ("Quote pending") counts as 0. */
export function parseTotal(total: string): number {
  const digits = (total ?? "").replace(/[^0-9.,]/g, "").replace(",", ".");
  const value = Number.parseFloat(digits);
  return Number.isFinite(value) ? value : 0;
}

export function monthKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

/** A fixed 12-month window ending on `now`, so an empty month shows as a gap. */
export function lastTwelveMonths(now = new Date()): { key: string; date: Date }[] {
  const months: { key: string; date: Date }[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ key: monthKey(d), date: d });
  }
  return months;
}

/** Denied orders never became work, so they stay out of every money figure. */
function isBillable(o: Order): boolean {
  return o.reviewStatus !== "denied";
}

export function computeAnalytics(clients: Client[], now = new Date()): Analytics {
  const orders = clients.flatMap((c) => c.orders);
  const billable = orders.filter(isBillable);

  // Fixed 12-month window so an empty month still shows as a gap, not a skip.
  const months: MonthPoint[] = [];
  const cursor = new Date(now.getFullYear(), now.getMonth(), 1);
  for (let i = 11; i >= 0; i--) {
    const d = new Date(cursor.getFullYear(), cursor.getMonth() - i, 1);
    months.push({ key: monthKey(d), date: d, orders: 0, revenue: 0 });
  }
  const index = new Map(months.map((m) => [m.key, m]));

  for (const o of orders) {
    const placed = new Date(o.placedOn);
    if (Number.isNaN(placed.getTime())) continue;
    const bucket = index.get(monthKey(placed));
    if (!bucket) continue;
    bucket.orders += 1;
    if (isBillable(o)) bucket.revenue += parseTotal(o.total);
  }

  const revenue = billable.reduce((sum, o) => sum + parseTotal(o.total), 0);
  const priced = billable.filter((o) => parseTotal(o.total) > 0);

  return {
    months,
    totalOrders: orders.length,
    totalClients: clients.length,
    revenue,
    avgOrder: priced.length ? revenue / priced.length : 0,
    awaitingReview: orders.filter((o) => o.reviewStatus === "pending").length,
    quotePending: billable.length - priced.length,
    byCategory: ORDER_CATEGORIES.map((category) => ({
      category,
      count: orders.filter((o) => o.category === category).length,
    }))
      .filter((row) => row.count > 0)
      .sort((a, b) => b.count - a.count),
    byStatus: ORDER_STATUS_SEQUENCE.map((status) => ({
      status,
      count: billable.filter((o) => o.status === status).length,
    })),
  };
}

/** Rounded to whole euros — for summaries, chart axes and asking prices. */
export function formatMoney(value: number, lang: string): string {
  return new Intl.NumberFormat(lang === "bg" ? "bg-BG" : "en-GB", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Cents kept. Anything that is or sums an actual invoice amount uses this — a
 * ledger whose rows round to something other than its own total is worse than
 * useless when the accountant checks it.
 */
export function formatMoneyExact(value: number, lang: string): string {
  return new Intl.NumberFormat(lang === "bg" ? "bg-BG" : "en-GB", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function monthLabel(d: Date, lang: string): string {
  return new Intl.DateTimeFormat(lang === "bg" ? "bg-BG" : "en-GB", {
    month: "short",
  }).format(d);
}
