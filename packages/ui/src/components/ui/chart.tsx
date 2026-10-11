import * as React from "react";
import { cn } from "../../lib/utils";
import { Skeleton } from "./skeleton";

type ChartSize = "spark" | "sm" | "default" | "lg";
/** `end` places the legend beside the plot, wrapping below it when the container is narrow. */
type ChartLegendPosition = "top" | "bottom" | "end";
type ChartColor = "chart-1" | "chart-2" | "chart-3" | "chart-4" | "chart-5";
type ChartMarker = "line" | "dash" | "dot" | "square" | "diamond";

type ChartContainerProps = Omit<React.ComponentProps<"figure">, "children"> & {
  children: React.ReactNode;
  header?: React.ReactNode;
  legend?: React.ReactNode;
  legendPosition?: ChartLegendPosition;
  /** Extra classes for the plot region, e.g. a height that fits the chart form. */
  plotClassName?: string;
  size?: ChartSize;
};

type ChartHeaderProps = Omit<React.ComponentProps<"figcaption">, "title"> & {
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
};

type ChartLegendItem = {
  id: string;
  label: React.ReactNode;
  color: ChartColor;
  marker?: ChartMarker;
  /** Optional reading shown at the end of the row, e.g. a formatted value. */
  value?: React.ReactNode;
};

type ChartLegendProps = Omit<React.ComponentProps<"ul">, "children"> & {
  items: readonly ChartLegendItem[];
  label?: string;
  orientation?: "horizontal" | "vertical";
  /** Highlights the matching item and dims the rest, e.g. while a mark is hovered. */
  activeId?: string | null;
  /** Called on pointer enter/leave so the chart can highlight the matching mark. */
  onActiveIdChange?: (id: string | null) => void;
};

type ChartTooltipItem = {
  id: string;
  label: React.ReactNode;
  value: number;
  color?: ChartColor;
  marker?: ChartMarker;
};

type ChartTooltipProps = Omit<
  React.ComponentProps<"div">,
  "children" | "role"
> & {
  active?: boolean;
  label?: React.ReactNode;
  items: readonly ChartTooltipItem[];
  formatValue?: (value: number, item: ChartTooltipItem) => React.ReactNode;
};

type ChartEmptyStateProps = Omit<
  React.ComponentProps<"div">,
  "children" | "title"
> & {
  title?: React.ReactNode;
  description?: React.ReactNode;
  /** Decorative visual; accessible meaning belongs in the visible copy. */
  icon?: React.ReactNode;
  action?: React.ReactNode;
};

type ChartLoadingStateProps = Omit<
  React.ComponentProps<"div">,
  "children" | "role" | "aria-busy"
> & {
  /** Localizable loading announcement for assistive technology. */
  label?: string;
};

const chartSizeClasses: Record<ChartSize, string> = {
  spark: "h-16 min-h-16",
  sm: "min-h-48",
  default: "min-h-64",
  lg: "min-h-80",
};

const chartColorValues: Record<ChartColor, string> = {
  "chart-1": "var(--chart-1)",
  "chart-2": "var(--chart-2)",
  "chart-3": "var(--chart-3)",
  "chart-4": "var(--chart-4)",
  "chart-5": "var(--chart-5)",
};

function ChartMarkerSwatch({
  color,
  marker = "square",
}: {
  color: ChartColor;
  marker?: ChartMarker;
}) {
  const colorValue = chartColorValues[color];

  if (marker === "line" || marker === "dash") {
    return (
      <span
        data-slot="chart-marker"
        data-marker={marker}
        aria-hidden="true"
        className={cn(
          "w-4 shrink-0 border-t-2",
          marker === "dash" && "border-dashed",
        )}
        style={{ borderColor: colorValue }}
      />
    );
  }

  return (
    <span
      data-slot="chart-marker"
      data-marker={marker}
      aria-hidden="true"
      className={cn(
        "size-2.5 shrink-0 ring-1 ring-inset ring-foreground-secondary",
        marker === "dot" && "rounded-full",
        marker === "square" && "rounded-xs",
        marker === "diamond" && "rotate-45 rounded-[1px]",
      )}
      style={{ backgroundColor: colorValue }}
    />
  );
}

function ChartContainer({
  children,
  className,
  header,
  legend,
  legendPosition = "top",
  plotClassName,
  size = "default",
  ...props
}: ChartContainerProps) {
  const isEnd = legendPosition === "end";
  const legendRegion = legend ? (
    <div
      data-slot="chart-legend-region"
      className={cn("min-w-0", isEnd && "max-w-md flex-[1_1_12rem]")}
    >
      {legend}
    </div>
  ) : null;
  const plot = (
    <div
      data-slot="chart-plot"
      className={cn(
        "relative grid min-w-0 overflow-hidden",
        isEnd && "flex-[1_1_16rem]",
        chartSizeClasses[size],
        plotClassName,
      )}
    >
      {children}
    </div>
  );

  return (
    <figure
      data-slot="chart-container"
      data-size={size}
      data-legend-position={legendPosition}
      className={cn(
        "@container/chart-container grid min-w-0 gap-4 text-body text-foreground",
        className,
      )}
      {...props}
    >
      {header}
      {legendPosition === "top" ? legendRegion : null}
      {isEnd ? (
        <div
          data-slot="chart-body"
          className="flex min-w-0 flex-wrap items-center justify-center gap-x-8 gap-y-4"
        >
          {plot}
          {legendRegion}
        </div>
      ) : (
        plot
      )}
      {legendPosition === "bottom" ? legendRegion : null}
    </figure>
  );
}

function ChartHeader({
  action,
  className,
  description,
  title,
  ...props
}: ChartHeaderProps) {
  return (
    <figcaption
      data-slot="chart-header"
      className={cn(
        "flex min-w-0 flex-wrap items-start justify-between gap-3",
        className,
      )}
      {...props}
    >
      <span className="grid min-w-0 flex-[1_1_16rem] gap-1">
        <span className="break-words text-card-title font-semibold text-balance text-foreground">
          {title}
        </span>
        {description ? (
          <span className="max-w-2xl break-words text-body-sm text-pretty text-foreground-secondary">
            {description}
          </span>
        ) : null}
      </span>
      {action ? (
        <span data-slot="chart-header-action" className="shrink-0">
          {action}
        </span>
      ) : null}
    </figcaption>
  );
}

function ChartLegend({
  activeId = null,
  className,
  items,
  label = "Chart legend",
  onActiveIdChange,
  orientation = "horizontal",
  ...props
}: ChartLegendProps) {
  const hasValues = items.some((item) => item.value !== undefined);

  return (
    <ul
      data-slot="chart-legend"
      data-orientation={orientation}
      aria-label={label}
      className={cn(
        "min-w-0 gap-x-4 gap-y-2 text-body-sm text-foreground-secondary",
        orientation === "horizontal"
          ? "flex flex-wrap items-center"
          : cn(
              "grid",
              hasValues ? "justify-items-stretch" : "justify-items-start",
            ),
        className,
      )}
      {...props}
    >
      {items.map((item) => (
        <li
          key={item.id}
          data-active={activeId === item.id ? "" : undefined}
          data-dimmed={
            activeId !== null && activeId !== item.id ? "" : undefined
          }
          className="flex min-w-0 items-center gap-2 break-words transition-opacity duration-150 ease-out data-dimmed:opacity-50 motion-reduce:transition-none"
          onPointerEnter={
            onActiveIdChange ? () => onActiveIdChange(item.id) : undefined
          }
          onPointerLeave={
            onActiveIdChange ? () => onActiveIdChange(null) : undefined
          }
        >
          <ChartMarkerSwatch color={item.color} marker={item.marker} />
          <span className={cn("min-w-0", item.value !== undefined && "flex-1")}>
            {item.label}
          </span>
          {item.value !== undefined ? (
            <span
              data-slot="chart-legend-value"
              className="ms-auto shrink-0 ps-2 text-end font-medium tabular-nums text-foreground"
            >
              {item.value}
            </span>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

function ChartTooltip({
  active = true,
  className,
  formatValue,
  items,
  label,
  ...props
}: ChartTooltipProps) {
  if (!active || items.length === 0) {
    return null;
  }

  return (
    <div
      {...props}
      data-slot="chart-tooltip"
      role="tooltip"
      aria-live="polite"
      aria-atomic="true"
      className={cn(
        "grid min-w-40 max-w-[min(20rem,calc(100vw-2rem))] gap-2 rounded-md bg-popover p-3 text-body-sm text-popover-foreground shadow-md",
        className,
      )}
    >
      {label ? (
        <p className="break-words font-medium text-foreground">{label}</p>
      ) : null}
      <dl className="grid gap-1.5">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex min-w-0 items-baseline justify-between gap-4"
          >
            <dt className="flex min-w-0 items-center gap-2 break-words text-foreground-secondary">
              {item.color ? (
                <ChartMarkerSwatch color={item.color} marker={item.marker} />
              ) : null}
              <span className="min-w-0">{item.label}</span>
            </dt>
            <dd className="shrink-0 font-medium tabular-nums text-foreground">
              <bdi>
                {formatValue
                  ? formatValue(item.value, item)
                  : String(item.value)}
              </bdi>
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function ChartEmptyState({
  action,
  className,
  description = "Data will appear when it becomes available.",
  icon,
  title = "No data available",
  ...props
}: ChartEmptyStateProps) {
  return (
    <div
      data-slot="chart-empty-state"
      className={cn(
        "grid min-h-full place-content-center justify-items-center gap-3 p-6 text-center",
        className,
      )}
      {...props}
    >
      {icon ? (
        <span
          aria-hidden="true"
          className="flex size-10 items-center justify-center rounded-lg bg-surface-muted text-foreground-secondary [&_svg]:size-5"
        >
          {icon}
        </span>
      ) : null}
      <span className="grid max-w-md gap-1">
        <span className="break-words text-body font-medium text-balance text-foreground">
          {title}
        </span>
        {description ? (
          <span className="break-words text-body-sm text-pretty text-foreground-secondary">
            {description}
          </span>
        ) : null}
      </span>
      {action ? <span data-slot="chart-empty-action">{action}</span> : null}
    </div>
  );
}

function ChartLoadingState({
  className,
  label = "Loading chart",
  ...props
}: ChartLoadingStateProps) {
  return (
    <div
      data-slot="chart-loading-state"
      role="status"
      aria-busy="true"
      className={cn("grid min-h-full", className)}
      {...props}
    >
      <span className="sr-only">{label}</span>
      <Skeleton className="min-h-48 w-full motion-reduce:animate-none" />
    </div>
  );
}

export {
  ChartContainer,
  ChartEmptyState,
  ChartHeader,
  ChartLegend,
  ChartLoadingState,
  ChartTooltip,
  type ChartColor,
  type ChartContainerProps,
  type ChartEmptyStateProps,
  type ChartHeaderProps,
  type ChartLegendItem,
  type ChartLegendPosition,
  type ChartLegendProps,
  type ChartLoadingStateProps,
  type ChartMarker,
  type ChartSize,
  type ChartTooltipItem,
  type ChartTooltipProps,
};
