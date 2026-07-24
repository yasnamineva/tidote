const SIZES = {
  sm: { tidote: "text-lg", atelier: "text-[11px]" },
  md: { tidote: "text-2xl md:text-3xl", atelier: "text-sm md:text-base" },
  hero: {
    tidote: "text-[20vw] md:text-[11vw] lg:text-[10rem]",
    atelier: "text-2xl md:text-4xl",
  },
} as const;

export function Wordmark({
  size = "md",
  stacked = false,
  className = "",
}: {
  size?: keyof typeof SIZES;
  stacked?: boolean;
  className?: string;
}) {
  const s = SIZES[size];
  return (
    <span
      className={`inline-flex ${
        stacked ? "flex-col items-start" : "items-baseline gap-2"
      } ${className}`}
    >
      <span className={`font-gothic leading-[0.9] tracking-tight ${s.tidote}`}>
        TIDOTE
      </span>
      <span
        className={`font-round font-medium tracking-wide text-ink-soft ${s.atelier}`}
      >
        atelier
      </span>
    </span>
  );
}
