"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/**
 * Which section of the homepage you are looking at, for the header to light up.
 *
 * Two things this has to get right, and got wrong before.
 *
 * The caller passes the ids in *menu* order, which is not the order they appear
 * on the page — "In Stock" sits between "Custom Pieces" and "How It Works" in
 * the menu, but its band is inside the shop section on the page. Walking the
 * caller's array and keeping the last match therefore lit the wrong item. The
 * page decides the order, so measure it.
 *
 * And `offsetTop` is measured from whichever ancestor happens to be positioned,
 * which for these sections is not the document. It reads correctly right up
 * until someone adds `relative` to a wrapper, and then it is quietly wrong.
 */
export function useScrollSpy(sectionIds: string[]) {
  const pathname = usePathname();
  const [progress, setProgress] = useState(0);
  const [activeId, setActiveId] = useState<string | null>(null);
  const frame = useRef<number | null>(null);

  const onHome = pathname === "/";

  useEffect(() => {
    // Nothing to track away from the homepage. The stale values are not
    // cleared here — that would be a setState in an effect body, and a
    // cascading render — they are simply not returned; see the bottom.
    if (!onHome) return;

    // Roughly the height of the sticky header, so a section counts as current
    // once it reaches the first line the reader can actually see.
    const HEADER = 140;

    function update() {
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const y = window.scrollY;
      setProgress(docHeight > 0 ? Math.min(Math.max(y / docHeight, 0), 1) : 0);

      const tops = sectionIds
        .map((id) => {
          const el = document.getElementById(id);
          if (!el) return null;
          return { id, top: el.getBoundingClientRect().top + y };
        })
        .filter((s) => s !== null)
        .sort((a, b) => a.top - b.top);

      let current: string | null = null;
      for (const s of tops) if (y + HEADER >= s.top) current = s.id;
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
  }, [onHome]);

  // Off the homepage there is no progress and nothing lit. Returning that,
  // rather than storing it, keeps the effect free of setState.
  return onHome ? { progress, activeId } : { progress: 0, activeId: null };
}
