type Shape = {
  className: string;
  animation: string;
  hideOnMobile?: boolean;
};

const VARIANTS: Record<string, Shape[]> = {
  light: [
    {
      className: "top-14 left-[6%] h-16 w-16 rounded-full border border-moss-deep/25",
      animation: "drift",
    },
    {
      className: "bottom-20 right-[10%] h-10 w-10 rounded-full border border-accent/30",
      animation: "float",
    },
    {
      className: "top-1/2 right-[20%] h-2 w-2 rounded-full bg-moss-deep/50",
      animation: "drift-alt",
      hideOnMobile: true,
    },
  ],
  dark: [
    {
      className: "top-10 right-[12%] h-16 w-16 rounded-full border border-cream/25",
      animation: "float",
    },
    {
      className: "bottom-14 left-[10%] h-9 w-9 rounded-full border border-cream/20",
      animation: "drift-alt",
    },
    {
      className: "top-1/2 left-[45%] h-2 w-2 rounded-full bg-cream/40",
      animation: "drift",
      hideOnMobile: true,
    },
  ],
  warm: [
    {
      className: "top-10 left-[18%] h-14 w-14 rounded-full border border-accent/25",
      animation: "drift",
    },
    {
      className: "bottom-12 right-[14%] h-10 w-10 rounded-full border border-moss-deep/25",
      animation: "float",
    },
    {
      className: "top-1/2 right-[32%] h-2 w-2 rounded-full bg-accent/45",
      animation: "drift-alt",
      hideOnMobile: true,
    },
  ],
};

export function FloatingShapes({
  variant = "light",
}: {
  variant?: keyof typeof VARIANTS;
}) {
  const shapes = VARIANTS[variant];
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
    >
      {shapes.map((s, i) => (
        <div
          key={i}
          className={`absolute ${s.className} ${s.animation} ${
            s.hideOnMobile ? "hidden md:block" : ""
          }`}
        />
      ))}
    </div>
  );
}
