"use client";

import * as React from "react";
import { cn } from "../../lib/utils";
import {
  ChartContainer,
  ChartEmptyState,
  ChartHeader,
  ChartLoadingState,
  type ChartColor,
  type ChartContainerProps,
  type ChartSize,
} from "./chart";

type GaugeChartVariant = "default" | "segmented";

type GaugeChartProps = Omit<
  ChartContainerProps,
  "children" | "header" | "legend" | "legendPosition" | "title"
> & {
  title: string;
  description: string;
  /** The reading to show against the scale. `null` renders the empty state. */
  value: number | null;
  /** Scale minimum. Defaults to 0. */
  min?: number;
  /**
   * Scale maximum. Defaults to 100. Must be greater than `min`; an invalid
   * scale has nothing to measure against, so it renders the empty state and
   * logs a console warning.
   */
  max?: number;
  color?: ChartColor;
  /**
   * `default` draws a continuous arc over a tinted track. `segmented` splits the
   * arc into `segments` blocks and fills them up to the value.
   */
  variant?: GaugeChartVariant;
  /**
   * Block count for the `segmented` variant. Defaults to 16; rounded to a
   * whole number of at least 1, and non-finite counts fall back to 16.
   */
  segments?: number;
  /** Prominent reading under the arc. Defaults to the formatted value. */
  centerValue?: React.ReactNode;
  /** Supporting caption under the reading, e.g. what the value measures. */
  centerLabel?: React.ReactNode;
  formatValue?: (value: number) => React.ReactNode;
  /**
   * Text announced for the value. Defaults to the formatted value when it is a
   * string, otherwise the raw number.
   */
  valueText?: string;
  headerAction?: React.ReactNode;
  loading?: boolean;
  loadingLabel?: string;
  emptyTitle?: React.ReactNode;
  emptyDescription?: React.ReactNode;
  showHeader?: boolean;
};

const plotSizeClasses: Record<ChartSize, string> = {
  spark: "w-20",
  sm: "w-40",
  default: "w-56",
  lg: "w-72",
};

const centerValueClasses: Record<ChartSize, string> = {
  spark: "text-caption",
  sm: "text-card-title",
  default: "text-heading-sm",
  lg: "text-heading",
};

// Continuous arc: the stroke's round caps hang below the baseline, so the
// view box leaves room for them.
const arcStroke = 20;
const arcRadius = 100 - arcStroke / 2;
const arcViewBox = `0 0 200 ${100 + arcStroke / 2}`;

// Segmented arc: flat-based blocks whose corners are rounded by a stroke in
// the block's own color.
const blockOuterRadius = 98;
const blockInnerRadius = 62;
const blockCornerStroke = 3;
const blockGapAngle = 3;
const blockViewBox = "0 0 200 102";

const defaultSegments = 16;

function blockCount(segments: number) {
  return Number.isFinite(segments)
    ? Math.max(1, Math.round(segments))
    : defaultSegments;
}

function point(radius: number, angle: number, cy: number) {
  const radians = (angle * Math.PI) / 180;
  return `${100 + Math.cos(radians) * radius} ${cy - Math.sin(radians) * radius}`;
}

/** An arc centerline from `from`° to `to`°, drawn clockwise over the top. */
function arcPath(radius: number, from: number, to: number, cy: number) {
  const largeArc = from - to > 180 ? 1 : 0;
  return `M ${point(radius, from, cy)} A ${radius} ${radius} 0 ${largeArc} 1 ${point(radius, to, cy)}`;
}

function blockPath(from: number, to: number, cy: number) {
  return [
    `M ${point(blockOuterRadius, from, cy)}`,
    `A ${blockOuterRadius} ${blockOuterRadius} 0 0 1 ${point(blockOuterRadius, to, cy)}`,
    `L ${point(blockInnerRadius, to, cy)}`,
    `A ${blockInnerRadius} ${blockInnerRadius} 0 0 0 ${point(blockInnerRadius, from, cy)}`,
    "Z",
  ].join(" ");
}

function ContinuousArc({ color, ratio }: { color: string; ratio: number }) {
  const cy = 100;

  return (
    <svg
      viewBox={arcViewBox}
      className="block h-auto w-full overflow-visible"
      aria-hidden="true"
      focusable="false"
    >
      <path
        data-slot="gauge-track"
        d={arcPath(arcRadius, 180, 0, cy)}
        fill="none"
        stroke={`color-mix(in oklab, ${color} 16%, var(--surface))`}
        strokeLinecap="round"
        strokeWidth={arcStroke}
      />
      {ratio > 0 ? (
        <path
          data-slot="gauge-value"
          d={arcPath(arcRadius, 180, 180 - ratio * 180, cy)}
          fill="none"
          stroke={color}
          strokeLinecap="round"
          strokeWidth={arcStroke}
        />
      ) : null}
    </svg>
  );
}

function SegmentedArc({
  color,
  ratio,
  segments,
}: {
  color: string;
  ratio: number;
  segments: number;
}) {
  const cy = 100;
  const sweep = (180 - (segments - 1) * blockGapAngle) / segments;
  const filled = ratio * segments;

  return (
    <svg
      viewBox={blockViewBox}
      className="block h-auto w-full overflow-visible"
      aria-hidden="true"
      focusable="false"
    >
      {Array.from({ length: segments }, (_, index) => {
        const from = 180 - index * (sweep + blockGapAngle);
        // Fully reached blocks take the color; the block the value lands in
        // takes a proportional tint, so the fill is never rounded up.
        const reach = Math.min(Math.max(filled - index, 0), 1);
        const fill =
          reach >= 1
            ? color
            : reach > 0
              ? `color-mix(in oklab, ${color} ${Math.round(reach * 100)}%, var(--border))`
              : "var(--border)";

        return (
          <path
            key={index}
            data-slot="gauge-segment"
            data-filled={reach >= 1 ? "" : undefined}
            d={blockPath(from, from - sweep, cy)}
            fill={fill}
            stroke={fill}
            strokeLinejoin="round"
            strokeWidth={blockCornerStroke}
          />
        );
      })}
    </svg>
  );
}

function GaugeChart({
  "aria-describedby": ariaDescribedby,
  "aria-labelledby": ariaLabelledby,
  centerLabel,
  centerValue,
  className,
  color = "chart-1",
  description,
  emptyDescription = "Data will appear when it becomes available.",
  emptyTitle = "No data available",
  formatValue = (value) => String(value),
  headerAction,
  loading = false,
  loadingLabel = "Loading chart",
  max = 100,
  min = 0,
  plotClassName,
  segments = defaultSegments,
  showHeader = true,
  size = "default",
  title,
  value,
  valueText,
  variant = "default",
  ...props
}: GaugeChartProps) {
  const titleId = React.useId();
  const descriptionId = React.useId();
  const hasValidScale =
    Number.isFinite(min) && Number.isFinite(max) && max > min;
  const hasData = value !== null && Number.isFinite(value) && hasValidScale;
  const clamped = hasData ? Math.min(Math.max(value, min), max) : min;
  const ratio = hasData ? (clamped - min) / (max - min) : 0;
  const formatted = hasData ? formatValue(value) : null;
  const colorValue = `var(--${color})`;

  // An invalid scale falls back to the empty state, which reads as missing
  // data; tell the developer it is a configuration error instead.
  React.useEffect(() => {
    if (!hasValidScale) {
      console.warn(
        `GaugeChart "${title}": \`max\` (${max}) must be greater than \`min\` (${min}). Rendering the empty state.`,
      );
    }
  }, [hasValidScale, max, min, title]);

  return (
    <ChartContainer
      {...props}
      aria-busy={loading || undefined}
      aria-describedby={ariaDescribedby ?? descriptionId}
      aria-labelledby={ariaLabelledby ?? titleId}
      className={cn("min-w-0", className)}
      data-chart-kind="gauge"
      data-show-header={showHeader}
      data-variant={variant}
      size={size}
      plotClassName={cn(
        (loading || hasData) && [
          "h-auto min-h-0 w-full justify-self-center",
          plotSizeClasses[size],
        ],
        plotClassName,
      )}
      header={
        <ChartHeader
          className={cn(!showHeader && "sr-only")}
          title={<span id={titleId}>{title}</span>}
          description={<span id={descriptionId}>{description}</span>}
          action={showHeader ? headerAction : undefined}
        />
      }
    >
      {loading ? (
        <ChartLoadingState
          label={loadingLabel}
          className="aspect-[2/1] min-h-0 overflow-hidden rounded-t-full [&>[data-slot=skeleton]]:min-h-0"
        />
      ) : hasData ? (
        <div className="relative min-w-0">
          <div
            role="meter"
            aria-labelledby={titleId}
            aria-valuemin={min}
            aria-valuemax={max}
            aria-valuenow={clamped}
            aria-valuetext={
              valueText ??
              (typeof formatted === "string" ? formatted : String(value))
            }
            data-slot="gauge-meter"
          >
            {variant === "segmented" ? (
              <SegmentedArc
                color={colorValue}
                ratio={ratio}
                segments={blockCount(segments)}
              />
            ) : (
              <ContinuousArc color={colorValue} ratio={ratio} />
            )}
          </div>
          {size !== "spark" ? (
            <span
              data-slot="gauge-center"
              className="pointer-events-none absolute inset-x-[22%] top-[34%] bottom-0 grid content-end justify-items-center gap-0.5 text-center"
            >
              <span
                className={cn(
                  "max-w-full break-words font-semibold tabular-nums text-balance text-foreground",
                  centerValueClasses[size],
                )}
              >
                <bdi>{centerValue ?? formatted}</bdi>
              </span>
              {centerLabel ? (
                <span className="max-w-full break-words text-caption text-balance text-foreground-secondary">
                  {centerLabel}
                </span>
              ) : null}
            </span>
          ) : null}
        </div>
      ) : (
        <ChartEmptyState title={emptyTitle} description={emptyDescription} />
      )}
    </ChartContainer>
  );
}

export { GaugeChart, type GaugeChartProps, type GaugeChartVariant };
