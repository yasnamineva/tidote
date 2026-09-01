"use client";

/** Shared surfaces for the analytics tabs, so every tab frames data the same way. */

export function StatTile({
  label,
  value,
  tone = "normal",
}: {
  label: string;
  value: string;
  /** "warn" flags a number the studio should act on, not just read. */
  tone?: "normal" | "warn";
}) {
  return (
    <div className="border border-line bg-paper px-5 py-4">
      <p className="text-xs uppercase tracking-[0.1em] text-ink-soft">{label}</p>
      <p className={`text-2xl mt-1.5 ${tone === "warn" ? "text-accent" : ""}`}>
        {value}
      </p>
    </div>
  );
}

export function Panel({
  title,
  sub,
  actions,
  children,
}: {
  title: string;
  sub?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-line bg-paper px-6 py-5">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="font-display text-xl">{title}</h2>
          {sub && <p className="text-xs text-ink-soft mt-1">{sub}</p>}
        </div>
        {actions}
      </div>
      <div className="mt-5">{children}</div>
    </div>
  );
}
