"use client";

import { useState } from "react";

/**
 * Hand-rolled SVG charts — no chart library, so they inherit the site's tokens.
 * Every chart here is single-series on purpose: one hue carries magnitude, and
 * identity comes from the axis labels, so no categorical palette is needed.
 */

const DATA = "var(--chart-data)";
const GRID = "var(--line)";
const SURFACE = "var(--paper)";

/** Bar with a 4px rounded data-end and square corners at the baseline. */
function columnPath(x: number, y: number, w: number, h: number, r = 4) {
  const rr = Math.max(0, Math.min(r, w / 2, h));
  if (h <= 0) return "";
  return `M${x},${y + h} L${x},${y + rr} Q${x},${y} ${x + rr},${y} L${x + w - rr},${y} Q${x + w},${y} ${x + w},${y + rr} L${x + w},${y + h} Z`;
}

function barPath(x: number, y: number, w: number, h: number, r = 4) {
  const rr = Math.max(0, Math.min(r, h / 2, w));
  if (w <= 0) return "";
  return `M${x},${y} L${x + w - rr},${y} Q${x + w},${y} ${x + w},${y + rr} L${x + w},${y + h - rr} Q${x + w},${y + h} ${x + w - rr},${y + h} L${x},${y + h} Z`;
}

/**
 * Ticks must land on round numbers AND on the gridline they label, so the axis
 * max is snapped up to a whole number of steps rather than labelled by fraction.
 */
function axisScale(maxValue: number): { max: number; ticks: number[] } {
  if (maxValue <= 0) return { max: 1, ticks: [0, 1] };
  const raw = maxValue / 3; // aim for ~3 intervals
  const pow = Math.pow(10, Math.floor(Math.log10(raw)));
  const norm = raw / pow;
  const step = (norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 5 ? 5 : 10) * pow;
  const max = Math.ceil(maxValue / step) * step;
  const ticks: number[] = [];
  for (let v = 0; v <= max + step / 1000; v += step) ticks.push(Math.round(v * 100) / 100);
  return { max, ticks };
}

type Point = { label: string; value: number; caption: string };

/** Vertical columns over time. Only the peak is direct-labelled. */
export function ColumnChart({
  points,
  formatValue,
  height = 200,
}: {
  points: Point[];
  formatValue: (v: number) => string;
  height?: number;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const { max, ticks } = axisScale(Math.max(...points.map((p) => p.value), 0));
  const peak = points.reduce((best, p, i) => (p.value > points[best].value ? i : best), 0);
  const tickLabels = ticks.map(formatValue);
  const padL = 10 + Math.max(...tickLabels.map((s) => s.length)) * 6;
  const padR = 8;
  const padT = 18;
  const plotH = height - padT - 28;
  const slot = 100 / points.length; // percentage-based so the SVG can scale

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 640 ${height}`}
        className="w-full h-auto"
        role="img"
        preserveAspectRatio="none"
      >
        {ticks.map((tick, ti) => {
          const y = padT + plotH - (tick / max) * plotH;
          return (
            <g key={tick}>
              <line
                x1={padL}
                x2={640 - padR}
                y1={y}
                y2={y}
                stroke={GRID}
                strokeWidth="1"
              />
              <text
                x={padL - 8}
                y={y + 3}
                textAnchor="end"
                className="fill-ink-soft tabular-nums"
                style={{ fontSize: 9 }}
              >
                {tickLabels[ti]}
              </text>
            </g>
          );
        })}

        {points.map((p, i) => {
          const bandW = (640 - padL - padR) * (slot / 100);
          const barW = Math.min(24, bandW - 2); // 2px surface gap between neighbours
          const x = padL + bandW * i + (bandW - barW) / 2;
          const h = max > 0 ? (p.value / max) * plotH : 0;
          const y = padT + plotH - h;
          return (
            <g key={p.label + i}>
              <path d={columnPath(x, y, barW, h)} fill={DATA} />
              {i === peak && p.value > 0 && (
                <text
                  x={x + barW / 2}
                  y={y - 6}
                  textAnchor="middle"
                  className="fill-ink"
                  style={{ fontSize: 10 }}
                >
                  {formatValue(p.value)}
                </text>
              )}
              <text
                x={x + barW / 2}
                y={height - 10}
                textAnchor="middle"
                className="fill-ink-soft"
                style={{ fontSize: 9 }}
              >
                {p.label}
              </text>
              {/* Hit target spans the whole band, not just the bar */}
              <rect
                x={padL + bandW * i}
                y={padT}
                width={bandW}
                height={plotH}
                fill="transparent"
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
              />
            </g>
          );
        })}
      </svg>

      {hover !== null && (
        <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 border border-line bg-paper px-3 py-1.5 text-xs shadow-[0_4px_16px_rgba(34,30,25,0.12)]">
          <span className="text-ink-soft">{points[hover].caption}</span>{" "}
          <span className="font-medium">{formatValue(points[hover].value)}</span>
        </div>
      )}
    </div>
  );
}

/** Horizontal bars for named categories, value at the tip. */
export function BarList({
  rows,
  formatValue,
}: {
  rows: { label: string; value: number }[];
  formatValue?: (v: number) => string;
}) {
  const max = Math.max(...rows.map((r) => r.value), 1);
  const fmt = formatValue ?? ((v: number) => String(v));
  const rowH = 30;
  const height = rows.length * rowH;
  const labelW = 132;
  const valueW = 44;

  return (
    <svg
      viewBox={`0 0 480 ${height}`}
      className="w-full h-auto"
      role="img"
      style={{ maxHeight: height * 1.6 }}
    >
      {rows.map((r, i) => {
        const y = i * rowH;
        const trackW = 480 - labelW - valueW;
        const w = (r.value / max) * trackW;
        return (
          <g key={r.label}>
            <text
              x={0}
              y={y + rowH / 2 + 3}
              className="fill-ink-soft"
              style={{ fontSize: 10 }}
            >
              {r.label}
            </text>
            {/* 2px surface gap keeps neighbouring bars from touching */}
            <path
              d={barPath(labelW, y + 6, Math.max(w, r.value > 0 ? 3 : 0), rowH - 12)}
              fill={DATA}
            />
            <text
              x={labelW + w + 8}
              y={y + rowH / 2 + 3}
              className="fill-ink tabular-nums"
              style={{ fontSize: 10 }}
            >
              {fmt(r.value)}
            </text>
          </g>
        );
      })}
      <rect x="0" y="0" width="0" height="0" fill={SURFACE} />
    </svg>
  );
}
