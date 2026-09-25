"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback } from "react";
import { Reveal } from "@/components/reveal";
import { OrderDetail } from "@/components/order-detail";
import { useBooking } from "@/lib/booking";
import { LoadFailed, Loading } from "@/components/data-state";
import { useLang } from "@/lib/i18n";
import { useAsync } from "@/lib/use-async";
import { appendOrderNote, getClientWithLiveData } from "@/lib/admin-data";
import type { Client } from "@/lib/mock-data";

export default function AdminOrderPage() {
  const { bookings } = useBooking();
  const { t } = useLang();
  const params = useParams<{ clientId: string; orderId: string }>();
  const load = useCallback(
    async () => (await getClientWithLiveData(params.clientId)) ?? null,
    [params.clientId]
  );
  const { state, reload } = useAsync<Client | null>(load, params.clientId);

  // "We could not reach the database" must not read as "this order is gone".
  if (state.status === "loading") return <Loading />;
  if (state.status === "error") return <LoadFailed onRetry={reload} />;
  const client = state.data;

  const order = client?.orders.find((o) => o.id === params.orderId);
  const booking = bookings.find((b) => b.orderId === params.orderId);

  return (
    <div className="max-w-6xl">
      <Link
        href={client ? `/admin/clients/${client.id}` : "/admin"}
        className="link-underline inline-block py-2 text-sm text-ink-soft hover:text-ink"
      >
        {t("od.backToClient")}
      </Link>
      {client && order ? (
        <Reveal className="mt-8">
          <OrderDetail
            order={order}
            clientId={client.id}
            clientName={client.name}
            role="admin"
            booking={booking}
            onAddNote={(text, photos) => {
              appendOrderNote(client.id, order.id, "studio", text, photos);
              reload();
            }}
            onChange={reload}
          />
        </Reveal>
      ) : (
        <p className="text-ink-soft mt-8">{t("od.notFound")}</p>
      )}
    </div>
  );
}
