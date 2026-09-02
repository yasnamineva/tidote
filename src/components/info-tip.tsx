"use client";

import { useCallback, useId, useRef, useState } from "react";

/**
 * Small "i" marker that reveals `text` on hover, keyboard focus or tap.
 *
 * The bubble is centred on the marker, which pushes it off-screen whenever the
 * marker sits near an edge — on a narrow phone that silently cut the last words
 * off the longer measurement hints. So on open it measures itself and shifts
 * just far enough to sit inside the viewport, which is the one thing plain CSS
 * cannot work out for itself. Everything else stays CSS-driven, since these
 * render many times over in the measurement lists.
 */
export function InfoTip({ text, label }: { text: string; label: string }) {
  const id = useId();
  const tip = useRef<HTMLSpanElement>(null);
  const [shift, setShift] = useState(0);

  const clamp = useCallback(() => {
    const el = tip.current;
    if (!el) return;
    // Measure unshifted, so repeated opens don't compound the correction.
    setShift(0);
    requestAnimationFrame(() => {
      const el2 = tip.current;
      if (!el2) return;
      const gutter = 12;
      const box = el2.getBoundingClientRect();
      const overRight = box.right - (window.innerWidth - gutter);
      const overLeft = gutter - box.left;
      if (overRight > 0) setShift(-overRight);
      else if (overLeft > 0) setShift(overLeft);
    });
  }, []);

  return (
    <span
      className="relative inline-flex group align-middle"
      onMouseEnter={clamp}
      onFocusCapture={clamp}
    >
      <button
        type="button"
        aria-label={label}
        aria-describedby={id}
        className="relative w-4 h-4 shrink-0 rounded-full border border-line text-[9px] leading-none font-medium text-ink-soft flex items-center justify-center transition-colors duration-200 hover:border-moss-deep hover:text-moss-deep focus:outline-none focus-visible:border-moss-deep focus-visible:text-moss-deep before:absolute before:left-1/2 before:top-1/2 before:h-11 before:w-11 before:-translate-x-1/2 before:-translate-y-1/2 before:content-['']"
      >
        i
      </button>
      <span
        ref={tip}
        id={id}
        role="tooltip"
        style={{ transform: `translateX(calc(-50% + ${shift}px))` }}
        className="pointer-events-none absolute bottom-full left-1/2 mb-2 z-20 w-44 sm:w-64 max-w-[calc(100vw-1.5rem)] border border-line bg-paper px-3 py-2 text-[11px] leading-relaxed normal-case tracking-normal text-ink text-left shadow-[0_4px_16px_rgba(34,30,25,0.12)] opacity-0 invisible transition-opacity duration-200 group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible"
      >
        {text}
      </span>
    </span>
  );
}
