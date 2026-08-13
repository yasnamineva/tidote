"use client";

import { useState } from "react";
import { MonthGrid } from "@/components/calendar/month-grid";
import { useBooking } from "@/lib/booking";
import { useAuth } from "@/lib/auth";
import { useLang } from "@/lib/i18n";
import type { Order } from "@/lib/mock-data";

export function ClientFittingPicker({ order }: { order: Order }) {
  const { availability, bookSlot } = useBooking();
  const { session } = useAuth();
  const { t } = useLang();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  function isSelectable(date: string) {
    const day = availability.find((d) => d.date === date);
    return Boolean(day?.open && day.slots.length > 0);
  }

  function dayClassName(date: string) {
    return isSelectable(date) ? "bg-moss-soft text-moss-deep" : "";
  }

  const selectedDay = selectedDate
    ? availability.find((d) => d.date === selectedDate)
    : null;

  function handleBook(time: string) {
    if (!session?.clientId || !selectedDate) return;
    bookSlot({
      date: selectedDate,
      time,
      clientId: session.clientId,
      clientName: session.name,
      orderId: order.id,
    });
  }

  return (
    <div className="border border-accent/30 bg-accent/5 px-4 py-4 mt-3">
      <p className="text-xs uppercase tracking-[0.15em] text-accent mb-3">
        {t("picker.readyBook")}
      </p>
      <div className="grid sm:grid-cols-2 gap-4">
        <MonthGrid
          onSelectDay={setSelectedDate}
          isSelectable={isSelectable}
          dayClassName={dayClassName}
          selectedDate={selectedDate}
        />
        <div>
          {selectedDay ? (
            <div className="flex flex-col gap-2">
              {selectedDay.slots.map((slot) => (
                <button
                  key={slot.id}
                  type="button"
                  onClick={() => handleBook(slot.time)}
                  className="border border-line bg-cream px-3 py-2 text-sm text-left hover:border-moss-deep transition-colors"
                >
                  {slot.time}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-ink-soft">{t("picker.pickDay")}</p>
          )}
        </div>
      </div>
    </div>
  );
}
