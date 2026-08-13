"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Reveal } from "@/components/reveal";
import { MeasurementDiagram } from "@/components/measurement-diagram";
import { InfoTip } from "@/components/info-tip";
import { DeliveryForm } from "@/components/delivery-form";
import { OrderPhotoThumb } from "@/components/order-photo-thumb";
import { JourneyStepper } from "@/components/journey-stepper";
import { ClientFittingPicker } from "@/components/calendar/client-fitting-picker";
import { MessageThread } from "@/components/messages/message-thread";
import { WardrobeSection } from "@/components/wardrobe-section";
import { useAuth } from "@/lib/auth";
import { useBooking } from "@/lib/booking";
import { useLang } from "@/lib/i18n";
import {
  categoryLabel,
  orderNoteText,
  pieceLabel,
  statusLabel,
} from "@/lib/translations";
import { useSectionSpy } from "@/lib/use-section-spy";
import { useLenis } from "@/lib/smooth-scroll";
import { ORDER_STATUS_SEQUENCE, type Measurements } from "@/lib/mock-data";
import { measurementField, type MeasurementKey } from "@/lib/measurements";

const MEASUREMENT_GROUPS: { titleKey: string; fields: MeasurementKey[] }[] = [
  { titleKey: "measure.group.torso", fields: ["height", "shoulders", "chest"] },
  {
    titleKey: "measure.group.legs",
    fields: ["waistNatural", "lowerWaist", "inseam", "ankle", "thigh"],
  },
  { titleKey: "measure.group.arms", fields: ["upperArm", "biceps", "wrist"] },
];

const STATUS_PILL: Record<string, string> = {
  received: "bg-line/50 text-ink-soft",
  in_production: "bg-accent-soft/40 text-accent",
  ready: "bg-accent-soft/40 text-accent",
  shipped: "bg-moss-soft text-moss-deep",
  delivered: "bg-moss-soft text-moss-deep",
};

function StatusPill({ status }: { status: string }) {
  const { lang } = useLang();
  return (
    <span
      className={`inline-block w-fit text-xs uppercase tracking-[0.15em] px-3 py-1 rounded-full mt-2 ${STATUS_PILL[status] ?? "bg-line/50 text-ink-soft"}`}
    >
      {statusLabel(lang, status)}
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

/** One anchor per journey step, in page order, so the stepper and the URL hash
 *  agree. "fitting" only exists while an order is ready to try on. */
const STEP_ANCHORS = ["measurements", "orders", "fitting", "delivery"] as const;
const SPY_IDS = [...STEP_ANCHORS, "wardrobe"];

export default function DashboardPage() {
  const {
    session,
    ready,
    orders,
    measurements,
    delivery,
    messages,
    items,
    updateMeasurements,
    sendMessage,
    addItem,
    removeItem,
    logout,
  } = useAuth();
  const { bookings } = useBooking();
  const lenis = useLenis();
  const { lang, t } = useLang();
  const router = useRouter();
  const [form, setForm] = useState<Measurements>(measurements);
  const [saved, setSaved] = useState(false);
  const [headerH, setHeaderH] = useState(0);
  const [barH, setBarH] = useState(0);
  const barRef = useRef<HTMLDivElement | null>(null);
  const [showMessages, setShowMessages] = useState(false);

  useEffect(() => {
    if (!showMessages) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setShowMessages(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showMessages]);

  useEffect(() => {
    if (ready && !session) router.replace("/login");
  }, [ready, session, router]);

  useEffect(() => {
    setForm(measurements);
  }, [measurements]);

  useEffect(() => {
    const header = document.querySelector("header");
    const update = () => {
      setHeaderH(header instanceof HTMLElement ? header.offsetHeight : 0);
      setBarH(barRef.current?.offsetHeight ?? 0);
    };
    update();
    const id = window.setTimeout(update, 400); // after fonts settle
    window.addEventListener("resize", update);
    return () => {
      window.clearTimeout(id);
      window.removeEventListener("resize", update);
    };
  }, []);

  const stickyOffset = headerH + barH + 12;
  const activeId = useSectionSpy(SPY_IDS, stickyOffset + 24);
  // Wardrobe sits between orders and delivery but has no step of its own, so it
  // keeps the stepper on "orders" rather than jumping ahead.
  const anchorStep: Record<string, number> = {
    measurements: 1,
    orders: 2,
    wardrobe: 2,
    fitting: 3,
    delivery: 4,
  };
  const activeStep = activeId ? anchorStep[activeId] ?? 1 : 1;

  function scrollToAnchor(id: string) {
    const el = document.getElementById(id);
    if (!el) return;
    if (lenis) {
      lenis.scrollTo(el, { offset: -stickyOffset, duration: 0.9 });
    } else {
      window.scrollTo({
        top: el.getBoundingClientRect().top + window.scrollY - stickyOffset,
        behavior: "smooth",
      });
    }
    // Deep-linkable without triggering the browser's own jump
    window.history.replaceState(null, "", `#${id}`);
  }

  function goToStep(step: number) {
    const wanted = STEP_ANCHORS[step - 1];
    // "Try on" only has a target while something is actually ready to try on
    scrollToAnchor(document.getElementById(wanted) ? wanted : "orders");
  }

  if (!ready || !session) {
    return (
      <>
        <SiteHeader />
        <main className="flex-1 flex items-center justify-center py-24">
          <p className="text-ink-soft text-sm uppercase tracking-[0.15em] animate-pulse">
            {t("common.loadingAccount")}
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

  const displayEta = (eta: string) =>
    eta === "To be confirmed" ? t("val.tbc") : eta;
  const displayTotal = (total: string) =>
    total === "Quote pending" ? t("val.quotePending") : total;
  const displayUpdated =
    measurements.updatedAt === "Not yet taken"
      ? t("measure.notTaken")
      : measurements.updatedAt;

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <section className="border-b border-line bg-paper">
          <div className="mx-auto max-w-5xl px-6 py-10 flex items-center justify-between animate-[fade-up_0.6s_cubic-bezier(0.16,1,0.3,1)_both]">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-moss-deep mb-2">
                {t("dash.myAccount")}
              </p>
              <h1 className="font-display text-3xl md:text-4xl">
                {t("dash.welcome", { name: session.name })}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowMessages(true)}
                aria-label={t("dash.messages.title")}
                title={t("dash.messages.title")}
                className="relative flex items-center justify-center w-10 h-10 border border-line bg-paper text-ink-soft hover:text-ink hover:border-line-strong transition-colors"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H8l-4 4V5a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2z" />
                </svg>
                {messages.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-moss text-cream text-[10px] leading-[18px] text-center tabular-nums">
                    {messages.length}
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  logout();
                  router.push("/");
                }}
                className="btn-sweep text-sm uppercase tracking-[0.15em] border border-ink px-4 py-2 transition-colors duration-300 hover:text-cream"
              >
                {t("dash.logout")}
              </button>
            </div>
          </div>
        </section>

        {/* Sticky progress stepper — stays under the header, lights up by scroll */}
        <div
          ref={barRef}
          className="sticky z-30 bg-cream/95 backdrop-blur border-b border-line"
          style={{ top: headerH }}
        >
          <div className="mx-auto max-w-5xl px-4 sm:px-6 py-3">
            <JourneyStepper
              compact
              activeStep={activeStep}
              onStepClick={goToStep}
            />
          </div>
        </div>

        <section className="mx-auto max-w-5xl px-6 py-14 flex flex-col gap-16">
          {/* 1. Measurements */}
          <div id="measurements" style={{ scrollMarginTop: stickyOffset }}>
            <Reveal>
              <h2 className="font-display text-2xl mb-2">
                {t("dash.measurements.title")}
              </h2>
              <p className="text-sm text-ink-soft mb-6">
                {t("dash.measurements.sub", { date: displayUpdated })}
              </p>

              <MeasurementDiagram className="mb-6" />

              <form
                onSubmit={handleSave}
                className="border border-line bg-paper px-6 py-6 flex flex-col gap-7"
              >
                {MEASUREMENT_GROUPS.map((group) => (
                  <div key={group.titleKey}>
                    <h3 className="text-xs uppercase tracking-[0.2em] text-moss-deep mb-3 pb-2 border-b border-line">
                      {t(group.titleKey)}
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {group.fields.map((key) => {
                        const field = measurementField(key);
                        return (
                        <div key={key} className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-1.5">
                            <label
                              htmlFor={key}
                              className="text-xs uppercase tracking-[0.1em] text-ink-soft"
                            >
                              {field.num}. {t(field.labelKey)}
                            </label>
                            <InfoTip
                              text={t(field.helpKey)}
                              label={t("measure.help.aria", {
                                label: t(field.labelKey),
                              })}
                            />
                          </div>
                          <div className="relative">
                            <input
                              id={key}
                              type="number"
                              inputMode="decimal"
                              value={form[key]}
                              onChange={(e) =>
                                setForm((f) => ({ ...f, [key]: e.target.value }))
                              }
                              className="w-full border border-line-strong bg-cream px-3 py-2 pr-9 text-sm transition-colors focus:outline-none focus:border-moss-deep"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] uppercase tracking-[0.1em] text-ink-soft pointer-events-none">
                              {t("unit.cm")}
                            </span>
                          </div>
                        </div>
                        );
                      })}
                    </div>
                  </div>
                ))}

                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="notes"
                    className="text-xs uppercase tracking-[0.1em] text-ink-soft"
                  >
                    {t("measure.fitNotes")}
                  </label>
                  <textarea
                    id="notes"
                    rows={3}
                    value={form.notes}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, notes: e.target.value }))
                    }
                    className="border border-line-strong bg-cream px-3 py-2 text-sm transition-colors focus:outline-none focus:border-moss-deep resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="bg-moss text-cream px-6 py-3 text-sm uppercase tracking-[0.15em] transition-all duration-300 hover:-translate-y-0.5 hover:bg-moss-deep"
                >
                  {t("measure.save")}
                </button>
                {saved && (
                  <p className="text-sm text-moss-deep animate-[fade-up_0.3s_ease-out_both]">
                    {t("measure.saved")}
                  </p>
                )}
              </form>
            </Reveal>
          </div>

          {/* 2. Orders */}
          <div id="orders" style={{ scrollMarginTop: stickyOffset }}>
            <Reveal delay={100}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-2xl">{t("dash.orders.title")}</h2>
                <Link
                  href="/dashboard/new-order"
                  className="btn-sweep text-xs uppercase tracking-[0.15em] border border-ink px-4 py-2 transition-colors duration-300 hover:text-cream"
                >
                  {t("dash.newOrder")}
                </Link>
              </div>
              {orders.length === 0 && (
                <p className="text-sm text-ink-soft border border-line bg-paper px-6 py-8 text-center">
                  {t("dash.noOrders")}
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
                            {pieceLabel(lang, order.piece)}
                          </h3>
                        </div>
                        <p className="font-display text-lg text-accent whitespace-nowrap">
                          {displayTotal(order.total)}
                        </p>
                      </div>

                      <div className="mt-3 flex items-center gap-3">
                        <OrderPhotoThumb
                          photos={order.photos}
                          label={pieceLabel(lang, order.piece)}
                        />
                        <span className="text-[10px] uppercase tracking-[0.15em] px-2.5 py-1 rounded-full bg-line/50 text-ink-soft whitespace-nowrap">
                          {categoryLabel(lang, order.category)}
                        </span>
                      </div>

                      <p className="text-sm text-ink-soft mt-3">
                        {t(
                          order.status === "delivered"
                            ? "order.metaDelivered"
                            : "order.metaReady",
                          { placed: order.placedOn, eta: displayEta(order.eta) }
                        )}
                      </p>
                      {orderNoteText(lang, order.id, order.notes) && (
                        <p className="text-sm text-ink-soft mt-1 italic">
                          {orderNoteText(lang, order.id, order.notes)}
                        </p>
                      )}

                      {order.reviewStatus === "pending" && (
                        <div className="border border-accent/30 bg-accent/5 px-4 py-3 mt-4 text-sm text-accent">
                          {t("order.pendingNotice")}
                        </div>
                      )}

                      {order.reviewStatus === "denied" && (
                        <span className="inline-block w-fit text-xs uppercase tracking-[0.15em] px-3 py-1 rounded-full mt-4 bg-line/50 text-ink-soft">
                          {t("order.declined")}
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
                                  {t("order.fittingBooked", {
                                    date: orderBooking.date,
                                    time: orderBooking.time,
                                  })}
                                </div>
                              );
                            }
                            if (order.status === "ready") {
                              return (
                                <div
                                  id="fitting"
                                  style={{ scrollMarginTop: stickyOffset }}
                                >
                                  <ClientFittingPicker order={order} />
                                </div>
                              );
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
                          {t("order.detailsPhotos")}
                        </Link>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            </Reveal>
          </div>

          {/* My Wardrobe */}
          <div id="wardrobe" style={{ scrollMarginTop: stickyOffset }}>
            <Reveal delay={100}>
              <h2 className="font-display text-2xl mb-2">
                {t("wardrobe.title")}
              </h2>
              <p className="text-sm text-ink-soft mb-6">{t("wardrobe.sub")}</p>
              <WardrobeSection
                items={items}
                editable
                onAdd={addItem}
                onRemove={removeItem}
              />
            </Reveal>
          </div>

          {/* Delivery Info */}
          <div id="delivery" style={{ scrollMarginTop: stickyOffset }}>
            <Reveal delay={100}>
              <h2 className="font-display text-2xl mb-2">
                {t("dash.delivery.title")}
              </h2>
              <p className="text-sm text-ink-soft mb-6">
                {delivery.updatedAt
                  ? t("dash.delivery.updated", { date: delivery.updatedAt })
                  : t("dash.delivery.none")}{" "}
                {t("dash.delivery.use")}
              </p>
              <DeliveryForm />
            </Reveal>
          </div>

        </section>
      </main>

      {showMessages && (
        <div
          className="fixed inset-0 z-[60] bg-ink/50 flex items-center justify-center p-4 sm:p-6"
          onClick={() => setShowMessages(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="dash-messages-title"
        >
          <div
            className="w-full max-w-2xl max-h-[85vh] flex flex-col bg-cream border border-line shadow-[0_20px_50px_-20px_rgba(34,30,25,0.5)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-line flex items-start justify-between gap-4">
              <div>
                <h2 id="dash-messages-title" className="font-display text-xl">
                  {t("dash.messages.title")}
                </h2>
                <p className="text-sm text-ink-soft mt-1">
                  {t("dash.messages.sub")}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowMessages(false)}
                aria-label={t("common.close")}
                className="text-xl leading-none text-ink-soft hover:text-ink transition-colors px-2"
              >
                ×
              </button>
            </div>
            <div className="px-6 py-5 overflow-y-auto">
              <MessageThread
                messages={messages}
                viewerSender="client"
                onSend={sendMessage}
                placeholder={t("dash.messages.placeholder")}
              />
            </div>
          </div>
        </div>
      )}

      <SiteFooter />
    </>
  );
}
