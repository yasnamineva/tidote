"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Reveal } from "@/components/reveal";
import { OrderDetail } from "@/components/order-detail";
import { useAuth } from "@/lib/auth";
import { useBooking } from "@/lib/booking";
import { useLang } from "@/lib/i18n";

export default function ClientOrderPage() {
  const { session, ready, orders, addOrderNote } = useAuth();
  const { bookings } = useBooking();
  const { t } = useLang();
  const router = useRouter();
  const params = useParams<{ orderId: string }>();

  useEffect(() => {
    if (ready && (!session || session.role !== "client")) {
      router.replace("/login");
    }
  }, [ready, session, router]);

  if (!ready || !session || session.role !== "client") {
    return (
      <>
        <SiteHeader />
        <main className="flex-1 flex items-center justify-center py-24">
          <p className="text-ink-soft text-sm uppercase tracking-[0.15em] animate-pulse">
            {t("common.loading")}
          </p>
        </main>
        <SiteFooter />
      </>
    );
  }

  const order = orders.find((o) => o.id === params.orderId);
  const booking = bookings.find((b) => b.orderId === params.orderId);

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <section className="mx-auto max-w-5xl px-6 py-12">
          <Link
            href="/dashboard"
            className="link-underline text-sm text-ink-soft hover:text-ink"
          >
            {t("od.backToAccount")}
          </Link>
          {order ? (
            <Reveal className="mt-8">
              <OrderDetail
                order={order}
                clientId={session.clientId!}
                clientName={session.name}
                role="client"
                booking={booking}
                onAddNote={(text, photos) =>
                  addOrderNote(order.id, text, photos)
                }
                onChange={() => {}}
              />
            </Reveal>
          ) : (
            <p className="text-ink-soft mt-8">{t("od.notFound")}</p>
          )}
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
