"use client";

import { useEffect, useRef, useState } from "react";

// Path-agnostic scroll spy: returns the id of the last section whose top has
// passed `offset` px below the viewport top. Used for the dashboard's sticky
// progress stepper.
export function useSectionSpy(ids: string[], offset = 160) {
  const [activeId, setActiveId] = useState<string | null>(ids[0] ?? null);
  const frame = useRef<number | null>(null);
  const key = ids.join(",");

  useEffect(() => {
    function update() {
      const y = window.scrollY;
      let current: string | null = ids[0] ?? null;
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && y + offset >= el.offsetTop) current = id;
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
