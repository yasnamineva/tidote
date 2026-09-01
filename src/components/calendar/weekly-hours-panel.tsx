"use client";

import { useBooking } from "@/lib/booking";
import { useLang } from "@/lib/i18n";
import {
  DEFAULT_WEEKLY_HOURS,
  SLOT_LENGTHS,
  WEEK_ORDER,
  buildSlotTimes,
  toMinutes,
  type DayHours,
  type Weekday,
} from "@/lib/hours";

// 7 Jan 2024 was a Sunday, so adding the weekday index lands on that weekday.
// Cheaper than a second set of translation keys, and it follows the locale.
function weekdayName(weekday: Weekday, lang: string) {
  return new Intl.DateTimeFormat(lang === "bg" ? "bg-BG" : "en-GB", {
    weekday: "long",
  }).format(new Date(2024, 0, 7 + weekday));
}

export function WeeklyHoursPanel() {
  const { weeklyHours, saveWeeklyHours } = useBooking();
  const { t, lang } = useLang();

  function updateDay(weekday: Weekday, patch: Partial<DayHours>) {
    saveWeeklyHours({
      ...weeklyHours,
      days: weeklyHours.days.map((d, i) =>
        i === weekday ? { ...d, ...patch } : d
      ),
    });
  }

  const isDefault =
    weeklyHours.slotMinutes === DEFAULT_WEEKLY_HOURS.slotMinutes &&
    weeklyHours.days.every(
      (d, i) =>
        d.open === DEFAULT_WEEKLY_HOURS.days[i].open &&
        d.from === DEFAULT_WEEKLY_HOURS.days[i].from &&
        d.to === DEFAULT_WEEKLY_HOURS.days[i].to
    );

  const timeCls =
    "border border-line-strong bg-cream px-2 py-1.5 text-sm tabular-nums transition-colors focus:outline-none focus:border-moss-deep disabled:opacity-40";

  return (
    <div className="border border-line bg-paper px-6 py-6">
      <div className="flex items-start justify-between gap-4 flex-wrap mb-1">
        <h2 className="font-display text-xl">{t("hours.title")}</h2>
        <button
          type="button"
          onClick={() => saveWeeklyHours(DEFAULT_WEEKLY_HOURS)}
          disabled={isDefault}
          className="text-xs uppercase tracking-[0.15em] text-ink-soft hover:text-ink transition-colors disabled:opacity-40 disabled:hover:text-ink-soft"
        >
          {t("hours.restore")}
        </button>
      </div>
      <p className="text-xs text-ink-soft mb-5 max-w-md">{t("hours.sub")}</p>

      <ul className="flex flex-col divide-y divide-line/60 border-y border-line/60">
        {WEEK_ORDER.map((weekday) => {
          const day = weeklyHours.days[weekday];
          const times = day.open
            ? buildSlotTimes(day, weeklyHours.slotMinutes)
            : [];
          const invalid =
            day.open && toMinutes(day.from) + weeklyHours.slotMinutes > toMinutes(day.to);
          return (
            <li
              key={weekday}
              className="grid grid-cols-[1fr_auto] sm:grid-cols-[1.1fr_auto_auto] items-center gap-x-3 gap-y-1.5 py-3"
            >
              <label className="flex items-center gap-2.5 min-w-0 cursor-pointer">
                <input
                  type="checkbox"
                  checked={day.open}
                  onChange={(e) => updateDay(weekday, { open: e.target.checked })}
                  className="h-4 w-4 accent-[var(--moss-deep)] shrink-0"
                />
                <span
                  className={`text-sm capitalize truncate ${
                    day.open ? "" : "text-ink-soft"
                  }`}
                >
                  {weekdayName(weekday, lang)}
                </span>
              </label>

              <div className="flex items-center gap-1.5 justify-self-end">
                <input
                  type="time"
                  aria-label={`${weekdayName(weekday, lang)} — ${t("hours.from")}`}
                  value={day.from}
                  disabled={!day.open}
                  onChange={(e) =>
                    e.target.value && updateDay(weekday, { from: e.target.value })
                  }
                  className={timeCls}
                />
                <span className="text-ink-soft text-xs">–</span>
                <input
                  type="time"
                  aria-label={`${weekdayName(weekday, lang)} — ${t("hours.to")}`}
                  value={day.to}
                  disabled={!day.open}
                  onChange={(e) =>
                    e.target.value && updateDay(weekday, { to: e.target.value })
                  }
                  className={timeCls}
                />
              </div>

              <span className="col-span-2 sm:col-span-1 text-xs text-ink-soft sm:text-right sm:min-w-[7.5rem] tabular-nums">
                {!day.open
                  ? t("hours.closed")
                  : invalid
                    ? t("hours.tooShort")
                    : t("hours.slotCount", { n: times.length })}
              </span>
            </li>
          );
        })}
      </ul>

      <div className="flex items-center gap-3 mt-5">
        <label
          htmlFor="slot-length"
          className="text-xs uppercase tracking-[0.1em] text-ink-soft"
        >
          {t("hours.slotLength")}
        </label>
        <select
          id="slot-length"
          value={weeklyHours.slotMinutes}
          onChange={(e) =>
            saveWeeklyHours({
              ...weeklyHours,
              slotMinutes: Number(e.target.value),
            })
          }
          className="border border-line-strong bg-cream px-3 py-1.5 text-sm transition-colors focus:outline-none focus:border-moss-deep"
        >
          {SLOT_LENGTHS.map((n) => (
            <option key={n} value={n}>
              {t("hours.minutes", { n })}
            </option>
          ))}
        </select>
      </div>

      <p className="text-xs text-ink-soft mt-4">{t("hours.overrideNote")}</p>
    </div>
  );
}
