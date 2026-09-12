"use client";

import { useLang } from "@/lib/i18n";

/**
 * The two states every page that fetches something has to be able to show,
 * in one place so they look the same everywhere.
 *
 * Most of the portal used to hold its data as `T[] | null` or `T | undefined`
 * and load it with `void get().then(set)` — no catch. So a failed request had
 * two possible endings, both wrong: an empty table that read as "you have no
 * clients", or "Loading…" forever with the real cause only in the console.
 * Neither tells the studio what happened or gives her anything to do about it.
 */

export function Loading({ label }: { label?: string }) {
  const { t } = useLang();
  return (
    <p
      role="status"
      className="text-ink-soft text-sm uppercase tracking-[0.15em] animate-pulse"
    >
      {label ?? t("common.loading")}
    </p>
  );
}

export function LoadFailed({
  onRetry,
  title,
  sub,
}: {
  onRetry: () => void;
  title?: string;
  sub?: string;
}) {
  const { t } = useLang();
  return (
    <div
      role="alert"
      className="border border-line bg-paper px-6 py-10 text-center flex flex-col items-center gap-3 rounded"
    >
      <p className="font-display text-xl">{title ?? t("common.failedTitle")}</p>
      <p className="max-w-md text-sm text-ink-soft">
        {sub ?? t("common.failedSub")}
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-2 bg-ink text-cream px-6 py-2.5 text-xs uppercase tracking-[0.15em] rounded transition-transform duration-300 hover:-translate-y-0.5"
      >
        {t("common.retry")}
      </button>
    </div>
  );
}
