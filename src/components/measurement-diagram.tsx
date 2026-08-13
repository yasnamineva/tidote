"use client";

import { useLang } from "@/lib/i18n";

const GUIDES = [
  { src: "/measure/front_measurements.png", captionKey: "measure.guide.front" },
  { src: "/measure/arm_measurement.png", captionKey: "measure.guide.arms" },
];

export function MeasurementDiagram({ className = "" }: { className?: string }) {
  const { t } = useLang();
  return (
    <div className={`border border-line bg-cream ${className}`}>
      <div className="grid sm:grid-cols-2 gap-px bg-line">
        {GUIDES.map((g) => (
          // eslint-disable-next-line @next/next/no-img-element -- static line-art guide, kept crisp
          <img
            key={g.src}
            src={g.src}
            alt={t(g.captionKey)}
            className="w-full h-auto object-contain bg-cream"
          />
        ))}
      </div>
      <p className="text-xs text-ink-soft text-center px-4 py-3 leading-relaxed border-t border-line">
        {t("measure.guide.tip")}
      </p>
    </div>
  );
}
