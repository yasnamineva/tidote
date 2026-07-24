export function FramedMedia({
  children,
  className = "",
  offset = "bottom-right",
}: {
  children: React.ReactNode;
  className?: string;
  offset?: "bottom-right" | "top-left";
}) {
  const offsetClasses =
    offset === "bottom-right"
      ? "translate-x-3 translate-y-3 md:translate-x-5 md:translate-y-5"
      : "-translate-x-3 -translate-y-3 md:-translate-x-5 md:-translate-y-5";

  return (
    <div className={`relative ${className}`}>
      <div
        className={`absolute inset-0 bg-moss ${offsetClasses}`}
        aria-hidden="true"
      />
      <div className="relative h-full w-full">{children}</div>
    </div>
  );
}
