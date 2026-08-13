"use client";

import { Fragment } from "react";
import { useLang } from "@/lib/i18n";

const STEP_ICON_PATHS: React.ReactNode[] = [
  <g key="measure">
    <rect x="4" y="12" width="24" height="8" rx="3" />
    <line x1="9" y1="12" x2="9" y2="16" />
    <line x1="14" y1="12" x2="14" y2="16" />
    <line x1="19" y1="12" x2="19" y2="16" />
    <line x1="24" y1="12" x2="24" y2="16" />
  </g>,
  <g key="bag">
    <path d="M10 10V8a6 6 0 0 1 12 0v2" />
    <rect x="6" y="10" width="20" height="17" rx="2" />
  </g>,
  <g key="calendar">
    <rect x="4" y="7" width="24" height="21" rx="2" />
    <line x1="4" y1="14" x2="28" y2="14" />
    <line x1="10" y1="4" x2="10" y2="10" />
    <line x1="22" y1="4" x2="22" y2="10" />
  </g>,
  <g key="parcel">
    <path d="M16 5 4 11v11l12 6 12-6V11L16 5z" />
    <path d="M4 11l12 6 12-6" />
    <line x1="16" y1="17" x2="16" y2="28" />
  </g>,
];

function StepIcon({
  index,
  isCurrent,
  isDone,
  size = "lg",
}: {
  index: number;
  isCurrent: boolean;
  isDone: boolean;
  size?: "lg" | "sm";
}) {
  const colorClass = isCurrent
    ? "text-accent"
    : isDone
      ? "text-moss-deep"
      : "text-ink-soft/40";
  const box = size === "lg" ? "h-14 w-14" : "h-9 w-9";
  const svg = size === "lg" ? "h-9 w-9" : "h-6 w-6";
  const ping = size === "lg" ? "h-11 w-11" : "h-8 w-8";
  return (
    <div className={`relative flex items-center justify-center shrink-0 ${box}`}>
      {isCurrent && (
        <span
          className={`absolute ${ping} rounded-full bg-accent/20 animate-ping`}
        />
      )}
      <svg
        viewBox="0 0 32 32"
        className={`relative transition-colors duration-500 ${svg} ${colorClass}`}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {STEP_ICON_PATHS[index]}
      </svg>
    </div>
  );
}

export function JourneyStepper({
  activeStep,
  compact = false,
  className = "",
  onStepClick,
}: {
  activeStep?: number;
  compact?: boolean;
  className?: string;
  /** Supply on the dashboard to make each step jump to its section. */
  onStepClick?: (step: number) => void;
}) {
  const { t } = useLang();
  const steps = [1, 2, 3, 4];

  if (compact) {
    // Slim horizontal bar for the sticky dashboard header — labels/icons only,
    // current step lit up. Copy is hidden.
    // Connectors are siblings of the steps, not children of them: every line is
    // its own flex-1 track, so they all end up the same width no matter how long
    // the neighbouring labels are.
    return (
      <div
        className={`flex items-center justify-between sm:justify-start ${className}`}
      >
        {steps.map((n, i) => {
          const isCurrent = activeStep === n;
          const isDone = activeStep !== undefined && n < activeStep;
          const inner = (
            <>
              <StepIcon index={i} isCurrent={isCurrent} isDone={isDone} size="sm" />
              <span
                className={`hidden sm:block text-[11px] uppercase tracking-[0.12em] truncate transition-colors ${
                  isCurrent ? "text-accent" : isDone ? "text-ink" : "text-ink-soft"
                }`}
              >
                {n}. {t(`journey.${n}.short`)}
              </span>
            </>
          );
          return (
            <Fragment key={n}>
              {i > 0 && (
                <div
                  className={`hidden sm:block h-px flex-1 basis-0 min-w-4 mx-2 transition-colors duration-500 ${
                    isDone || isCurrent ? "bg-moss-deep" : "bg-line"
                  }`}
                />
              )}
              {onStepClick ? (
                <button
                  type="button"
                  onClick={() => onStepClick(n)}
                  aria-current={isCurrent ? "step" : undefined}
                  className="flex items-center gap-2 min-w-0 px-1 rounded transition-opacity focus:outline-none focus-visible:ring-1 focus-visible:ring-moss-deep"
                >
                  {inner}
                </button>
              ) : (
                <div className="flex items-center gap-2 min-w-0 px-1">
                  {inner}
                </div>
              )}
            </Fragment>
          );
        })}
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-2 md:flex md:items-start gap-y-10 gap-x-4 md:gap-0 ${className}`}>
      {steps.map((n, i) => {
        const isCurrent = activeStep === n;
        const isDone = activeStep !== undefined && n < activeStep;

        return (
          <div
            key={n}
            className="flex flex-col items-center text-center md:flex-1 md:px-3"
          >
            <div className="hidden md:flex items-center w-full">
              <div
                className={`flex-1 h-px transition-colors duration-500 ${
                  i === 0 ? "opacity-0" : isDone || isCurrent ? "bg-moss-deep" : "bg-line"
                }`}
              />
              <StepIcon index={i} isCurrent={isCurrent} isDone={isDone} />
              <div
                className={`flex-1 h-px transition-colors duration-500 ${
                  i === steps.length - 1 ? "opacity-0" : isDone ? "bg-moss-deep" : "bg-line"
                }`}
              />
            </div>
            <div className="md:hidden mb-2">
              <StepIcon index={i} isCurrent={isCurrent} isDone={isDone} />
            </div>

            <p
              className={`mt-3 md:mt-4 text-xs uppercase tracking-[0.15em] ${
                isCurrent ? "text-accent" : "text-ink"
              }`}
            >
              {n}. {t(`journey.${n}.title`)}
            </p>
            <p className="mt-2 text-sm text-ink-soft max-w-[200px]">
              {t(`journey.${n}.copy`)}
            </p>
          </div>
        );
      })}
    </div>
  );
}
