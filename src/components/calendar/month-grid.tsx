"use client";

import { useState } from "react";

const WEEKDAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function toDateKey(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function MonthGrid({
  onSelectDay,
  renderDay,
  isSelectable,
  dayClassName,
  selectedDate,
}: {
  onSelectDay?: (date: string) => void;
  renderDay?: (date: string) => React.ReactNode;
  isSelectable?: (date: string) => boolean;
  dayClassName?: (date: string) => string;
  selectedDate?: string | null;
}) {
  const today = new Date();
  const [cursor, setCursor] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startOffset = firstDay.getDay();
  const todayKey = toDateKey(today.getFullYear(), today.getMonth(), today.getDate());

  const cells: (string | null)[] = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(toDateKey(year, month, d));

  const monthLabel = cursor.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={() => setCursor(new Date(year, month - 1, 1))}
          className="text-sm text-ink-soft hover:text-ink transition-colors px-2 py-1"
          aria-label="Previous month"
        >
          &larr;
        </button>
        <p className="text-xs uppercase tracking-[0.15em]">{monthLabel}</p>
        <button
          type="button"
          onClick={() => setCursor(new Date(year, month + 1, 1))}
          className="text-sm text-ink-soft hover:text-ink transition-colors px-2 py-1"
          aria-label="Next month"
        >
          &rarr;
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-[9px] uppercase tracking-[0.1em] text-ink-soft mb-2">
        {WEEKDAY_LABELS.map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((key, i) => {
          if (!key) return <div key={`empty-${i}`} />;
          const day = Number(key.slice(-2));
          const selectable = isSelectable ? isSelectable(key) : true;
          const isToday = key === todayKey;
          const isSelected = key === selectedDate;
          return (
            <button
              key={key}
              type="button"
              disabled={!selectable}
              onClick={() => onSelectDay?.(key)}
              className={`aspect-square flex flex-col items-center justify-center text-[11px] rounded-sm border transition-colors ${
                selectable
                  ? "cursor-pointer hover:border-moss-deep"
                  : "cursor-default opacity-40 border-transparent"
              } ${isToday ? "ring-1 ring-ink" : ""} ${
                isSelected ? "border-ink" : selectable ? "border-transparent" : ""
              } ${dayClassName?.(key) ?? ""}`}
            >
              <span>{day}</span>
              {renderDay?.(key)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
