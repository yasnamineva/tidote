"use client";

import { useEffect, useRef, useState } from "react";

function documentTop(el: HTMLElement) {
  return el.getBoundingClientRect().top + window.scrollY;
}

// Path-agnostic scroll spy: returns the id of the section that is currently
// under `offset`. The winner is picked by where each section actually sits on
// the page, not by where it sits in `ids` — the caller's array is a set, not a
// running order, and a section nested inside another one (the fitting picker
// lives inside an order card) has no fixed place in it at all.
export function useSectionSpy(ids: string[], offset = 160) {
  const [activeId, setActiveId] = useState<string | null>(ids[0] ?? null);
  const frame = useRef<number | null>(null);
  const key = ids.join(",");

  useEffect(() => {
    function update() {
      const line = window.scrollY + offset;
      let current: string | null = null;
      let currentTop = -Infinity;
      for (const id of ids) {
        const el = document.getElementById(id);
        if (!el) continue;
        const top = documentTop(el);
        if (line >= top && top >= currentTop) {
          current = id;
          currentTop = top;
        }
      }
      // Above the first section, stay on whichever one comes first on the page.
      if (!current) {
        for (const id of ids) {
          const el = document.getElementById(id);
          if (!el) continue;
          const top = documentTop(el);
          if (currentTop === -Infinity || top < currentTop) {
            current = id;
            currentTop = top;
          }
        }
      }
      setActiveId(current);
      frame.current = null;
    }
    function onScroll() {
      if (frame.current) return;
      frame.current = requestAnimationFrame(update);
    }
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame.current) cancelAnimationFrame(frame.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, offset]);

  return activeId;
}
