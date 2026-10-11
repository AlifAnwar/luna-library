"use client";

import * as React from "react";
import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip";
import {
  Pie,
  PieChart as RechartsPieChart,
  Sector,
  type PieSectorShapeProps,
} from "recharts";
import { cn } from "../../lib/utils";
import {
  ChartContainer,
  ChartEmptyState,
  ChartHeader,
  ChartLegend,
  ChartLoadingState,
  ChartTooltip,
  type ChartColor,
  type ChartContainerProps,
  type ChartLegendItem,
  type ChartSize,
  type ChartTooltipItem,
} from "./chart";

type DistributionChartDatum = {
  /** Stable identity for the slice. Defaults to `category`. */
  id?: string;
  category: string;
  /** Non-negative magnitude. Negative and non-finite values are not drawn. */
  value: number;
  /**
   * Consumer-supplied share of the whole. Luna displays it as given and never
   * derives it from `value`.
   */
  percentage?: number;
  /** Pins a color to this category so it survives filtering and reordering. */
  color?: ChartColor;
};

type DistributionChartVariant = "default" | "modern";
type DistributionChartSliceLabel = "none" | "percentage" | "value";
type DistributionChartLegendPosition = "end" | "bottom";
type DonutChartArc = "full" | "half";

type DistributionChartCommonProps = Omit<
  ChartContainerProps,
  "children" | "header" | "legend" | "legendPosition" | "title"
> & {
  title: string;
  description: string;
  data: readonly DistributionChartDatum[];
  headerAction?: React.ReactNode;
  loading?: boolean;
  loadingLabel?: string;
  emptyTitle?: React.ReactNode;
  emptyDescription?: React.ReactNode;
  legendLabel?: string;
  /** `end` sits beside the chart and wraps below it in narrow containers. */
  legendPosition?: DistributionChartLegendPosition;
  showHeader?: boolean;
  /** Defaults to `true`, except for the `spark` size. */
  showLegend?: boolean;
  showTooltip?: boolean;
  variant?: DistributionChartVariant;
  /**
   * Prints a reading inside each slice. `percentage` shows only the
   * consumer-supplied share and skips slices without one. Slices too narrow to
   * hold text stay unlabelled; every reading remains in the legend, tooltip,
   * and data table. Not drawn at the `spark` size.
   */
  sliceLabel?: DistributionChartSliceLabel;
  /** Column and tooltip label for `value`. */
  valueLabel?: string;
  /** Column and tooltip label for `percentage`. */
  percentageLabel?: string;
  /** Column label for the category in the accessible data table. */
  categoryLabel?: string;
  /** Localizable instructions announced when the chart receives focus. */
  keyboardHint?: string;
  formatValue?: (
    value: number,
    datum: DistributionChartDatum,
  ) => React.ReactNode;
  formatPercentage?: (
    percentage: number,
    datum: DistributionChartDatum,
  ) => React.ReactNode;
};

type PieChartProps = DistributionChartCommonProps;

type DonutChartProps = DistributionChartCommonProps & {
  /** `half` draws the ring as a semicircle, left to right over the top. */
  arc?: DonutChartArc;
  /** Supporting caption in the donut hole, e.g. what the total counts. */
  centerLabel?: React.ReactNode;
  /** Prominent reading in the donut hole, e.g. a consumer-formatted total. */
  centerValue?: React.ReactNode;
};

type DistributionChartKind = "pie" | "donut";

type DistributionEntry = {
  id: string;
  datum: DistributionChartDatum;
  color: ChartColor;
  /** Index among drawn slices; `null` for a zero value, which has no arc. */
  sliceIndex: number | null;
};

type SliceGeometry = {
  innerRadius: number;
  outerRadius: number;
  cornerRadius: number;
  paddingAngle: number;
  strokeWidth: number;
};

const chartColors: readonly ChartColor[] = [
  "chart-1",
  "chart-2",
  "chart-3",
  "chart-4",
  "chart-5",
];

// Clockwise in the legend's reading order: from twelve o'clock for a full
// ring, from nine o'clock over the top for a half ring.
const arcAngles: Record<DonutChartArc, { start: number; end: number }> = {
  full: { start: 90, end: -270 },
  half: { start: 180, end: 0 },
};

const outerRadiusRatio = 0.92;

const sliceGeometry: Record<
  DistributionChartKind,
  Record<DistributionChartVariant, SliceGeometry>
> = {
  pie: {
    default: {
      innerRadius: 0,
      outerRadius: outerRadiusRatio,
      cornerRadius: 0,
      paddingAngle: 0,
      strokeWidth: 2,
    },
    modern: {
      innerRadius: 0,
      outerRadius: outerRadiusRatio,
      cornerRadius: 4,
      paddingAngle: 0,
      strokeWidth: 3,
    },
  },
  donut: {
    default: {
      innerRadius: 0.64,
      outerRadius: outerRadiusRatio,
      cornerRadius: 0,
      paddingAngle: 0,
      strokeWidth: 2,
    },
    modern: {
      innerRadius: 0.76,
      outerRadius: outerRadiusRatio,
      cornerRadius: 4,
      paddingAngle: 2,
      strokeWidth: 0,
    },
  },
};

// Below this sweep a slice is too narrow at the label radius to hold a short
// reading such as "14%" without spilling into its neighbours.
const minLabelSweep = 24;

const sliceLabelClasses: Record<
  DistributionChartKind,
  Record<ChartSize, string>
> = {
  pie: {
    spark: "",
    sm: "text-caption",
    default: "text-body-sm",
    lg: "text-body",
  },
  // A ring is narrower than a wedge, so its labels step down a size.
  donut: {
    spark: "",
    sm: "text-caption",
    default: "text-caption",
    lg: "text-body-sm",
  },
};

// Labelled donuts widen the ring so a reading such as "58.1%" fits across it.
// A half ring only has the upper half of its hole for the center reading, so
// it gives up less of the hole.
const labelledDonutInnerRadius: Record<DonutChartArc, number> = {
  full: 0.46,
  half: 0.52,
};

const plotSizeClasses: Record<ChartSize, string> = {
  spark: "h-16 w-16",
  sm: "h-36 w-36",
  default: "h-44 w-44",
  lg: "h-56 w-56",
};

// A half ring is its full square cropped to the top half.
const halfPlotSizeClasses: Record<ChartSize, string> = {
  spark: "h-8 w-16",
  sm: "h-18 w-36",
  default: "h-22 w-44",
  lg: "h-28 w-56",
};

const centerValueClasses: Record<ChartSize, string> = {
  spark: "text-caption",
  sm: "text-body",
  default: "text-card-title",
  lg: "text-heading-sm",
};

// The labelled half ring's hole narrows fastest toward the top, so its center
// reading steps down a size.
const compactCenterValueClasses: Record<ChartSize, string> = {
  spark: "text-caption",
  sm: "text-caption",
  default: "text-body",
  lg: "text-card-title",
};

function colorValue(color: ChartColor) {
  return `var(--${color})`;
}

function defaultFormatValue(value: number) {
  return String(value);
}

function defaultFormatPercentage(percentage: number) {
  return `${percentage}%`;
}

function toEntries(data: readonly DistributionChartDatum[]) {
  let sliceCount = 0;

  return data
    .filter((datum) => Number.isFinite(datum.value) && datum.value >= 0)
    .map<DistributionEntry>((datum, index) => ({
      id: datum.id ?? datum.category,
      datum,
      // Categories keep their position's hue; pin `color` to hold identity.
      color: datum.color ?? chartColors[index % chartColors.length]!,
      sliceIndex: datum.value > 0 ? sliceCount++ : null,
    }));
}

/** Mid-angle and sweep of each slice, mirroring the renderer's sector layout. */
function sliceArcs(
  values: readonly number[],
  paddingAngle: number,
  arc: DonutChartArc,
) {
  const { start, end } = arcAngles[arc];
  const total = values.reduce((sum, value) => sum + value, 0);
  const padding = values.length > 1 ? paddingAngle : 0;
  const span = Math.abs(end - start);
  // A closed ring has a gap after every slice; an open arc has one fewer.
  const gaps = span >= 360 ? values.length : values.length - 1;
  const available = span - gaps * padding;
  let cursor = start;

  return values.map((value, index) => {
    const from = index === 0 ? cursor : cursor - padding;
    const to = from - (value / total) * available;
    cursor = to;
    return { midAngle: (from + to) / 2, sweep: from - to };
  });
}

function DistributionTable({
  categoryLabel,
  description,
  entries,
  formatPercentage,
  formatValue,
  percentageLabel,
  title,
  valueLabel,
}: {
  categoryLabel: string;
  description: string;
  entries: readonly DistributionEntry[];
  formatPercentage: NonNullable<
    DistributionChartCommonProps["formatPercentage"]
  >;
  formatValue: NonNullable<DistributionChartCommonProps["formatValue"]>;
  percentageLabel: string;
  title: string;
  valueLabel: string;
}) {
  const hasPercentage = entries.some(
    (entry) => entry.datum.percentage !== undefined,
  );

  return (
    <div className="sr-only">
      <table>
        <caption>
          {title}. {description}
        </caption>
        <thead>
          <tr>
            <th scope="col">{categoryLabel}</th>
            <th scope="col">{valueLabel}</th>
            {hasPercentage ? <th scope="col">{percentageLabel}</th> : null}
          </tr>
        </thead>
        <tbody>
          {entries.map(({ datum, id }) => (
            <tr key={id}>
              <th scope="row">{datum.category}</th>
              <td>
                <bdi>{formatValue(datum.value, datum)}</bdi>
              </td>
              {hasPercentage ? (
                <td>
                  <bdi>
                    {datum.percentage === undefined
                      ? null
                      : formatPercentage(datum.percentage, datum)}
                  </bdi>
                </td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DistributionRenderer({
  activeIndex,
  arc,
  centerLabel,
  centerValue,
  entries,
  formatPercentage,
  formatValue,
  hintId,
  interaction,
  kind,
  onActiveIndexChange,
  percentageLabel,
  showTooltip,
  size,
  sliceLabel,
  titleId,
  valueLabel,
  variant,
}: {
  activeIndex: number | null;
  arc: DonutChartArc;
  centerLabel?: React.ReactNode;
  centerValue?: React.ReactNode;
  entries: readonly DistributionEntry[];
  formatPercentage: NonNullable<
    DistributionChartCommonProps["formatPercentage"]
  >;
  formatValue: NonNullable<DistributionChartCommonProps["formatValue"]>;
  hintId: string;
  interaction: "pointer" | "keyboard";
  kind: DistributionChartKind;
  onActiveIndexChange: (
    index: number | null,
    interaction: "pointer" | "keyboard",
  ) => void;
  percentageLabel: string;
  showTooltip: boolean;
  size: ChartSize;
  sliceLabel: DistributionChartSliceLabel;
  titleId: string;
  valueLabel: string;
  variant: DistributionChartVariant;
}) {
  const surfaceRef = React.useRef<HTMLDivElement>(null);
  const slices = entries.filter((entry) => entry.sliceIndex !== null);
  const showSliceLabels = sliceLabel !== "none" && size !== "spark";
  const geometry =
    kind === "donut" && showSliceLabels
      ? {
          ...sliceGeometry.donut[variant],
          innerRadius: labelledDonutInnerRadius[arc],
        }
      : sliceGeometry[kind][variant];
  const paddingAngle = slices.length > 1 ? geometry.paddingAngle : 0;
  const activeEntry = activeIndex === null ? undefined : slices[activeIndex];
  const activeOffset = size === "spark" ? 1 : 4;
  const arcs = sliceArcs(
    slices.map((entry) => entry.datum.value),
    paddingAngle,
    arc,
  );
  // The visual center of each arc: labels sit here, and the tooltip points
  // here so narrow slices still get one aimed at them.
  const radiusRatio =
    geometry.innerRadius > 0
      ? (geometry.innerRadius + geometry.outerRadius) / 2
      : geometry.outerRadius * 0.62;
  const sliceLabels = !showSliceLabels
    ? []
    : slices.flatMap((entry, index) => {
        const { midAngle, sweep } = arcs[index]!;
        const reading =
          sliceLabel === "value"
            ? formatValue(entry.datum.value, entry.datum)
            : entry.datum.percentage === undefined
              ? null
              : formatPercentage(entry.datum.percentage, entry.datum);

        if (reading === null || (slices.length > 1 && sweep < minLabelSweep)) {
          return [];
        }

        const angle = (-midAngle * Math.PI) / 180;

        return [
          {
            id: entry.id,
            index,
            reading,
            color: entry.color,
            // A lone slice is a full disc or ring; center its label.
            left:
              slices.length > 1 ? 50 + Math.cos(angle) * radiusRatio * 50 : 50,
            top:
              slices.length > 1
                ? 50 + Math.sin(angle) * radiusRatio * 50
                : geometry.innerRadius > 0
                  ? 50 - radiusRatio * 50
                  : 50,
          },
        ];
      });

  const getAnchor = (index: number) => {
    const angle = (-arcs[index]!.midAngle * Math.PI) / 180;

    return {
      getBoundingClientRect: () => {
        const rect = surfaceRef.current!.getBoundingClientRect();
        const radius = (Math.min(rect.width, rect.height) / 2) * radiusRatio;
        const x = rect.left + rect.width / 2 + Math.cos(angle) * radius;
        const y = rect.top + rect.height / 2 + Math.sin(angle) * radius;

        return DOMRect.fromRect({ x, y, width: 0, height: 0 });
      },
    };
  };

  const moveActive = (next: number | null) =>
    onActiveIndexChange(next, "keyboard");

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const last = slices.length - 1;
    const current = activeIndex ?? -1;
    const keyTargets: Record<string, number | null> = {
      ArrowRight: current >= last ? 0 : current + 1,
      ArrowDown: current >= last ? 0 : current + 1,
      ArrowLeft: current <= 0 ? last : current - 1,
      ArrowUp: current <= 0 ? last : current - 1,
      Home: 0,
      End: last,
      Escape: null,
    };

    if (!(event.key in keyTargets)) {
      return;
    }

    event.preventDefault();
    moveActive(keyTargets[event.key]!);
  };

  const tooltipItems: ChartTooltipItem[] = activeEntry
    ? [
        {
          id: "value",
          label: valueLabel,
          value: activeEntry.datum.value,
          color: activeEntry.color,
          marker: "square",
        },
        ...(activeEntry.datum.percentage === undefined
          ? []
          : [
              {
                id: "percentage",
                label: percentageLabel,
                value: activeEntry.datum.percentage,
              },
            ]),
      ]
    : [];

  return (
    <div
      ref={surfaceRef}
      role="group"
      tabIndex={0}
      aria-labelledby={titleId}
      aria-describedby={hintId}
      data-slot="chart-distribution-surface"
      data-arc={arc}
      className={cn(
        "relative rounded-full focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-foreground",
        // A half ring keeps its full square; the plot crops the lower half.
        arc === "half" ? "aspect-square w-full self-start" : "size-full",
      )}
      onKeyDown={handleKeyDown}
      onBlur={() => onActiveIndexChange(null, "keyboard")}
      // The renderer re-wraps the hovered sector, so its own leave event is
      // not always delivered; leaving the chart always clears the highlight.
      onPointerLeave={() => onActiveIndexChange(null, "pointer")}
    >
      <div aria-hidden="true" className="size-full">
        <RechartsPieChart
          accessibilityLayer={false}
          margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
          responsive
          style={{ width: "100%", height: "100%" }}
        >
          <Pie
            data={slices.map((entry) => ({
              name: entry.datum.category,
              value: entry.datum.value,
            }))}
            dataKey="value"
            nameKey="name"
            startAngle={arcAngles[arc].start}
            endAngle={arcAngles[arc].end}
            innerRadius={`${geometry.innerRadius * 100}%`}
            outerRadius={`${geometry.outerRadius * 100}%`}
            cornerRadius={geometry.cornerRadius}
            paddingAngle={paddingAngle}
            rootTabIndex={-1}
            isAnimationActive={false}
            onMouseEnter={(_, index) => onActiveIndexChange(index, "pointer")}
            onMouseLeave={() => onActiveIndexChange(null, "pointer")}
            onClick={(_, index) =>
              onActiveIndexChange(
                index === activeIndex ? null : index,
                "pointer",
              )
            }
            shape={(props: PieSectorShapeProps) => {
              const entry = slices[props.index];
              const isActive = props.index === activeIndex;

              return (
                <Sector
                  cx={props.cx}
                  cy={props.cy}
                  innerRadius={props.innerRadius}
                  outerRadius={
                    props.outerRadius + (isActive ? activeOffset : 0)
                  }
                  startAngle={props.startAngle}
                  endAngle={props.endAngle}
                  cornerRadius={geometry.cornerRadius}
                  fill={entry ? colorValue(entry.color) : undefined}
                  stroke="var(--surface)"
                  // A lone slice is a full ring; a separator would draw a seam.
                  strokeWidth={slices.length > 1 ? geometry.strokeWidth : 0}
                  strokeLinejoin="round"
                  opacity={activeIndex !== null && !isActive ? 0.45 : 1}
                  data-slot="chart-slice"
                  data-active={isActive ? "" : undefined}
                  data-dimmed={
                    activeIndex !== null && !isActive ? "" : undefined
                  }
                  className="cursor-pointer transition-opacity duration-150 ease-out motion-reduce:transition-none"
                />
              );
            }}
          />
        </RechartsPieChart>
      </div>
      {sliceLabels.length > 0 ? (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
        >
          {sliceLabels.map((label) => (
            <span
              key={label.id}
              data-slot="chart-slice-label"
              data-dimmed={
                activeIndex !== null && activeIndex !== label.index
                  ? ""
                  : undefined
              }
              // Each chart color pairs with a text token that holds at least
              // 4.5:1 on that fill.
              className={cn(
                "absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap font-semibold tabular-nums transition-opacity duration-150 ease-out data-dimmed:opacity-45 motion-reduce:transition-none",
                sliceLabelClasses[kind][size],
              )}
              style={{
                left: `${label.left}%`,
                top: `${label.top}%`,
                color: `var(--${label.color}-foreground)`,
              }}
            >
              <bdi>{label.reading}</bdi>
            </span>
          ))}
        </span>
      ) : null}
      {kind === "donut" && (centerLabel || centerValue) && size !== "spark" ? (
        <span
          data-slot="chart-donut-center"
          className={cn(
            "pointer-events-none absolute grid justify-items-center gap-0.5 text-center",
            // Keep the reading inside the hole, which shrinks for labelled
            // rings; a half ring seats it on the flat edge.
            arc === "half"
              ? cn(
                  "bottom-1/2 content-end",
                  showSliceLabels
                    ? "inset-x-[30%] top-[30%]"
                    : "inset-x-[24%] top-[24%]",
                )
              : cn(
                  "place-content-center",
                  showSliceLabels ? "inset-[30%]" : "inset-[24%]",
                ),
          )}
        >
          {centerValue ? (
            <span
              className={cn(
                "max-w-full break-words font-semibold tabular-nums text-balance text-foreground",
                arc === "half" && showSliceLabels
                  ? compactCenterValueClasses[size]
                  : centerValueClasses[size],
              )}
            >
              <bdi>{centerValue}</bdi>
            </span>
          ) : null}
          {centerLabel ? (
            <span className="max-w-full break-words text-caption text-balance text-foreground-secondary">
              {centerLabel}
            </span>
          ) : null}
        </span>
      ) : null}
      {/* Keyboard readings are announced here; pointer users read the tooltip. */}
      <span aria-live="polite" aria-atomic="true" className="sr-only">
        {interaction === "keyboard" && activeEntry ? (
          <>
            {activeEntry.datum.category}:{" "}
            {formatValue(activeEntry.datum.value, activeEntry.datum)}
            {activeEntry.datum.percentage === undefined ? null : (
              <>
                ,{" "}
                {formatPercentage(
                  activeEntry.datum.percentage,
                  activeEntry.datum,
                )}
              </>
            )}
          </>
        ) : null}
      </span>
      {showTooltip ? (
        <TooltipPrimitive.Root open={activeEntry !== undefined}>
          {/* Portaled so it is never clipped by the plot or a narrow card. */}
          <TooltipPrimitive.Portal>
            <TooltipPrimitive.Positioner
              key={activeIndex ?? "idle"}
              anchor={activeIndex === null ? undefined : getAnchor(activeIndex)}
              side="top"
              sideOffset={12}
              className="isolate z-50"
            >
              <TooltipPrimitive.Popup className="pointer-events-none outline-none">
                {activeEntry ? (
                  <ChartTooltip
                    label={activeEntry.datum.category}
                    items={tooltipItems}
                    formatValue={(value, item) =>
                      item.id === "percentage"
                        ? formatPercentage(value, activeEntry.datum)
                        : formatValue(value, activeEntry.datum)
                    }
                  />
                ) : null}
              </TooltipPrimitive.Popup>
            </TooltipPrimitive.Positioner>
          </TooltipPrimitive.Portal>
        </TooltipPrimitive.Root>
      ) : null}
    </div>
  );
}

function DistributionChart({
  "aria-describedby": ariaDescribedby,
  "aria-labelledby": ariaLabelledby,
  arc = "full",
  categoryLabel = "Category",
  centerLabel,
  centerValue,
  className,
  data,
  description,
  emptyDescription = "Data will appear when it becomes available.",
  emptyTitle = "No data available",
  formatPercentage = defaultFormatPercentage,
  formatValue = defaultFormatValue,
  headerAction,
  keyboardHint = "Use the arrow keys to move between segments.",
  kind,
  legendLabel = "Chart legend",
  legendPosition = "end",
  loading = false,
  loadingLabel = "Loading chart",
  plotClassName,
  percentageLabel = "Share",
  showHeader = true,
  size = "default",
  showLegend = size !== "spark",
  showTooltip = true,
  sliceLabel = "none",
  title,
  valueLabel = "Value",
  variant = "default",
  ...props
}: DonutChartProps & { kind: DistributionChartKind }) {
  const titleId = React.useId();
  const descriptionId = React.useId();
  const hintId = React.useId();
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null);
  const [interaction, setInteraction] = React.useState<"pointer" | "keyboard">(
    "pointer",
  );
  const entries = toEntries(data);
  const hasData = entries.some((entry) => entry.sliceIndex !== null);
  const activeId =
    activeIndex === null
      ? null
      : (entries.find((entry) => entry.sliceIndex === activeIndex)?.id ?? null);
  const handleActiveIndexChange = (
    index: number | null,
    source: "pointer" | "keyboard",
  ) => {
    setActiveIndex(index);
    setInteraction(source);
  };
  const legendItems = entries.map<ChartLegendItem>((entry) => ({
    id: entry.id,
    label: entry.datum.category,
    color: entry.color,
    marker: kind === "donut" ? "dot" : "square",
    value: (
      <span className="inline-flex items-baseline gap-2">
        <bdi>{formatValue(entry.datum.value, entry.datum)}</bdi>
        {entry.datum.percentage === undefined ? null : (
          <bdi className="min-w-[4ch] font-normal text-foreground-secondary">
            {formatPercentage(entry.datum.percentage, entry.datum)}
          </bdi>
        )}
      </span>
    ),
  }));

  return (
    <ChartContainer
      {...props}
      aria-busy={loading || undefined}
      aria-describedby={ariaDescribedby ?? descriptionId}
      aria-labelledby={ariaLabelledby ?? titleId}
      className={cn(
        "min-w-0",
        // The container query context has no intrinsic width, so an inline
        // spark chart without a legend takes the plot's width explicitly.
        size === "spark" && !showLegend && "w-16 shrink-0",
        className,
      )}
      data-chart-kind={kind}
      data-show-header={showHeader}
      data-variant={variant}
      data-slice-label={sliceLabel}
      data-arc={kind === "donut" ? arc : undefined}
      size={size}
      plotClassName={cn(
        (loading || hasData) && [
          "min-h-0 flex-none justify-self-center",
          arc === "half" ? halfPlotSizeClasses[size] : plotSizeClasses[size],
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
      legend={
        !loading && hasData && showLegend ? (
          <ChartLegend
            items={legendItems}
            label={legendLabel}
            orientation="vertical"
            activeId={activeId}
            onActiveIdChange={(id) =>
              handleActiveIndexChange(
                entries.find((entry) => entry.id === id)?.sliceIndex ?? null,
                "pointer",
              )
            }
          />
        ) : undefined
      }
      legendPosition={legendPosition}
    >
      {loading ? (
        <ChartLoadingState
          label={loadingLabel}
          className={cn(
            "overflow-hidden",
            arc === "half" ? "rounded-t-full" : "rounded-full",
          )}
        />
      ) : hasData ? (
        <>
          <DistributionRenderer
            activeIndex={activeIndex}
            arc={kind === "donut" ? arc : "full"}
            centerLabel={centerLabel}
            centerValue={centerValue}
            entries={entries}
            formatPercentage={formatPercentage}
            formatValue={formatValue}
            hintId={hintId}
            interaction={interaction}
            kind={kind}
            onActiveIndexChange={handleActiveIndexChange}
            percentageLabel={percentageLabel}
            showTooltip={showTooltip}
            size={size}
            sliceLabel={sliceLabel}
            titleId={titleId}
            valueLabel={valueLabel}
            variant={variant}
          />
          <span id={hintId} className="sr-only">
            {keyboardHint}
          </span>
          <DistributionTable
            categoryLabel={categoryLabel}
            description={description}
            entries={entries}
            formatPercentage={formatPercentage}
            formatValue={formatValue}
            percentageLabel={percentageLabel}
            title={title}
            valueLabel={valueLabel}
          />
        </>
      ) : (
        <ChartEmptyState title={emptyTitle} description={emptyDescription} />
      )}
    </ChartContainer>
  );
}

function PieChart(props: PieChartProps) {
  return <DistributionChart {...props} kind="pie" />;
}

function DonutChart(props: DonutChartProps) {
  return <DistributionChart {...props} kind="donut" />;
}

export {
  DonutChart,
  PieChart,
  type DistributionChartDatum,
  type DistributionChartLegendPosition,
  type DistributionChartSliceLabel,
  type DistributionChartVariant,
  type DonutChartArc,
  type DonutChartProps,
  type PieChartProps,
};
