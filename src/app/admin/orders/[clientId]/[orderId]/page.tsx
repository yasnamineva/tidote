"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Reveal } from "@/components/reveal";
import { OrderDetail } from "@/components/order-detail";
import { useBooking } from "@/lib/booking";
import { useLang } from "@/lib/i18n";
import { appendOrderNote, getClientWithLiveData } from "@/lib/admin-data";
import type { Client } from "@/lib/mock-data";

export default function AdminOrderPage() {
  const { bookings } = useBooking();
  const { t } = useLang();
  const params = useParams<{ clientId: string; orderId: string }>();
  const [client, setClient] = useState<Client | null | undefined>(undefined);

  useEffect(() => {
    setClient(getClientWithLiveData(params.clientId) ?? null);
  }, [params.clientId]);

  function refresh() {
    setClient(getClientWithLiveData(params.clientId) ?? null);
  }

  if (client === undefined) {
    return (
      <p className="text-ink-soft text-sm uppercase tracking-[0.15em] animate-pulse">
        {t("common.loading")}
      </p>
    );
  }

  const order = client?.orders.find((o) => o.id === params.orderId);
  const booking = bookings.find((b) => b.orderId === params.orderId);

  return (
    <div className="max-w-6xl">
      <Link
        href={client ? `/admin/clients/${client.id}` : "/admin"}
        className="link-underline text-sm text-ink-soft hover:text-ink"
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
              refresh();
            }}
            onChange={refresh}
          />
        </Reveal>
      ) : (
        <p className="text-ink-soft mt-8">{t("od.notFound")}</p>
      )}
    </div>
  );
}
