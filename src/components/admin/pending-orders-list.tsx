"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ORDER_CATEGORIES,
  type Client,
  type Order,
  type OrderCategory,
} from "@/lib/mock-data";
import { acceptOrder, denyOrder } from "@/lib/admin-data";
import { OrderPhotoThumb } from "@/components/order-photo-thumb";
import { useLang } from "@/lib/i18n";
import {
  categoryLabel,
  orderNoteText,
  pieceLabel,
  statusLabel,
} from "@/lib/translations";

type Row = Order & { clientId: string; clientName: string };

const STATUS_PILL: Record<string, string> = {
  received: "bg-line/50 text-ink-soft",
  in_production: "bg-accent-soft/40 text-accent",
  ready: "bg-accent-soft/40 text-accent",
  shipped: "bg-moss-soft text-moss-deep",
  delivered: "bg-moss-soft text-moss-deep",
};

function OrderReviewRow({
  order,
  onChange,
}: {
  order: Row;
  onChange: () => void;
}) {
  const { lang, t } = useLang();
  const [price, setPrice] = useState("");
  const [showDeny, setShowDeny] = useState(false);
  const [reason, setReason] = useState("");

  const detailHref = `/admin/orders/${order.clientId}/${order.id}`;
  const piece = pieceLabel(lang, order.piece);

  const note = orderNoteText(lang, order.id, order.notes);

  const header = (
    <Link
      href={detailHref}
      className="flex items-center gap-4 group flex-1 min-w-0"
    >
      <OrderPhotoThumb photos={order.photos} label={piece} />
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-[0.15em] text-ink-soft">
          {order.id} &middot; {order.clientName}
        </p>
        <p className="font-display text-lg group-hover:text-accent transition-colors truncate">
          {piece}
        </p>
        {note && (
          <p className="text-sm text-ink-soft italic mt-0.5 truncate">{note}</p>
        )}
      </div>
    </Link>
  );

  /** Status above, category below — both right-aligned at the panel edge. */
  const meta = (statusPill: React.ReactNode) => (
    <div className="flex flex-col items-end gap-2 shrink-0">
      {statusPill}
      <span className="text-[10px] uppercase tracking-[0.15em] px-2.5 py-1 rounded-full bg-line/50 text-ink-soft whitespace-nowrap">
        {categoryLabel(lang, order.category)}
      </span>
    </div>
  );

  if (order.reviewStatus === "pending") {
    return (
      <div className="border border-accent/40 bg-accent/5 px-5 py-4 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-4">
          {header}
          {meta(
            <span className="text-xs uppercase tracking-[0.15em] px-3 py-1 rounded-full bg-accent-soft/40 text-accent whitespace-nowrap">
              {t("od.pendingReview")}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <input
            type="text"
            inputMode="decimal"
            placeholder={t("od.pricePlaceholder")}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="border border-line-strong bg-cream px-3 py-2 text-sm w-36"
          />
          <button
            type="button"
            disabled={!price.trim()}
            onClick={() => {
              acceptOrder(order.clientId, order.id, price);
              onChange();
            }}
            className="bg-moss text-cream px-4 py-2 text-xs uppercase tracking-[0.15em] transition-colors hover:bg-moss-deep disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {t("od.accept")}
          </button>
          <button
            type="button"
            onClick={() => setShowDeny((v) => !v)}
            className="border border-accent text-accent px-4 py-2 text-xs uppercase tracking-[0.15em] transition-colors hover:bg-accent hover:text-cream"
          >
            {t("od.deny")}
          </button>
        </div>
        {showDeny && (
          <div className="flex items-center gap-2 flex-wrap">
            <input
              type="text"
              placeholder={t("od.reasonPlaceholder")}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="border border-line-strong bg-cream px-3 py-2 text-sm flex-1 min-w-[180px]"
            />
            <button
              type="button"
              onClick={() => {
                denyOrder(order.clientId, order.id, reason || undefined);
                onChange();
              }}
              className="bg-accent text-cream px-4 py-2 text-xs uppercase tracking-[0.15em] transition-colors hover:bg-accent/80"
            >
              {t("od.confirmDeny")}
            </button>
          </div>
        )}
      </div>
    );
  }

  if (order.reviewStatus === "denied") {
    return (
      <div className="border border-line bg-paper px-5 py-4 flex items-start justify-between gap-4 opacity-70">
        {header}
        {meta(
          <span className="text-xs uppercase tracking-[0.15em] px-3 py-1 rounded-full bg-line/50 text-ink-soft whitespace-nowrap">
            {t("order.declined")}
          </span>
        )}
      </div>
    );
  }

  // Advancing production happens on the order page, where the full stage
  // picker and the client's notes are in view — not from a list row.
  return (
    <div className="border border-line bg-paper px-5 py-4 flex items-start justify-between gap-4 transition-colors hover:border-line-strong">
      {header}
      {meta(
        <span
          className={`text-xs uppercase tracking-[0.15em] px-3 py-1 rounded-full whitespace-nowrap ${STATUS_PILL[order.status] ?? "bg-line/50 text-ink-soft"}`}
        >
          {statusLabel(lang, order.status)}
        </span>
      )}
    </div>
  );
}

export function PendingOrdersList({
  clients,
  onChange,
  filterable = false,
  fixedCategory,
  onCategoryChange,
}: {
  clients: Client[];
  onChange: () => void;
  filterable?: boolean;
  fixedCategory?: OrderCategory;
  onCategoryChange?: (category: OrderCategory | "all") => void;
}) {
  const { lang, t } = useLang();
  const [category, setCategory] = useState<OrderCategory | "all">("all");

  let allRows: Row[] = clients
    .flatMap((c) =>
      c.orders.map((o) => ({ ...o, clientId: c.id, clientName: c.name }))
    )
    .sort((a, b) => (a.placedOn < b.placedOn ? 1 : -1));

  if (fixedCategory) {
    allRows = allRows.filter((r) => r.category === fixedCategory);
  }

  if (allRows.length === 0) {
    return (
      <p className="text-sm text-ink-soft">
        {t(fixedCategory ? "filter.none" : "pol.noOrders")}
      </p>
    );
  }

  const rows =
    category === "all"
      ? allRows
      : allRows.filter((r) => r.category === category);

  return (
    <div className="flex flex-col gap-4">
      {filterable && (
        <div className="flex items-center gap-3 flex-wrap">
          <label
            htmlFor="order-filter"
            className="text-xs uppercase tracking-[0.1em] text-ink-soft"
          >
            {t("filter.label")}
          </label>
          <select
            id="order-filter"
            value={category}
            onChange={(e) => {
              const next = e.target.value as OrderCategory | "all";
              setCategory(next);
              onCategoryChange?.(next);
            }}
            className="border border-line-strong bg-cream px-3 py-2 text-sm focus:outline-none focus:border-moss-deep"
          >
            <option value="all">{t("filter.all")}</option>
            {ORDER_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {categoryLabel(lang, c)}
              </option>
            ))}
          </select>
        </div>
      )}

      {rows.length === 0 ? (
        <p className="text-sm text-ink-soft">{t("filter.none")}</p>
      ) : (
        <div className="flex flex-col gap-3">
          {rows.map((order) => (
            <OrderReviewRow key={order.id} order={order} onChange={onChange} />
          ))}
        </div>
      )}
    </div>
  );
}
