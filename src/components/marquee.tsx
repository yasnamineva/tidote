export function Marquee({ tone = "ink" }: { tone?: "ink" | "moss" }) {
  const items = Array.from({ length: 8 }).map((_, i) => (
    <span key={i} className="flex items-center">
      <span className="flex items-baseline gap-2 px-6">
        <span className="font-gothic text-lg md:text-xl tracking-wide text-moss">
          TIDOTE
        </span>
        <span className="font-round font-medium text-lg md:text-xl tracking-wide">
          atelier
        </span>
      </span>
      <span
        className={`h-2.5 w-2.5 rounded-full ${
          tone === "moss" ? "bg-ink" : "bg-moss-deep"
        }`}
      />
    </span>
  ));

  return (
    <div
      className={`overflow-hidden border-y border-line py-4 ${
        tone === "moss" ? "bg-moss text-ink" : "bg-ink text-cream"
      }`}
    >
      <div className="marquee-track">
        {items}
        {items}
      </div>
    </div>
  );
}
