"use client";

import { useState } from "react";
import { MonthGrid } from "@/components/calendar/month-grid";
import { useBooking } from "@/lib/booking";
import { useLang } from "@/lib/i18n";
import { getAllClientsWithLiveData } from "@/lib/admin-data";

export function AdminAvailabilityPanel() {
  const {
    bookings,
    resolveDay,
    isCustomDay,
    toggleDayOpen,
    addSlot,
    removeSlot,
    resetDay,
  } = useBooking();
  const { t } = useLang();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [newTime, setNewTime] = useState("16:00");

  const clients = getAllClientsWithLiveData();
  const etaDates = new Set(clients.flatMap((c) => c.orders.map((o) => o.eta)));
  const bookingDates = new Set(bookings.map((b) => b.date));

  function dayClassName(date: string) {
    const day = resolveDay(date);
    if (!day.open) return "bg-line/30 text-ink-soft";
    // A day the studio edited by hand reads darker than one merely following
    // the weekly pattern, so exceptions are findable at a glance.
    return isCustomDay(date)
      ? "bg-moss-soft text-moss-deep ring-1 ring-moss-deep/50"
      : "bg-moss-soft/60 text-moss-deep";
  }

  function renderDay(date: string) {
    if (!etaDates.has(date) && !bookingDates.has(date)) return null;
    return (
      <span className="flex gap-0.5 mt-0.5">
        {etaDates.has(date) && <span className="h-1 w-1 rounded-full bg-accent" />}
        {bookingDates.has(date) && <span className="h-1 w-1 rounded-full bg-ink" />}
      </span>
    );
  }

  const selectedDay = selectedDate ? resolveDay(selectedDate) : null;
  const selectedIsCustom = selectedDate ? isCustomDay(selectedDate) : false;
  const selectedBookings = selectedDate
    ? bookings
        .filter((b) => b.date === selectedDate)
        .sort((a, b) => a.time.localeCompare(b.time))
    : [];

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <div className="border border-line bg-paper px-6 py-6">
        <MonthGrid
          onSelectDay={setSelectedDate}
          dayClassName={dayClassName}
          renderDay={renderDay}
          selectedDate={selectedDate}
        />
        <div className="flex flex-wrap items-center gap-4 mt-4 text-[10px] uppercase tracking-[0.1em] text-ink-soft">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-moss-soft/60 border border-moss-deep/40" />
            {t("cal.legend.open")}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-moss-soft border border-moss-deep" />
            {t("cal.legend.custom")}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            {t("cal.legend.orderDue")}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-ink" />
            {t("cal.legend.booked")}
          </span>
        </div>
      </div>

      <div className="border border-line bg-paper px-6 py-6">
        {selectedDate && selectedDay ? (
          <>
            <div className="flex items-center justify-between gap-3 mb-1">
              <h3 className="font-display text-xl">{selectedDate}</h3>
              <button
                type="button"
                onClick={() => toggleDayOpen(selectedDate)}
                className="btn-sweep text-xs uppercase tracking-[0.15em] border border-ink px-3 py-1.5 transition-colors duration-300 hover:text-cream"
              >
                {selectedDay.open ? t("cal.closeDay") : t("cal.openDay")}
              </button>
            </div>

            <div className="flex items-center gap-3 mb-4 min-h-[1.5rem]">
              <p className="text-xs text-ink-soft">
                {selectedIsCustom ? t("cal.customDay") : t("cal.followingWeekly")}
              </p>
              {selectedIsCustom && (
                <button
                  type="button"
                  onClick={() => resetDay(selectedDate)}
                  className="text-xs text-moss-deep hover:underline"
                >
                  {t("cal.useWeekly")}
                </button>
              )}
            </div>

            {selectedDay.open && (
              <>
                <div className="flex items-center gap-2 mb-4">
                  <input
                    type="time"
                    aria-label={t("cal.addSlot")}
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="border border-line bg-cream px-3 py-2 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => newTime && addSlot(selectedDate, newTime)}
                    className="bg-moss text-cream px-4 py-2 text-xs uppercase tracking-[0.15em] hover:bg-moss-deep transition-colors"
                  >
                    {t("cal.addSlot")}
                  </button>
                </div>
                <ul className="flex flex-col gap-2">
                  {selectedDay.slots.length === 0 && (
                    <li className="text-sm text-ink-soft">{t("cal.noSlots")}</li>
                  )}
                  {selectedDay.slots.map((slot) => (
                    <li
                      key={slot.id}
                      className="flex items-center justify-between border border-line px-3 py-2 text-sm"
                    >
                      <span className="tabular-nums">{slot.time}</span>
                      <button
                        type="button"
                        onClick={() => removeSlot(selectedDate, slot.id)}
                        className="text-xs text-accent hover:underline"
                      >
                        {t("cal.remove")}
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}

            {selectedBookings.length > 0 && (
              <div className="mt-6">
                <h4 className="text-xs uppercase tracking-[0.1em] text-ink-soft mb-2">
                  {t("cal.bookedFittings")}
                </h4>
                <ul className="flex flex-col gap-2">
                  {selectedBookings.map((b) => (
                    <li
                      key={b.id}
                      className="text-sm border border-moss-deep/30 bg-moss-soft px-3 py-2"
                    >
                      <span className="tabular-nums">{b.time}</span> &mdash;{" "}
                      {b.clientName} ({b.orderId})
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        ) : (
          <p className="text-sm text-ink-soft">{t("cal.selectDate")}</p>
        )}
      </div>
    </div>
  );
}
