"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Reveal } from "@/components/reveal";
import { MeasurementDiagram } from "@/components/measurement-diagram";
import { DeliveryForm } from "@/components/delivery-form";
import { OrderPhotoThumb } from "@/components/order-photo-thumb";
import { JourneyStepper } from "@/components/journey-stepper";
import { ClientFittingPicker } from "@/components/calendar/client-fitting-picker";
import { MessageThread } from "@/components/messages/message-thread";
import { useAuth } from "@/lib/auth";
import { useBooking } from "@/lib/booking";
import {
  ORDER_STATUS_LABEL,
  ORDER_STATUS_SEQUENCE,
  type Measurements,
} from "@/lib/mock-data";

const MEASUREMENT_FIELDS: { key: keyof Omit<Measurements, "notes" | "updatedAt">; label: string }[] = [
  { key: "height", label: "Height (cm)" },
  { key: "chest", label: "Chest (cm)" },
  { key: "waist", label: "Waist (cm)" },
  { key: "hips", label: "Hips (cm)" },
  { key: "shoulder", label: "Shoulder (cm)" },
  { key: "sleeve", label: "Sleeve (cm)" },
  { key: "inseam", label: "Inseam (cm)" },
];

const STATUS_PILL: Record<string, string> = {
  received: "bg-line/50 text-ink-soft",
  in_production: "bg-accent-soft/40 text-accent",
  ready: "bg-accent-soft/40 text-accent",
  shipped: "bg-moss-soft text-moss-deep",
  delivered: "bg-moss-soft text-moss-deep",
};

function StatusPill({ status }: { status: string }) {
  return (
    <span
      className={`inline-block w-fit text-xs uppercase tracking-[0.15em] px-3 py-1 rounded-full mt-2 ${STATUS_PILL[status] ?? "bg-line/50 text-ink-soft"}`}
    >
      {ORDER_STATUS_LABEL[status as keyof typeof ORDER_STATUS_LABEL]}
    </span>
  );
}

function OrderTimeline({ status }: { status: string }) {
  const currentIndex = ORDER_STATUS_SEQUENCE.indexOf(status as never);
  return (
    <div className="flex items-center gap-1 mt-4">
      {ORDER_STATUS_SEQUENCE.map((s, i) => {
        const done = i < currentIndex;
        const current = i === currentIndex;
        return (
          <div key={s} className="flex items-center flex-1 last:flex-none">
            <div className="relative flex items-center justify-center">
              {current && (
                <span className="absolute h-4 w-4 rounded-full bg-accent/40 animate-ping" />
              )}
              <div
                className={`relative h-2.5 w-2.5 rounded-full shrink-0 transition-colors duration-500 ${
                  current ? "bg-accent" : done ? "bg-moss-deep" : "bg-line"
                }`}
              />
            </div>
            {i < ORDER_STATUS_SEQUENCE.length - 1 && (
              <div
                className={`h-px flex-1 transition-colors duration-500 ${
                  i < currentIndex ? "bg-moss-deep" : "bg-line"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function DashboardPage() {
  const {
    session,
    ready,
    orders,
    measurements,
    delivery,
    messages,
    updateMeasurements,
    sendMessage,
    logout,
  } = useAuth();
  const { bookings } = useBooking();
  const router = useRouter();
  const [form, setForm] = useState<Measurements>(measurements);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (ready && !session) router.replace("/login");
  }, [ready, session, router]);

  useEffect(() => {
    setForm(measurements);
  }, [measurements]);

  if (!ready || !session) {
    return (
      <>
        <SiteHeader />
        <main className="flex-1 flex items-center justify-center py-24">
          <p className="text-ink-soft text-sm uppercase tracking-[0.15em] animate-pulse">
            Loading account&hellip;
          </p>
        </main>
        <SiteFooter />
      </>
    );
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    updateMeasurements({
      ...form,
      updatedAt: new Date().toISOString().slice(0, 10),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  function computeActiveStep(): number | undefined {
    const hasMeasurements = Boolean(
      measurements.updatedAt && measurements.updatedAt !== "Not yet taken"
    );
    if (!hasMeasurements) return 1;
    if (orders.length === 0) return 2;
    const readyUnbooked = orders.some(
      (o) => o.status === "ready" && !bookings.some((b) => b.orderId === o.id)
    );
    if (readyUnbooked) return 3;
    if (!delivery.updatedAt) return 4;
    return 5;
  }
  const activeStep = computeActiveStep();

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <section className="border-b border-line bg-paper">
          <div className="mx-auto max-w-7xl px-6 py-10 flex items-center justify-between animate-[fade-up_0.6s_cubic-bezier(0.16,1,0.3,1)_both]">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-moss-deep mb-2">
                My Account
              </p>
              <h1 className="font-display text-3xl md:text-4xl">
                Welcome back, {session.name}
              </h1>
            </div>
            <button
              type="button"
              onClick={() => {
                logout();
                router.push("/");
              }}
              className="btn-sweep text-sm uppercase tracking-[0.15em] border border-ink px-4 py-2 transition-colors duration-300 hover:text-cream"
            >
              Log Out
            </button>
          </div>
        </section>

        <section className="border-b border-line bg-cream">
          <div className="mx-auto max-w-7xl px-6 py-10">
            <Reveal>
              <JourneyStepper activeStep={activeStep} />
            </Reveal>
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-6 py-14 flex flex-col gap-16">
          {/* 1. Measurements */}
          <Reveal>
            <h2 className="font-display text-2xl mb-2">1. Your Measurements</h2>
            <p className="text-sm text-ink-soft mb-6">
              Last updated {measurements.updatedAt}. Keep these current so
              every made-to-measure piece fits right.
            </p>

            <MeasurementDiagram className="mb-4" />

            <form
              onSubmit={handleSave}
              className="border border-line bg-paper px-6 py-6 flex flex-col gap-4"
            >
              <div className="grid grid-cols-2 gap-4">
                {MEASUREMENT_FIELDS.map((field) => (
                  <div key={field.key} className="flex flex-col gap-1.5">
                    <label
                      htmlFor={field.key}
                      className="text-xs uppercase tracking-[0.1em] text-ink-soft"
                    >
                      {field.label}
                    </label>
                    <input
                      id={field.key}
                      type="number"
                      inputMode="decimal"
                      value={form[field.key]}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, [field.key]: e.target.value }))
                      }
                      className="border border-line bg-cream px-3 py-2 text-sm transition-colors focus:outline-none focus:border-moss-deep"
                    />
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="notes"
                  className="text-xs uppercase tracking-[0.1em] text-ink-soft"
                >
                  Fit Notes
                </label>
                <textarea
                  id="notes"
                  rows={3}
                  value={form.notes}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, notes: e.target.value }))
                  }
                  className="border border-line bg-cream px-3 py-2 text-sm transition-colors focus:outline-none focus:border-moss-deep resize-none"
                />
              </div>

              <button
                type="submit"
                className="mt-2 bg-moss text-cream px-6 py-3 text-sm uppercase tracking-[0.15em] transition-all duration-300 hover:-translate-y-0.5 hover:bg-moss-deep"
              >
                Save Measurements
              </button>
              {saved && (
                <p className="text-sm text-moss-deep animate-[fade-up_0.3s_ease-out_both]">
                  Measurements updated &mdash; thank you!
                </p>
              )}
            </form>
          </Reveal>

          {/* 2. Orders */}
          <Reveal delay={100}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-2xl">2. Your Orders</h2>
              <Link
                href="/dashboard/new-order"
                className="btn-sweep text-xs uppercase tracking-[0.15em] border border-ink px-4 py-2 transition-colors duration-300 hover:text-cream"
              >
                + New Order
              </Link>
            </div>
            {orders.length === 0 && (
              <p className="text-sm text-ink-soft border border-line bg-paper px-6 py-8 text-center">
                No orders yet — place your first commission whenever you're ready.
              </p>
            )}
            <div className="flex flex-col gap-4">
              {orders.map((order, i) => (
                <Reveal key={order.id} delay={i * 100}>
                  <div className="group border border-line bg-paper px-6 py-5 transition-all duration-300 hover:border-moss-deep hover:shadow-[0_8px_24px_-12px_rgba(74,82,56,0.35)]">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.15em] text-ink-soft">
                          {order.id}
                        </p>
                        <h3 className="font-display text-xl mt-1">
                          {order.piece}
                        </h3>
                      </div>
                      <p className="font-display text-lg text-accent whitespace-nowrap">
                        {order.total}
                      </p>
                    </div>

                    <div className="mt-3">
                      <OrderPhotoThumb
                        photos={order.photos}
                        category={order.category}
                        label={order.piece}
                      />
                    </div>

                    <p className="text-sm text-ink-soft mt-3">
                      Placed {order.placedOn} &middot; Est.{" "}
                      {order.status === "delivered" ? "delivered" : "ready"}{" "}
                      {order.eta}
                    </p>
                    {order.notes && (
                      <p className="text-sm text-ink-soft mt-1 italic">
                        {order.notes}
                      </p>
                    )}

                    {order.reviewStatus === "pending" && (
                      <div className="border border-accent/30 bg-accent/5 px-4 py-3 mt-4 text-sm text-accent">
                        We&rsquo;re reviewing your request and will confirm
                        pricing shortly.
                      </div>
                    )}

                    {order.reviewStatus === "denied" && (
                      <span className="inline-block w-fit text-xs uppercase tracking-[0.15em] px-3 py-1 rounded-full mt-4 bg-line/50 text-ink-soft">
                        Declined
                      </span>
                    )}

                    {order.reviewStatus === "accepted" && (
                      <>
                        <OrderTimeline status={order.status} />
                        <StatusPill status={order.status} />

                        {(() => {
                          const orderBooking = bookings.find(
                            (b) => b.orderId === order.id
                          );
                          if (orderBooking) {
                            return (
                              <div className="border border-moss-deep/40 bg-moss-soft px-4 py-3 text-sm text-moss-deep mt-3">
                                Fitting booked for {orderBooking.date} at{" "}
                                {orderBooking.time}.
                              </div>
                            );
                          }
                          if (order.status === "ready") {
                            return <ClientFittingPicker order={order} />;
                          }
                          return null;
                        })()}
                      </>
                    )}

                    <div className="mt-4 pt-4 border-t border-line">
                      <Link
                        href={`/dashboard/orders/${order.id}`}
                        className="link-underline text-xs uppercase tracking-[0.15em] text-moss-deep hover:text-accent transition-colors"
                      >
                        Details &amp; photos &rarr;
                      </Link>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </Reveal>

          {/* Delivery Info */}
          <Reveal delay={100}>
            <h2 className="font-display text-2xl mb-2">Delivery Info</h2>
            <p className="text-sm text-ink-soft mb-6">
              {delivery.updatedAt
                ? `Last updated ${delivery.updatedAt}.`
                : "Not yet provided."}{" "}
              We&rsquo;ll use this once a piece is ready to ship.
            </p>
            <DeliveryForm />
          </Reveal>

          {/* Messages */}
          <Reveal delay={100}>
            <h2 className="font-display text-2xl mb-2">Message the Studio</h2>
            <p className="text-sm text-ink-soft mb-6">
              Questions about fabric, fit, or timing? Send us a message
              anytime.
            </p>
            <MessageThread
              messages={messages}
              viewerSender="client"
              onSend={sendMessage}
              placeholder="Ask about your order, fabric, timing…"
            />
          </Reveal>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
