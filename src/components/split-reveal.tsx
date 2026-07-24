"use client";

import { useEffect, useRef, useState } from "react";

export function SplitReveal({
  text,
  className = "",
  wordDelay = 45,
  startDelay = 0,
}: {
  text: string;
  className?: string;
  wordDelay?: number;
  startDelay?: number;
}) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [visible, setVisible] = useState(false);
  const words = text.split(" ");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <span ref={ref} className={className} aria-label={text}>
      {words.map((word, i) => (
        <span key={i} className={`word-mask ${visible ? "is-visible" : ""}`}>
          <span
            className="word-inner"
            style={{ transitionDelay: `${startDelay + i * wordDelay}ms` }}
            aria-hidden="true"
          >
            {word}
          </span>
        </span>
      ))}
    </span>
  );
}
