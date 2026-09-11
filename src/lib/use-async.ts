"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Loading, loaded, empty, failed — as four states a page can actually render,
 * rather than one nullable value that has to stand for all of them.
 *
 * The rail used to hold `ReadyPiece[] | null` and catch failures into `[]`,
 * which quietly turned an outage into "the rail is empty right now". A visitor
 * was told there was nothing to buy when the truth was that we could not find
 * out. And with nothing timing the request, a connection that never answered
 * left `null` on screen as "Loading…" for as long as the tab stayed open.
 *
 * So: failure is its own state and carries a retry, and the wait is bounded.
 */
export type Async<T> =
  | { status: "loading" }
  | { status: "ready"; data: T }
  | { status: "error"; message: string };

const TIMEOUT_MS = 12000;

/** What a finished attempt produced, and which attempt it was. */
type Settled<T> = { key: string; attempt: number; value: Async<T> };

export function useAsync<T>(
  load: () => Promise<T>,
  /** Something stable that says "this is a different request now". */
  key: string = ""
): { state: Async<T>; reload: () => void } {
  const [settled, setSettled] = useState<Settled<T> | null>(null);
  const [attempt, setAttempt] = useState(0);

  // The loader is usually an inline arrow, so a new function on every render;
  // the effect keys off `key` and `attempt`, never the function's identity.
  // Kept current in an effect rather than during render, which React forbids.
  const loadRef = useRef(load);
  useEffect(() => {
    loadRef.current = load;
  }, [load]);

  const finish = useCallback(
    (key: string, attempt: number, value: Async<T>) =>
      setSettled({ key, attempt, value }),
    []
  );

  useEffect(() => {
    let live = true;
    const timer = setTimeout(() => {
      if (live) finish(key, attempt, { status: "error", message: "timeout" });
    }, TIMEOUT_MS);

    loadRef
      .current()
      .then((data) => {
        if (!live) return;
        clearTimeout(timer);
        finish(key, attempt, { status: "ready", data });
      })
      .catch((e: unknown) => {
        if (!live) return;
        clearTimeout(timer);
        finish(key, attempt, {
          status: "error",
          message: e instanceof Error ? e.message : "unknown",
        });
      });

    return () => {
      live = false;
      clearTimeout(timer);
    };
  }, [key, attempt, finish]);

  // Loading is *derived*: it is simply "no answer for this attempt yet". That
  // keeps the effect free of a synchronous setState, and means a retry shows
  // the loading state without anything having to set it.
  const state: Async<T> =
    settled && settled.key === key && settled.attempt === attempt
      ? settled.value
      : { status: "loading" };

  const reload = useCallback(() => setAttempt((n) => n + 1), []);
  return { state, reload };
}
