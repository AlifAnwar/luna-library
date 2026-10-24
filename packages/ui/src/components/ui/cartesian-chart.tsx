"use client";

import * as React from "react";
import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip";
import {
  Area,
  AreaChart as RechartsAreaChart,
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  Line,
  LineChart as RechartsLineChart,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
} from "recharts";
import { ChevronDownIcon, ChevronUpIcon, MinusIcon } from "../../icons";
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
  type ChartMarker,
  type ChartSize,
  type ChartTooltipItem,
} from "./chart";
import { trendIndicatorVariants } from "./trend-indicator";

type CartesianChartDatum = Record<string, string | number | null | undefined>;

type CartesianChartSeries = {
  dataKey: string;
  label: string;
  color?: ChartColor;
  marker?: ChartMarker;
};

type CartesianChartVariant = "default" | "modern";
type BarChartVariant =
  CartesianChartVariant | "segmented" | "segmented-list" | "meter";
type BarChartValueTone = "neutral" | "success" | "danger";
type BarChartLayout = "grouped" | "stacked";
type BarChartFill = "solid" | "gradient";
type BarChartFillMode = BarChartFill | "pattern";
type AreaChartFill = "solid" | "gradient";

type CartesianChartCommonProps = Omit<
  ChartContainerProps,
  "children" | "header" | "legend" | "title"
> & {
  title: string;
  description: string;
  data: readonly CartesianChartDatum[];
  series: readonly CartesianChartSeries[];
  categoryKey?: string;
  headerAction?: React.ReactNode;
  loading?: boolean;
  loadingLabel?: string;
  emptyTitle?: React.ReactNode;
  emptyDescription?: React.ReactNode;
  legendLabel?: string;
  showGrid?: boolean;
  showHeader?: boolean;
  showLegend?: boolean;
  showTooltip?: boolean;
  showXAxis?: boolean;
  showYAxis?: boolean;
  variant?: CartesianChartVariant;
  formatCategory?: (value: string | number) => string;
  formatValue?: (
    value: number,
    series: CartesianChartSeries,
    datum: CartesianChartDatum,
  ) => React.ReactNode;
  formatYAxis?: (value: number) => string;
  missingValueLabel?: string;
};

type LineChartProps = CartesianChartCommonProps;
type BarChartProps = Omit<CartesianChartCommonProps, "variant"> & {
  fill?: BarChartFill;
  /** Ignored by the `segmented` variant, which always draws one part-to-whole bar. */
  layout?: BarChartLayout;
  /**
   * `segmented` draws a single horizontal bar where each data row is a
   * segment sized by its share of the first series' total.
   * `segmented-list` draws the same bar thin, with a row per segment below it
   * listing the remaining series (or the share when there is only one).
   * `meter` draws one tick meter per data row, filled to the first series'
   * value out of `max`; the remaining series render as trend pills.
   */
  variant?: BarChartVariant;
  /** Scale maximum for the `meter` variant. Defaults to 100. */
  max?: number;
  /**
   * Colors a `segmented-list` value by what it means, e.g. a faster time.
   * Keep a visible sign or label in the formatted value; color is never the only cue.
   */
  getValueTone?: (
    value: number,
    series: CartesianChartSeries,
    datum: CartesianChartDatum,
  ) => BarChartValueTone;
};
type AreaChartProps = CartesianChartCommonProps & {
  fill?: AreaChartFill;
};

type CartesianChartKind = "line" | "bar" | "area";

const chartColors: readonly ChartColor[] = [
  "chart-1",
  "chart-2",
  "chart-3",
  "chart-4",
  "chart-5",
];

const chartMarkers: readonly ChartMarker[] = [
  "line",
  "dash",
  "dot",
  "square",
  "diamond",
];

const chartOutlineValue = "var(--chart-outline)";

const lineDashPatterns: readonly (string | undefined)[] = [
  undefined,
  "8 4",
  "2 4",
  "10 4 2 4",
  "1 3",
];

const modernBarRadius: [number, number, number, number] = [8, 8, 0, 0];

// One hue stepped toward the surface: segments share a measure, so they read
// as parts of one whole rather than competing identities. Labels carry identity.
const segmentedColorSteps = [100, 56, 34, 22, 14] as const;

const segmentedPlotClasses: Record<ChartSize, string> = {
  spark: "h-3 min-h-3",
  sm: "min-h-24",
  default: "min-h-28",
  lg: "min-h-36",
};

const segmentValueToneClasses: Record<BarChartValueTone, string> = {
  neutral: "text-foreground",
  // --success alone is 4.3:1 on the surface; nudged toward ink for AA text.
  success:
    "text-[color:color-mix(in_oklab,var(--success)_78%,var(--foreground))]",
  danger: "text-danger",
};

const meterTickCount = 36;

const meterTrendIcons = {
  up: ChevronUpIcon,
  down: ChevronDownIcon,
  neutral: MinusIcon,
} as const;

const meterTrendIconClasses: Record<BarChartValueTone, string> = {
  neutral: "text-foreground-secondary",
  success: "text-success",
  danger: "text-danger",
};

// The active segment steps up from its resting tint to the full series color.
const segmentStateClasses =
  "[--chart-segment-color:var(--chart-segment-rest)] data-active:[--chart-segment-color:var(--chart-segment-active)] data-dimmed:opacity-50 transition-opacity duration-150 ease-out";

function getSeriesColor(
  series: CartesianChartSeries,
  index: number,
): ChartColor {
  return series.color ?? chartColors[index % chartColors.length]!;
}

function getSeriesMarker(
  series: CartesianChartSeries,
  index: number,
): ChartMarker {
  return series.marker ?? chartMarkers[index % chartMarkers.length]!;
}

function colorValue(color: ChartColor) {
  return `var(--${color})`;
}

function formatCategoryValue(
  value: string | number | null | undefined,
  formatter?: (value: string | number) => string,
) {
  if (value === null || value === undefined) {
    return "";
  }

  return formatter ? formatter(value) : String(value);
}

function numericValue(value: CartesianChartDatum[string]) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function formatShare(value: number, total: number) {
  return `${Math.round((value / total) * 1000) / 10}%`;
}

function segmentStyle(color: string, index: number): React.CSSProperties {
  const step =
    segmentedColorSteps[Math.min(index, segmentedColorSteps.length - 1)]!;

  return {
    "--chart-segment-active": color,
    "--chart-segment-rest": `color-mix(in oklab, ${color} ${step}%, transparent)`,
  } as React.CSSProperties;
}

function segmentState(index: number, activeIndex: number | null) {
  return {
    "data-active": index === activeIndex ? "" : undefined,
    "data-dimmed":
      activeIndex !== null && index !== activeIndex ? "" : undefined,
  };
}

type SegmentedChartProps = Pick<
  CartesianChartCommonProps,
  "data" | "formatCategory" | "missingValueLabel"
> & {
  categoryKey: string;
  formatValue: NonNullable<CartesianChartCommonProps["formatValue"]>;
  getValueTone?: BarChartProps["getValueTone"];
  listSeries: readonly CartesianChartSeries[];
  mode: "labels" | "bar" | "list";
  series: CartesianChartSeries;
};

function SegmentedChart({ listSeries, mode, ...props }: SegmentedChartProps) {
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null);
  const bar = (
    <SegmentedBar
      {...props}
      activeIndex={activeIndex}
      onActiveIndexChange={setActiveIndex}
      showLabels={mode === "labels"}
    />
  );

  if (mode !== "list") {
    return bar;
  }

  return (
    <div className="grid min-w-0 content-start gap-4">
      <div className="h-3">{bar}</div>
      <SegmentList
        {...props}
        activeIndex={activeIndex}
        columns={listSeries}
        onActiveIndexChange={setActiveIndex}
      />
    </div>
  );
}

function SegmentList({
  activeIndex,
  categoryKey,
  columns,
  data,
  formatCategory,
  formatValue,
  getValueTone,
  missingValueLabel,
  onActiveIndexChange,
  series,
}: Omit<SegmentedChartProps, "listSeries" | "mode"> & {
  activeIndex: number | null;
  columns: readonly CartesianChartSeries[];
  onActiveIndexChange: (index: number | null) => void;
}) {
  const color = colorValue(getSeriesColor(series, 0));

  return (
    <ul
      aria-hidden="true"
      data-slot="chart-segment-list"
      className="grid min-w-0 gap-x-6"
      style={{
        gridTemplateColumns: `minmax(0, 1fr) repeat(${columns.length}, auto)`,
      }}
    >
      {data.map((datum, index) => {
        const category = formatCategoryValue(
          datum[categoryKey],
          formatCategory,
        );

        return (
          <li
            key={`${category}-${index}`}
            data-slot="chart-segment-row"
            {...segmentState(index, activeIndex)}
            className={cn(
              "col-span-full grid grid-cols-subgrid items-baseline py-1.5",
              segmentStateClasses,
            )}
            style={segmentStyle(color, index)}
            onPointerEnter={() => onActiveIndexChange(index)}
            onPointerLeave={() => onActiveIndexChange(null)}
          >
            <span className="flex min-w-0 items-center gap-2.5">
              <span
                className="size-2 shrink-0 rounded-full bg-(--chart-segment-color) transition-[background-color] duration-150 ease-out"
                style={{
                  boxShadow: `inset 0 0 0 1px ${chartOutlineValue}`,
                }}
              />
              <span className="truncate text-body-sm text-foreground-secondary">
                {category}
              </span>
            </span>
            {columns.map((column) => {
              const value = numericValue(datum[column.dataKey]);
              const tone =
                value === null
                  ? "neutral"
                  : (getValueTone?.(value, column, datum) ?? "neutral");

              return (
                <span
                  key={column.dataKey}
                  data-tone={tone}
                  className={cn(
                    "text-end text-body-sm tabular-nums",
                    segmentValueToneClasses[tone],
                  )}
                >
                  <bdi>
                    {value === null
                      ? missingValueLabel
                      : formatValue(value, column, datum)}
                  </bdi>
                </span>
              );
            })}
          </li>
        );
      })}
    </ul>
  );
}

function SegmentedBar({
  activeIndex,
  categoryKey,
  data,
  formatCategory,
  formatValue,
  onActiveIndexChange,
  series,
  showLabels,
}: Pick<CartesianChartCommonProps, "data" | "formatCategory"> & {
  activeIndex: number | null;
  categoryKey: string;
  formatValue: NonNullable<CartesianChartCommonProps["formatValue"]>;
  onActiveIndexChange: (index: number | null) => void;
  series: CartesianChartSeries;
  showLabels: boolean;
}) {
  const color = colorValue(getSeriesColor(series, 0));

  return (
    <ol
      aria-hidden="true"
      data-slot="chart-segmented-bar"
      className={cn("flex h-full min-w-0", showLabels ? "gap-1" : "gap-0.5")}
    >
      {data.map((datum, index) => {
        const value = numericValue(datum[series.dataKey]) ?? 0;
        const category = formatCategoryValue(
          datum[categoryKey],
          formatCategory,
        );
        const formattedValue = formatValue(value, series, datum);

        return (
          <TooltipPrimitive.Root
            key={`${category}-${index}`}
            trackCursorAxis="x"
          >
            <TooltipPrimitive.Trigger
              delay={0}
              closeDelay={0}
              onPointerEnter={() => onActiveIndexChange(index)}
              onPointerLeave={() => onActiveIndexChange(null)}
              render={
                <li
                  data-slot="chart-segment"
                  {...segmentState(index, activeIndex)}
                  className={cn(
                    "flex min-w-0 basis-0 flex-col",
                    segmentStateClasses,
                  )}
                  style={{ ...segmentStyle(color, index), flexGrow: value }}
                />
              }
            >
              {showLabels ? (
                <span className="grid min-w-0 flex-1 content-start gap-0.5 border-s-2 border-(--chart-segment-color) ps-2.5 pt-1 pb-3 transition-[border-color] duration-150 ease-out">
                  <span className="truncate text-body-sm text-foreground-secondary">
                    {category}
                  </span>
                  <span className="truncate text-body font-medium tabular-nums text-foreground">
                    <bdi>{formattedValue}</bdi>
                  </span>
                </span>
              ) : null}
              <span
                className={cn(
                  "h-3 shrink-0 bg-(--chart-segment-color) transition-[background-color] duration-150 ease-out",
                  showLabels ? "rounded-e-xs rounded-es-xs" : "rounded-xs",
                )}
                style={{
                  boxShadow: `inset 0 0 0 1px ${chartOutlineValue}`,
                }}
              />
            </TooltipPrimitive.Trigger>
            {/* Portaled so narrow segments and the clipped plot never cut it off. */}
            <TooltipPrimitive.Portal>
              <TooltipPrimitive.Positioner
                side="top"
                sideOffset={8}
                className="isolate z-50"
              >
                <TooltipPrimitive.Popup className="outline-none">
                  <ChartTooltip
                    label={category}
                    items={[
                      {
                        id: series.dataKey,
                        label: series.label,
                        value,
                        color: getSeriesColor(series, 0),
                        marker: "square",
                      },
                    ]}
                    formatValue={() => formattedValue}
                  />
                </TooltipPrimitive.Popup>
              </TooltipPrimitive.Positioner>
            </TooltipPrimitive.Portal>
          </TooltipPrimitive.Root>
        );
      })}
    </ol>
  );
}

function MeterList({
  categoryKey,
  data,
  formatCategory,
  formatValue,
  getValueTone,
  max,
  series,
}: Pick<CartesianChartCommonProps, "data" | "formatCategory" | "series"> & {
  categoryKey: string;
  formatValue: NonNullable<CartesianChartCommonProps["formatValue"]>;
  getValueTone?: BarChartProps["getValueTone"];
  max: number;
}) {
  const [valueSeries, ...trendSeries] = series;
  const firstColor = chartColors.indexOf(getSeriesColor(valueSeries!, 0));

  return (
    <ul aria-hidden="true" data-slot="chart-meter-list" className="grid gap-5">
      {data.map((datum, index) => {
        const value = numericValue(datum[valueSeries!.dataKey]) ?? 0;
        const category = formatCategoryValue(
          datum[categoryKey],
          formatCategory,
        );
        const filled = Math.round(
          Math.min(Math.max(value / max, 0), 1) * meterTickCount,
        );
        // Each meter is its own entity, so rows take categorical hues in order.
        const color = chartColors[(firstColor + index) % chartColors.length]!;

        return (
          <li
            key={`${category}-${index}`}
            data-slot="chart-meter"
            className="grid min-w-0 gap-2.5"
            style={
              {
                "--chart-meter-color": colorValue(color),
              } as React.CSSProperties
            }
          >
            <span className="flex min-w-0 items-center gap-3">
              <span className="min-w-0 flex-1 truncate text-body-sm text-foreground-secondary">
                {category}
              </span>
              {trendSeries.map((item) => {
                const change = numericValue(datum[item.dataKey]);

                if (change === null) {
                  return null;
                }

                const direction =
                  change > 0 ? "up" : change < 0 ? "down" : "neutral";
                const tone = getValueTone?.(change, item, datum) ?? "neutral";
                const TrendIcon = meterTrendIcons[direction];

                return (
                  <span
                    key={item.dataKey}
                    data-slot="chart-meter-trend"
                    data-direction={direction}
                    data-tone={tone}
                    className={cn(trendIndicatorVariants({ tone }), "shrink-0")}
                  >
                    <TrendIcon
                      aria-hidden="true"
                      focusable="false"
                      className={cn(
                        "size-3.5 shrink-0",
                        meterTrendIconClasses[tone],
                      )}
                    />
                    {/* The icon carries the sign, so the pill shows the magnitude. */}
                    <bdi className="tabular-nums">
                      {formatValue(Math.abs(change), item, datum)}
                    </bdi>
                  </span>
                );
              })}
              <span className="shrink-0 text-body font-semibold tabular-nums text-foreground">
                <bdi>{formatValue(value, valueSeries!, datum)}</bdi>
              </span>
            </span>
            <span className="flex h-7 min-w-0 gap-[3px]">
              {Array.from({ length: meterTickCount }, (_, tick) => (
                <span
                  key={tick}
                  data-filled={tick < filled ? "" : undefined}
                  className="min-w-0 flex-1 rounded-[2px] bg-border data-filled:bg-(--chart-meter-color)"
                  style={
                    tick < filled
                      ? {
                          boxShadow: `inset 0 0 0 1px ${chartOutlineValue}`,
                        }
                      : undefined
                  }
                />
              ))}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

function CartesianTooltipContent({
  active,
  formatCategory,
  formatValue,
  label,
  payload,
  series,
}: TooltipContentProps & {
  formatCategory?: (value: string | number) => string;
  formatValue?: CartesianChartCommonProps["formatValue"];
  series: readonly CartesianChartSeries[];
}) {
  const datum = payload[0]?.payload as CartesianChartDatum | undefined;

  if (!active || !datum) {
    return null;
  }

  const items = series.flatMap<ChartTooltipItem>((item, index) => {
    const value = numericValue(datum[item.dataKey]);

    return value === null
      ? []
      : [
          {
            id: item.dataKey,
            label: item.label,
            value,
            color: getSeriesColor(item, index),
            marker: getSeriesMarker(item, index),
          },
        ];
  });

  return (
    <ChartTooltip
      active={active}
      label={formatCategoryValue(
        typeof label === "number" || typeof label === "string"
          ? label
          : undefined,
        formatCategory,
      )}
      items={items}
      formatValue={(value, item) => {
        const seriesItem = series.find(
          (candidate) => candidate.dataKey === item.id,
        );

        return seriesItem && formatValue
          ? formatValue(value, seriesItem, datum)
          : String(value);
      }}
    />
  );
}

function AccessibleChartTable({
  categoryKey,
  data,
  description,
  formatCategory,
  formatValue,
  missingValueLabel,
  series,
  title,
}: Pick<
  CartesianChartCommonProps,
  | "data"
  | "description"
  | "formatCategory"
  | "formatValue"
  | "missingValueLabel"
  | "series"
  | "title"
> & {
  categoryKey: string;
}) {
  return (
    <div className="sr-only">
      <table>
        <caption>
          {title}. {description}
        </caption>
        <thead>
          <tr>
            <th scope="col">Category</th>
            {series.map((item) => (
              <th key={item.dataKey} scope="col">
                {item.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((datum, rowIndex) => {
            const category = formatCategoryValue(
              datum[categoryKey],
              formatCategory,
            );

            return (
              <tr key={`${category}-${rowIndex}`}>
                <th scope="row">{category}</th>
                {series.map((item) => {
                  const value = numericValue(datum[item.dataKey]);

                  return (
                    <td key={item.dataKey}>
                      <bdi>
                        {value === null
                          ? missingValueLabel
                          : formatValue
                            ? formatValue(value, item, datum)
                            : String(value)}
                      </bdi>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function BarPatterns({
  idPrefix,
  series,
}: {
  idPrefix: string;
  series: readonly CartesianChartSeries[];
}) {
  return (
    <defs>
      {series.map((item, index) => {
        const fill = colorValue(getSeriesColor(item, index));
        const pattern = index % chartColors.length;

        return (
          <pattern
            key={item.dataKey}
            id={`${idPrefix}-${index}`}
            width="8"
            height="8"
            patternUnits="userSpaceOnUse"
          >
            <rect width="8" height="8" fill={fill} />
            {pattern === 1 ? (
              <path
                d="M-2 2L2-2M0 8L8 0M6 10L10 6"
                stroke="var(--surface)"
                strokeOpacity="0.72"
                strokeWidth="2"
              />
            ) : null}
            {pattern === 2 ? (
              <circle cx="4" cy="4" r="1.5" fill="var(--surface)" />
            ) : null}
            {pattern === 3 ? (
              <path
                d="M0 4H8"
                stroke="var(--surface)"
                strokeOpacity="0.72"
                strokeWidth="2"
              />
            ) : null}
            {pattern === 4 ? (
              <path
                d="M0 0L8 8M8 0L0 8"
                stroke="var(--surface)"
                strokeOpacity="0.72"
                strokeWidth="1.5"
              />
            ) : null}
          </pattern>
        );
      })}
    </defs>
  );
}

function BarGradients({
  idPrefix,
  series,
}: {
  idPrefix: string;
  series: readonly CartesianChartSeries[];
}) {
  return (
    <defs>
      {series.map((item, index) => {
        const fill = colorValue(getSeriesColor(item, index));

        return (
          <linearGradient
            key={item.dataKey}
            id={`${idPrefix}-${index}`}
            x1="0"
            y1="0%"
            x2="0"
            y2="100%"
          >
            <stop offset="0%" stopColor={fill} stopOpacity={1} />
            <stop offset="100%" stopColor={fill} stopOpacity={0.28} />
          </linearGradient>
        );
      })}
    </defs>
  );
}

function AreaFillGradients({
  idPrefix,
  series,
}: {
  idPrefix: string;
  series: readonly CartesianChartSeries[];
}) {
  return (
    <defs>
      {series.map((item, index) => {
        const fill = colorValue(getSeriesColor(item, index));

        return (
          <linearGradient
            key={item.dataKey}
            id={`${idPrefix}-${index}`}
            x1="0"
            y1="0%"
            x2="0"
            y2="100%"
          >
            <stop offset="0%" stopColor={fill} stopOpacity={0.3} />
            <stop offset="68%" stopColor={fill} stopOpacity={0.08} />
            <stop offset="100%" stopColor={fill} stopOpacity={0} />
          </linearGradient>
        );
      })}
    </defs>
  );
}

function CartesianAxes({
  categoryKey,
  formatCategory,
  formatYAxis,
  showGrid,
  showXAxis,
  showYAxis,
}: Pick<
  Required<CartesianChartCommonProps>,
  "categoryKey" | "showGrid" | "showXAxis" | "showYAxis"
> &
  Pick<CartesianChartCommonProps, "formatCategory" | "formatYAxis">) {
  const tickStyle = {
    fill: "var(--foreground-secondary)",
    fontSize: "var(--font-size-caption)",
  } as const;

  return (
    <>
      {showGrid ? (
        <CartesianGrid
          vertical={false}
          stroke="var(--border-subtle)"
          strokeDasharray="3 3"
        />
      ) : null}
      {showXAxis ? (
        <XAxis
          dataKey={categoryKey}
          axisLine={{ stroke: "var(--border)" }}
          tick={tickStyle}
          tickFormatter={(value: string | number) =>
            formatCategoryValue(value, formatCategory)
          }
          tickLine={false}
          tickMargin={10}
          minTickGap={20}
          padding={{ left: 8, right: 8 }}
          height={36}
        />
      ) : null}
      {showYAxis ? (
        <YAxis
          axisLine={false}
          tick={tickStyle}
          tickFormatter={(value: number) =>
            formatYAxis ? formatYAxis(value) : String(value)
          }
          tickLine={false}
          tickMargin={8}
          width="auto"
        />
      ) : null}
    </>
  );
}

function CartesianRenderer({
  categoryKey,
  data,
  description,
  formatCategory,
  formatValue,
  formatYAxis,
  areaFill,
  barFill,
  barLayout,
  kind,
  series,
  showGrid,
  showTooltip,
  showXAxis,
  showYAxis,
  title,
  variant,
}: Required<
  Pick<
    CartesianChartCommonProps,
    | "categoryKey"
    | "showGrid"
    | "showTooltip"
    | "showXAxis"
    | "showYAxis"
    | "variant"
  >
> &
  Pick<
    CartesianChartCommonProps,
    | "data"
    | "description"
    | "formatCategory"
    | "formatValue"
    | "formatYAxis"
    | "series"
    | "title"
  > & {
    areaFill: AreaChartFill;
    barFill: BarChartFillMode;
    barLayout: BarChartLayout;
    kind: CartesianChartKind;
  }) {
  const reactId = React.useId().replaceAll(":", "");
  const patternPrefix = `luna-chart-pattern-${reactId}`;
  const commonChartProps = {
    accessibilityLayer: true,
    data,
    desc: description,
    margin: { top: 8, right: 8, bottom: 0, left: 0 },
    responsive: true,
    role: "img",
    style: { width: "100%", height: "100%" },
    title,
  } as const;
  const axes = (
    <CartesianAxes
      categoryKey={categoryKey}
      formatCategory={formatCategory}
      formatYAxis={formatYAxis}
      showGrid={showGrid}
      showXAxis={showXAxis}
      showYAxis={showYAxis}
    />
  );
  const tooltip = showTooltip ? (
    <RechartsTooltip
      content={(props) => (
        <CartesianTooltipContent
          {...props}
          formatCategory={formatCategory}
          formatValue={formatValue}
          series={series}
        />
      )}
      cursor={{
        fill: "var(--surface-muted)",
        stroke: "var(--border)",
      }}
      isAnimationActive={false}
      wrapperStyle={{ outline: "none", zIndex: 20 }}
    />
  ) : null;

  if (kind === "bar") {
    const effectiveFill =
      barLayout === "stacked" && barFill === "gradient" ? "solid" : barFill;

    return (
      <RechartsBarChart
        {...commonChartProps}
        className="[&_svg:focus-visible]:outline-2 [&_svg:focus-visible]:outline-offset-[-2px] [&_svg:focus-visible]:outline-foreground"
        barCategoryGap="18%"
        barGap={4}
      >
        {effectiveFill === "gradient" ? (
          <BarGradients idPrefix={patternPrefix} series={series} />
        ) : effectiveFill === "pattern" ? (
          <BarPatterns idPrefix={patternPrefix} series={series} />
        ) : null}
        {axes}
        {tooltip}
        {series.map((item, index) => {
          const color = colorValue(getSeriesColor(item, index));

          return (
            <Bar
              key={item.dataKey}
              dataKey={item.dataKey}
              name={item.label}
              fill={
                effectiveFill === "solid"
                  ? color
                  : `url(#${patternPrefix}-${index})`
              }
              stroke={chartOutlineValue}
              strokeWidth={1}
              radius={
                variant !== "modern"
                  ? 2
                  : barLayout !== "stacked" || index === series.length - 1
                    ? modernBarRadius
                    : 0
              }
              stackId={barLayout === "stacked" ? "luna-stack" : undefined}
              maxBarSize={48}
              isAnimationActive={false}
            />
          );
        })}
      </RechartsBarChart>
    );
  }

  if (kind === "area") {
    return (
      <RechartsAreaChart
        {...commonChartProps}
        className="[&_svg:focus-visible]:outline-2 [&_svg:focus-visible]:outline-offset-[-2px] [&_svg:focus-visible]:outline-foreground"
      >
        {areaFill === "gradient" ? (
          <AreaFillGradients idPrefix={patternPrefix} series={series} />
        ) : null}
        {axes}
        {tooltip}
        {series.map((item, index) => {
          const color = colorValue(getSeriesColor(item, index));
          const strokeWidth = variant === "modern" ? 2.5 : 2;

          return (
            <React.Fragment key={item.dataKey}>
              <Area
                dataKey={item.dataKey}
                name={item.label}
                type={variant === "modern" ? "monotone" : "linear"}
                fill="transparent"
                fillOpacity={0}
                stroke={chartOutlineValue}
                strokeLinecap={variant === "modern" ? "round" : "butt"}
                strokeLinejoin={variant === "modern" ? "round" : "miter"}
                strokeDasharray={
                  lineDashPatterns[index % lineDashPatterns.length]
                }
                strokeWidth={strokeWidth + 2}
                dot={false}
                activeDot={false}
                connectNulls={false}
                isAnimationActive={false}
                legendType="none"
                tooltipType="none"
              />
              <Area
                dataKey={item.dataKey}
                name={item.label}
                type={variant === "modern" ? "monotone" : "linear"}
                fill={
                  areaFill === "gradient"
                    ? `url(#${patternPrefix}-${index})`
                    : color
                }
                fillOpacity={
                  areaFill === "gradient"
                    ? 1
                    : variant === "modern"
                      ? 0.16
                      : 0.12
                }
                stroke={color}
                strokeLinecap={variant === "modern" ? "round" : "butt"}
                strokeLinejoin={variant === "modern" ? "round" : "miter"}
                strokeDasharray={
                  lineDashPatterns[index % lineDashPatterns.length]
                }
                strokeWidth={strokeWidth}
                dot={getSeriesMarker(item, index) === "dot" ? { r: 3 } : false}
                activeDot={{ r: 4, strokeWidth: 2 }}
                connectNulls={false}
                isAnimationActive={false}
              />
            </React.Fragment>
          );
        })}
      </RechartsAreaChart>
    );
  }

  return (
    <RechartsLineChart
      {...commonChartProps}
      className="[&_svg:focus-visible]:outline-2 [&_svg:focus-visible]:outline-offset-[-2px] [&_svg:focus-visible]:outline-foreground"
    >
      {axes}
      {tooltip}
      {series.map((item, index) => {
        const color = colorValue(getSeriesColor(item, index));
        const strokeWidth = variant === "modern" ? 2.5 : 2;

        return (
          <React.Fragment key={item.dataKey}>
            <Line
              dataKey={item.dataKey}
              name={item.label}
              type={variant === "modern" ? "monotone" : "linear"}
              stroke={chartOutlineValue}
              strokeLinecap={variant === "modern" ? "round" : "butt"}
              strokeLinejoin={variant === "modern" ? "round" : "miter"}
              strokeDasharray={
                lineDashPatterns[index % lineDashPatterns.length]
              }
              strokeWidth={strokeWidth + 2}
              dot={false}
              activeDot={false}
              connectNulls={false}
              isAnimationActive={false}
              legendType="none"
              tooltipType="none"
            />
            <Line
              dataKey={item.dataKey}
              name={item.label}
              type={variant === "modern" ? "monotone" : "linear"}
              stroke={color}
              strokeLinecap={variant === "modern" ? "round" : "butt"}
              strokeLinejoin={variant === "modern" ? "round" : "miter"}
              strokeDasharray={
                lineDashPatterns[index % lineDashPatterns.length]
              }
              strokeWidth={strokeWidth}
              dot={getSeriesMarker(item, index) === "dot" ? { r: 3 } : false}
              activeDot={{ r: 4, strokeWidth: 2 }}
              connectNulls={false}
              isAnimationActive={false}
            />
          </React.Fragment>
        );
      })}
    </RechartsLineChart>
  );
}

function CartesianChart({
  "aria-describedby": ariaDescribedby,
  "aria-labelledby": ariaLabelledby,
  areaFill = "solid",
  barFill = "pattern",
  categoryKey = "category",
  className,
  data,
  description,
  emptyDescription = "Data will appear when it becomes available.",
  emptyTitle = "No data available",
  formatCategory,
  formatValue,
  formatYAxis,
  getValueTone,
  headerAction,
  barLayout = "grouped",
  kind,
  max = 100,
  legendLabel = "Chart legend",
  legendPosition = "top",
  loading = false,
  loadingLabel = "Loading chart",
  missingValueLabel = "No value",
  plotClassName,
  series,
  showGrid = true,
  showHeader = true,
  showLegend = series.length > 1,
  showTooltip = true,
  showXAxis = true,
  showYAxis = true,
  size = "default",
  title,
  variant = "default",
  ...props
}: Omit<CartesianChartCommonProps, "variant"> & {
  areaFill?: AreaChartFill;
  barFill?: BarChartFillMode;
  barLayout?: BarChartLayout;
  getValueTone?: BarChartProps["getValueTone"];
  kind: CartesianChartKind;
  max?: number;
  variant?: BarChartVariant;
}) {
  const titleId = React.useId();
  const descriptionId = React.useId();
  const isSegmentList = kind === "bar" && variant === "segmented-list";
  const segmentSeries =
    kind === "bar" && (variant === "segmented" || isSegmentList)
      ? series[0]
      : undefined;
  const meterSeries =
    kind === "bar" && variant === "meter" ? series[0] : undefined;
  const customSeries = segmentSeries ?? meterSeries;
  const segmentData = segmentSeries
    ? data.filter(
        (datum) => (numericValue(datum[segmentSeries.dataKey]) ?? 0) > 0,
      )
    : meterSeries
      ? data.filter(
          (datum) => numericValue(datum[meterSeries.dataKey]) !== null,
        )
      : data;
  const segmentTotal = segmentSeries
    ? segmentData.reduce(
        (total, datum) => total + numericValue(datum[segmentSeries.dataKey])!,
        0,
      )
    : 0;
  const tableSeries =
    segmentSeries && !isSegmentList ? [segmentSeries] : series;
  const tableFormatValue: CartesianChartCommonProps["formatValue"] =
    segmentSeries
      ? (formatValue ??
        ((value, item) =>
          item.dataKey === segmentSeries.dataKey
            ? formatShare(value, segmentTotal)
            : String(value)))
      : formatValue;
  const hasData = customSeries
    ? segmentData.length > 0
    : data.some((datum) =>
        series.some((item) => numericValue(datum[item.dataKey]) !== null),
      );
  const legendItems = series.map<ChartLegendItem>((item, index) => ({
    id: item.dataKey,
    label: item.label,
    color: getSeriesColor(item, index),
    marker: getSeriesMarker(item, index),
  }));

  return (
    <ChartContainer
      {...props}
      aria-busy={loading || undefined}
      aria-describedby={ariaDescribedby ?? descriptionId}
      aria-labelledby={ariaLabelledby ?? titleId}
      className={cn("min-w-0", className)}
      data-bar-layout={kind === "bar" && !customSeries ? barLayout : undefined}
      data-chart-kind={kind}
      data-fill={
        kind === "area"
          ? areaFill
          : kind === "bar" && !customSeries
            ? barLayout === "stacked" && barFill === "gradient"
              ? "solid"
              : barFill
            : undefined
      }
      data-show-header={showHeader}
      data-variant={variant}
      plotClassName={cn(
        isSegmentList || meterSeries
          ? "h-auto min-h-0"
          : segmentSeries && segmentedPlotClasses[size],
        plotClassName,
      )}
      size={size}
      header={
        <ChartHeader
          className={cn(!showHeader && "sr-only")}
          title={<span id={titleId}>{title}</span>}
          description={<span id={descriptionId}>{description}</span>}
          action={showHeader ? headerAction : undefined}
        />
      }
      legend={
        !loading && hasData && showLegend && !customSeries ? (
          <ChartLegend items={legendItems} label={legendLabel} />
        ) : undefined
      }
      legendPosition={legendPosition}
    >
      {loading ? (
        <ChartLoadingState label={loadingLabel} />
      ) : hasData ? (
        <>
          {meterSeries ? (
            <MeterList
              categoryKey={categoryKey}
              data={segmentData}
              formatCategory={formatCategory}
              formatValue={formatValue ?? ((value) => String(value))}
              getValueTone={getValueTone}
              max={max}
              series={series}
            />
          ) : segmentSeries ? (
            <SegmentedChart
              categoryKey={categoryKey}
              data={segmentData}
              formatCategory={formatCategory}
              formatValue={tableFormatValue!}
              getValueTone={getValueTone}
              listSeries={series.length > 1 ? series.slice(1) : series}
              missingValueLabel={missingValueLabel}
              mode={
                isSegmentList ? "list" : size === "spark" ? "bar" : "labels"
              }
              series={segmentSeries}
            />
          ) : (
            <CartesianRenderer
              areaFill={areaFill}
              barFill={barFill}
              categoryKey={categoryKey}
              data={data}
              description={description}
              formatCategory={formatCategory}
              formatValue={formatValue}
              formatYAxis={formatYAxis}
              barLayout={barLayout}
              kind={kind}
              series={series}
              showGrid={showGrid}
              showTooltip={showTooltip}
              showXAxis={showXAxis}
              showYAxis={showYAxis}
              title={title}
              variant={
                variant === "modern" || variant === "default"
                  ? variant
                  : "default"
              }
            />
          )}
          <AccessibleChartTable
            categoryKey={categoryKey}
            data={segmentData}
            description={description}
            formatCategory={formatCategory}
            formatValue={tableFormatValue}
            missingValueLabel={missingValueLabel}
            series={tableSeries}
            title={title}
          />
        </>
      ) : (
        <ChartEmptyState title={emptyTitle} description={emptyDescription} />
      )}
    </ChartContainer>
  );
}

function LineChart(props: LineChartProps) {
  return <CartesianChart {...props} kind="line" />;
}

function BarChart({
  fill,
  layout = "grouped",
  variant,
  ...props
}: BarChartProps) {
  const barFill = fill ?? (variant === "modern" ? "solid" : "pattern");

  return (
    <CartesianChart
      {...props}
      barFill={barFill}
      barLayout={layout}
      kind="bar"
      variant={variant}
    />
  );
}

function AreaChart({ fill = "solid", ...props }: AreaChartProps) {
  return <CartesianChart {...props} areaFill={fill} kind="area" />;
}

export {
  AreaChart,
  BarChart,
  LineChart,
  type AreaChartProps,
  type AreaChartFill,
  type BarChartFill,
  type BarChartLayout,
  type BarChartProps,
  type BarChartValueTone,
  type BarChartVariant,
  type CartesianChartDatum,
  type CartesianChartSeries,
  type CartesianChartVariant,
  type LineChartProps,
};
