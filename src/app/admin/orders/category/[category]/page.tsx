"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { AdminTopBar, useOrderFilter } from "@/components/admin/admin-shell";
import { PendingOrdersList } from "@/components/admin/pending-orders-list";
import { useLang } from "@/lib/i18n";
import { categoryLabel } from "@/lib/translations";
import { getAllClientsWithLiveData } from "@/lib/admin-data";
import {
  ORDER_CATEGORIES,
  type Client,
  type OrderCategory,
} from "@/lib/mock-data";

export default function AdminCategoryOrdersPage() {
  const { lang, t } = useLang();
  const params = useParams<{ category: string }>();
  const [clients, setClients] = useState<Client[]>([]);
  const { filterCategory, setFilterCategory } = useOrderFilter();

  const raw = decodeURIComponent(params.category);
  const isAll = raw === "all";
  const category = (ORDER_CATEGORIES as string[]).includes(raw)
    ? (raw as OrderCategory)
    : undefined;

  function refresh() {
    setClients(getAllClientsWithLiveData());
  }

  useEffect(() => {
    refresh();
  }, []);

  // Leave the sidebar highlight behind when navigating away from All Orders.
  useEffect(() => () => setFilterCategory(null), [setFilterCategory]);

  const allOrders = clients.flatMap((c) => c.orders);
  // On the All page the dropdown decides what we are actually looking at.
  const shown = isAll ? filterCategory : category;
  const count = shown
    ? allOrders.filter((o) => o.category === shown).length
    : allOrders.length;

  return (
    <>
      <AdminTopBar
        title={
          shown
            ? categoryLabel(lang, shown)
            : isAll
              ? t("admin.allOrdersTitle")
              : raw
        }
      />
      <p className="text-sm text-ink-soft mb-6">
        {t(shown ? "admin.ordersInCategory" : "admin.ordersTotal", { n: count })}
      </p>
      {(isAll || category) && (
        <PendingOrdersList
          clients={clients}
          onChange={refresh}
          fixedCategory={category}
          filterable={isAll}
          onCategoryChange={(next) =>
            setFilterCategory(next === "all" ? null : next)
          }
        />
      )}
    </>
  );
}
