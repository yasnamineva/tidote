const STEPS = [
  {
    title: "Take & Update Measurements",
    copy: "Log your measurements so every made-to-measure piece is cut to fit.",
  },
  {
    title: "Place an Order",
    copy: "Pick a category, describe the piece, and attach reference photos if you like.",
  },
  {
    title: "Come for a Fitting",
    copy: "Once your piece is ready we'll notify you — book a fitting slot that works.",
  },
  {
    title: "Add Delivery Info",
    copy: "Tell us where to send the finished piece, or arrange pickup at the atelier.",
  },
];

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
}: {
  index: number;
  isCurrent: boolean;
  isDone: boolean;
}) {
  const colorClass = isCurrent
    ? "text-accent"
    : isDone
      ? "text-moss-deep"
      : "text-ink-soft/40";
  return (
    <div className="relative flex items-center justify-center h-14 w-14 shrink-0">
      {isCurrent && (
        <span className="absolute h-11 w-11 rounded-full bg-accent/20 animate-ping" />
      )}
      <svg
        viewBox="0 0 32 32"
        className={`relative h-9 w-9 transition-colors duration-500 ${colorClass}`}
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
  className = "",
}: {
  activeStep?: number;
  className?: string;
}) {
  return (
    <div className={`grid grid-cols-2 md:flex md:items-start gap-y-10 gap-x-4 md:gap-0 ${className}`}>
      {STEPS.map((step, i) => {
        const stepNum = i + 1;
        const isCurrent = activeStep === stepNum;
        const isDone = activeStep !== undefined && stepNum < activeStep;

        return (
          <div
            key={step.title}
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
                  i === STEPS.length - 1 ? "opacity-0" : isDone ? "bg-moss-deep" : "bg-line"
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
              {stepNum}. {step.title}
            </p>
            <p className="mt-2 text-sm text-ink-soft max-w-[200px]">{step.copy}</p>
          </div>
        );
      })}
    </div>
  );
}
