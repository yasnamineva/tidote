"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export function useScrollSpy(sectionIds: string[]) {
  const pathname = usePathname();
  const [progress, setProgress] = useState(0);
  const [activeId, setActiveId] = useState<string | null>(null);
  const frame = useRef<number | null>(null);

  useEffect(() => {
    if (pathname !== "/") {
      setProgress(0);
      setActiveId(null);
      return;
    }

    function update() {
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const y = window.scrollY;
      setProgress(docHeight > 0 ? Math.min(Math.max(y / docHeight, 0), 1) : 0);

      let current: string | null = null;
      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (el && y + 140 >= el.offsetTop) current = id;
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
  }, [pathname]);

  return { progress, activeId };
}
