"use client";

import { useEffect, useState } from "react";
import { useLang } from "@/lib/i18n";
import { STORAGE_FULL_EVENT } from "@/lib/storage";

/**
 * A failed write used to be invisible: the exception escaped the click handler
 * and the page simply carried on, so the person had no way to know their order
 * or note had not been kept. This listens for the refusal and says so, once,
 * until dismissed.
 */
export function StorageBanner() {
  const { t } = useLang();
  const [full, setFull] = useState(false);

  useEffect(() => {
    const onFull = () => setFull(true);
    window.addEventListener(STORAGE_FULL_EVENT, onFull);
    return () => window.removeEventListener(STORAGE_FULL_EVENT, onFull);
  }, []);

  if (!full) return null;

  return (
    <div
      role="alert"
      className="fixed inset-x-0 bottom-0 z-[80] border-t border-accent bg-accent text-cream px-5 py-3.5"
    >
      <div className="mx-auto max-w-3xl flex items-start gap-4">
        <p className="text-sm leading-snug flex-1">
          <strong className="font-semibold">{t("storage.fullTitle")}</strong>{" "}
          {t("storage.fullBody")}
        </p>
        <button
          type="button"
          onClick={() => setFull(false)}
          className="text-xs uppercase tracking-[0.15em] underline underline-offset-4 shrink-0 pt-0.5"
        >
          {t("storage.dismiss")}
        </button>
      </div>
    </div>
  );
}
