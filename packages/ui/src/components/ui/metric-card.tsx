import * as React from "react";
import { cn } from "../../lib/utils.js";
import { Card, CardContent } from "./card.js";
import { Skeleton } from "./skeleton.js";
import { TrendIndicator, type MetricTrend } from "./trend-indicator.js";

type MetricStatus = "default" | "loading" | "empty" | "unavailable";

type MetricCardCommonProps = {
  label: React.ReactNode;
  /** A consumer-formatted value. It is hidden outside the default state. */
  value?: React.ReactNode;
  secondaryValue?: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  trend?: MetricTrend;
  status?: MetricStatus;
  /** Replaces the generic “No data” or “Unavailable” state copy. */
  stateLabel?: React.ReactNode;
  /** Localizable loading announcement for assistive technology. */
  loadingLabel?: string;
};

type MetricCardNativeProps = Omit<
  React.ComponentProps<typeof Card>,
  "children"
>;

type KpiCardProps = MetricCardNativeProps & MetricCardCommonProps;

type MetricCardProps = MetricCardNativeProps & MetricCardCommonProps;

type MetricCardFrameProps = MetricCardNativeProps &
  MetricCardCommonProps & {
    variant: "kpi" | "metric";
  };

const defaultStateLabels: Record<
  Exclude<MetricStatus, "default" | "loading">,
  string
> = {
  empty: "No data",
  unavailable: "Unavailable",
};

function MetricCardFrame({
  "aria-busy": ariaBusy,
  className,
  description,
  icon,
  label,
  loadingLabel = "Loading metric",
  secondaryValue,
  size,
  stateLabel,
  status = "default",
  trend,
  value,
  variant,
  ...props
}: MetricCardFrameProps) {
  const loading = status === "loading";
  const ready = status === "default";
  const resolvedSize = size ?? (variant === "metric" ? "sm" : "default");

  return (
    <Card
      {...props}
      data-slot={variant === "kpi" ? "kpi-card" : "metric-card"}
      data-state={status}
      aria-busy={loading ? true : ariaBusy}
      size={resolvedSize}
      className={cn("min-w-0", className)}
    >
      <span role="status" className="sr-only">
        {loading ? loadingLabel : ""}
      </span>
      <CardContent className="grid min-w-0 gap-4">
        <dl className="grid min-w-0 gap-2">
          <dt className="flex min-w-0 items-start justify-between gap-4 break-words text-label font-medium text-foreground-secondary">
            <span className="min-w-0">{label}</span>
            {icon ? (
              <span
                aria-hidden="true"
                className="flex size-8 shrink-0 items-center justify-center rounded-md bg-surface-muted text-foreground-secondary [&_svg]:size-4"
              >
                {icon}
              </span>
            ) : null}
          </dt>
          <dd className="min-w-0">
            {loading ? (
              <span aria-hidden="true" className="grid gap-2">
                <Skeleton className="h-8 w-2/3 motion-reduce:animate-none" />
                <Skeleton className="h-4 w-1/3 motion-reduce:animate-none" />
              </span>
            ) : ready ? (
              <span className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-1">
                <bdi
                  className={cn(
                    "min-w-0 break-words font-semibold tracking-tight tabular-nums text-foreground",
                    variant === "kpi" ? "text-page-title" : "text-heading-sm",
                  )}
                >
                  {value}
                </bdi>
                {secondaryValue ? (
                  <bdi className="break-words text-body-sm tabular-nums text-foreground-secondary">
                    {secondaryValue}
                  </bdi>
                ) : null}
              </span>
            ) : (
              <span className="break-words text-body-lg font-medium text-foreground-secondary">
                {stateLabel ?? defaultStateLabels[status]}
              </span>
            )}
          </dd>
        </dl>

        {!loading && (trend || description) ? (
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            {ready && trend ? <TrendIndicator {...trend} /> : null}
            {description ? (
              <p className="min-w-0 break-words text-body-sm text-pretty text-foreground-secondary">
                {description}
              </p>
            ) : null}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function KpiCard(props: KpiCardProps) {
  return <MetricCardFrame variant="kpi" {...props} />;
}

function MetricCard(props: MetricCardProps) {
  return <MetricCardFrame variant="metric" {...props} />;
}

export {
  KpiCard,
  MetricCard,
  type KpiCardProps,
  type MetricCardProps,
  type MetricStatus,
};
