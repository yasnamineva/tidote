"use client";

import { useEffect, useRef, useState } from "react";

export type TypingSegment = {
  text: string;
  className?: string;
};

export function TypingText({
  segments,
  speed = 45,
  startDelay = 200,
  className = "",
}: {
  segments: TypingSegment[];
  speed?: number;
  startDelay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const fullLength = segments.reduce((sum, s) => sum + s.text.length, 0);
  const done = count >= fullLength;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setStarted(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    let raf: ReturnType<typeof setTimeout>;
    const startTimer = setTimeout(function tick() {
      setCount((c) => {
        if (c >= fullLength) return c;
        raf = setTimeout(tick, speed);
        return c + 1;
      });
    }, startDelay);
    return () => {
      clearTimeout(startTimer);
      clearTimeout(raf);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started, fullLength, speed, startDelay]);

  let remaining = count;
  return (
    <span ref={ref} className={className}>
      <span aria-hidden="true">
        {segments.map((seg, i) => {
          const shown = seg.text.slice(
            0,
            Math.max(0, Math.min(seg.text.length, remaining))
          );
          remaining -= seg.text.length;
          return (
            <span key={i} className={seg.className}>
              {shown}
            </span>
          );
        })}
        <span
          className={`typing-caret ${done ? "opacity-0" : ""}`}
          style={{ height: "0.85em", verticalAlign: "-0.1em" }}
        />
      </span>
      <span className="sr-only">{segments.map((s) => s.text).join("")}</span>
    </span>
  );
}
