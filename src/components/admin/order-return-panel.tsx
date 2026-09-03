"use client";

import { useState } from "react";
import { useLang } from "@/lib/i18n";
import { returnOrder, undoOrderReturn } from "@/lib/admin-data";
import { parseTotal } from "@/lib/analytics";
import { READY_SIZES, sizeLabel } from "@/lib/ready-pieces";
import type { Order } from "@/lib/mock-data";

/**
 * Recording a return, from the studio side.
 *
 * The garment came back, so it stops being the client's — and a finished
 * garment that belongs to nobody is stock. Putting it on the rail is therefore
 * the default, not an extra step she has to remember; the only thing the order
 * cannot tell us is what size to label it, so that is the one field.
 */
export function OrderReturnPanel({
  order,
  clientId,
  onChange,
}: {
  order: Order;
  clientId: string;
  onChange: () => void;
}) {
  const { lang, t } = useLang();
  const [open, setOpen] = useState(false);
  const [toStock, setToStock] = useState(true);
  const [size, setSize] = useState(READY_SIZES[2]);
  const [price, setPrice] = useState(String(parseTotal(order.total) || ""));
  const [undoNote, setUndoNote] = useState<string | null>(null);

  const fieldCls =
    "border border-line-strong bg-cream px-3 py-2 text-sm transition-colors focus:outline-none focus:border-moss-deep";

  if (order.returnedOn) {
    return (
      <div className="border-t border-line pt-5">
        <p className="text-xs uppercase tracking-[0.1em] text-ink-soft mb-2">
          {t("ret.title")}
        </p>
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-sm">
            {t("ret.returnedOn", { date: order.returnedOn })}
          </span>
          <button
            type="button"
            onClick={() => {
              const { stockRemoved } = undoOrderReturn(clientId, order.id);
              setUndoNote(stockRemoved ? null : t("ret.undoKeptStock"));
              onChange();
            }}
            className="border border-line-strong px-3 py-1.5 text-xs uppercase tracking-[0.15em] text-ink-soft transition-colors hover:text-ink hover:border-ink"
          >
            {t("ret.undo")}
          </button>
        </div>
        {undoNote && <p className="text-xs text-accent mt-2">{undoNote}</p>}
      </div>
    );
  }

  // Nothing to take back before the client has the piece in hand.
  if (order.status !== "delivered" || order.reviewStatus !== "accepted") {
    return null;
  }

  return (
    <div className="border-t border-line pt-5">
      <p className="text-xs uppercase tracking-[0.1em] text-ink-soft mb-2">
        {t("ret.title")}
      </p>

      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="border border-accent text-accent px-4 py-2 text-xs uppercase tracking-[0.15em] transition-colors hover:bg-accent hover:text-cream"
        >
          {t("ret.mark")}
        </button>
      ) : (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-ink-soft">{t("ret.explain")}</p>

          <label className="flex items-start gap-2.5 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={toStock}
              onChange={(e) => setToStock(e.target.checked)}
              className="mt-0.5 h-4 w-4 accent-moss-deep"
            />
            <span>{t("ret.toStock")}</span>
          </label>

          {toStock && (
            <div className="flex items-end gap-3 flex-wrap pl-7">
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="ret-size"
                  className="text-xs uppercase tracking-[0.1em] text-ink-soft"
                >
                  {t("ready.size")}
                </label>
                <select
                  id="ret-size"
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  className={fieldCls}
                >
                  {READY_SIZES.map((s) => (
                    <option key={s} value={s}>
                      {sizeLabel(lang, s)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="ret-price"
                  className="text-xs uppercase tracking-[0.1em] text-ink-soft"
                >
                  {t("ready.price")}
                </label>
                <input
                  id="ret-price"
                  type="text"
                  inputMode="decimal"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className={`${fieldCls} w-28`}
                />
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => {
                returnOrder(clientId, order.id, { toStock, size, price });
                setOpen(false);
                onChange();
              }}
              className="bg-accent text-cream px-4 py-2 text-xs uppercase tracking-[0.15em] transition-colors hover:bg-accent/80"
            >
              {t("ret.confirm")}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="border border-line-strong px-4 py-2 text-xs uppercase tracking-[0.15em] text-ink-soft transition-colors hover:text-ink hover:border-ink"
            >
              {t("common.cancel")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
