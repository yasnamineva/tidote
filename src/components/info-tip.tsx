"use client";

import { useCallback, useId, useState } from "react";

/**
 * Small "i" marker that reveals `text` on hover, keyboard focus or tap.
 *
 * Two things plain CSS cannot do for itself, so both are handled here.
 *
 * The bubble is centred on the marker, which pushes it off-screen whenever the
 * marker sits near an edge — on a narrow phone that silently cut the last words
 * off the longer measurement hints. On open it measures itself and shifts just
 * far enough to sit inside the viewport.
 *
 * And it is mounted only while open. A hidden-but-positioned bubble still
 * counts towards the page's scrollable width, and the ones in the right-hand
 * measurement column were dragging the whole dashboard 31px sideways on a
 * phone — an invisible element making a visible page scroll.
 */
export function InfoTip({ text, label }: { text: string; label: string }) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [shift, setShift] = useState(0);

  // Measured through a ref callback rather than an effect, so it runs the
  // moment the bubble is in the DOM and before the browser paints it.
  const measure = useCallback((el: HTMLSpanElement | null) => {
    if (!el) return;
    const gutter = 12;
    const box = el.getBoundingClientRect();
    const overRight = box.right - (window.innerWidth - gutter);
    const overLeft = gutter - box.left;
    if (overRight > 0) setShift(-overRight);
    else if (overLeft > 0) setShift(overLeft);
  }, []);

  function show() {
    setOpen(true);
  }

  function hide() {
    setOpen(false);
    // Back to centred, so the next open measures itself rather than compounding
    // the last correction.
    setShift(0);
  }

  return (
    <span
      className="relative inline-flex align-middle"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocusCapture={show}
      onBlurCapture={hide}
    >
      <button
        type="button"
        aria-label={label}
        aria-describedby={open ? id : undefined}
        className="relative w-4 h-4 shrink-0 rounded-full border border-line text-[9px] leading-none font-medium text-ink-soft flex items-center justify-center transition-colors duration-200 hover:border-moss-deep hover:text-moss-deep focus:outline-none focus-visible:border-moss-deep focus-visible:text-moss-deep before:absolute before:left-1/2 before:top-1/2 before:h-11 before:w-11 before:-translate-x-1/2 before:-translate-y-1/2 before:content-['']"
      >
        i
      </button>
      {open && (
        <span
          ref={measure}
          id={id}
          role="tooltip"
          style={{ transform: `translateX(calc(-50% + ${shift}px))` }}
          className="pointer-events-none absolute bottom-full left-1/2 mb-2 z-20 w-44 sm:w-64 max-w-[calc(100vw-1.5rem)] border border-line bg-paper px-3 py-2 text-[11px] leading-relaxed normal-case tracking-normal text-ink text-left shadow-[0_4px_16px_rgba(34,30,25,0.12)] animate-[fade-up_0.2s_ease-out_both]"
        >
          {text}
        </span>
      )}
    </span>
  );
}
