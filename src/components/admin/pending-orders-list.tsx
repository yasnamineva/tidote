"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ORDER_STATUS_LABEL,
  ORDER_STATUS_SEQUENCE,
  type Client,
  type Order,
  type OrderStatus,
} from "@/lib/mock-data";
import { acceptOrder, denyOrder, updateOrderStatus } from "@/lib/admin-data";
import { OrderPhotoThumb } from "@/components/order-photo-thumb";

type Row = Order & { clientId: string; clientName: string };

function OrderReviewRow({
  order,
  onChange,
}: {
  order: Row;
  onChange: () => void;
}) {
  const [price, setPrice] = useState("");
  const [showDeny, setShowDeny] = useState(false);
  const [reason, setReason] = useState("");

  const detailHref = `/admin/orders/${order.clientId}/${order.id}`;

  const header = (
    <Link
      href={detailHref}
      className="flex items-center gap-4 group flex-1 min-w-0"
    >
      <OrderPhotoThumb photos={order.photos} category={order.category} label={order.piece} />
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-[0.15em] text-ink-soft">
          {order.id} &middot; {order.clientName}
        </p>
        <p className="font-display text-lg group-hover:text-accent transition-colors truncate">
          {order.piece}
        </p>
        {order.notes && (
          <p className="text-sm text-ink-soft italic mt-0.5 truncate">
            {order.notes}
          </p>
        )}
      </div>
    </Link>
  );

  if (order.reviewStatus === "pending") {
    return (
      <div className="border border-accent/40 bg-accent/5 px-5 py-4 flex flex-col gap-3">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          {header}
          <span className="text-xs uppercase tracking-[0.15em] px-3 py-1 rounded-full bg-accent-soft/40 text-accent whitespace-nowrap">
            Pending Review
          </span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <input
            type="text"
            inputMode="decimal"
            placeholder="Price (e.g. 250)"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="border border-line bg-cream px-3 py-2 text-sm w-36"
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
            Accept
          </button>
          <button
            type="button"
            onClick={() => setShowDeny((v) => !v)}
            className="border border-accent text-accent px-4 py-2 text-xs uppercase tracking-[0.15em] transition-colors hover:bg-accent hover:text-cream"
          >
            Deny
          </button>
        </div>
        {showDeny && (
          <div className="flex items-center gap-2 flex-wrap">
            <input
              type="text"
              placeholder="Reason (optional)"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="border border-line bg-cream px-3 py-2 text-sm flex-1 min-w-[180px]"
            />
            <button
              type="button"
              onClick={() => {
                denyOrder(order.clientId, order.id, reason || undefined);
                onChange();
              }}
              className="bg-accent text-cream px-4 py-2 text-xs uppercase tracking-[0.15em] transition-colors hover:bg-accent/80"
            >
              Confirm Deny
            </button>
          </div>
        )}
      </div>
    );
  }

  if (order.reviewStatus === "denied") {
    return (
      <div className="border border-line bg-paper px-5 py-4 flex items-center justify-between gap-4 flex-wrap opacity-70">
        {header}
        <span className="text-xs uppercase tracking-[0.15em] px-3 py-1 rounded-full bg-line/50 text-ink-soft whitespace-nowrap">
          Declined
        </span>
      </div>
    );
  }

  const idx = ORDER_STATUS_SEQUENCE.indexOf(order.status);
  const nextStatus = ORDER_STATUS_SEQUENCE[idx + 1];

  return (
    <div className="border border-line bg-paper px-5 py-4 flex items-center justify-between gap-4 flex-wrap">
      {header}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-xs uppercase tracking-[0.15em] px-3 py-1 rounded-full bg-line/50 text-ink-soft whitespace-nowrap">
          {ORDER_STATUS_LABEL[order.status]}
        </span>
        {nextStatus && (
          <button
            type="button"
            onClick={() => {
              updateOrderStatus(order.clientId, order.id, nextStatus as OrderStatus);
              onChange();
            }}
            className="btn-sweep text-xs uppercase tracking-[0.15em] border border-ink px-3 py-1.5 transition-colors duration-300 hover:text-cream whitespace-nowrap"
          >
            Mark {ORDER_STATUS_LABEL[nextStatus]}
          </button>
        )}
      </div>
    </div>
  );
}

export function PendingOrdersList({
  clients,
  onChange,
}: {
  clients: Client[];
  onChange: () => void;
}) {
  const rows: Row[] = clients
    .flatMap((c) =>
      c.orders.map((o) => ({ ...o, clientId: c.id, clientName: c.name }))
    )
    .sort((a, b) => (a.placedOn < b.placedOn ? 1 : -1));

  if (rows.length === 0) {
    return <p className="text-sm text-ink-soft">No orders yet.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {rows.map((order) => (
        <OrderReviewRow key={order.id} order={order} onChange={onChange} />
      ))}
    </div>
  );
}
