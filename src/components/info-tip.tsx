"use client";

import { useId } from "react";

/**
 * Small "i" marker that reveals `text` on hover, keyboard focus or tap.
 * Purely CSS-driven so it stays cheap to render in long measurement lists.
 */
export function InfoTip({ text, label }: { text: string; label: string }) {
  const id = useId();
  return (
    <span className="relative inline-flex group align-middle">
      <button
        type="button"
        aria-label={label}
        aria-describedby={id}
        className="w-4 h-4 rounded-full border border-line text-[9px] leading-none font-medium text-ink-soft flex items-center justify-center transition-colors duration-200 hover:border-moss-deep hover:text-moss-deep focus:outline-none focus-visible:border-moss-deep focus-visible:text-moss-deep"
      >
        i
      </button>
      <span
        id={id}
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-20 w-48 sm:w-64 max-w-[70vw] border border-line bg-paper px-3 py-2 text-[11px] leading-relaxed normal-case tracking-normal text-ink text-left shadow-[0_4px_16px_rgba(34,30,25,0.12)] opacity-0 invisible transition-opacity duration-200 group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible"
      >
        {text}
      </span>
    </span>
  );
}
