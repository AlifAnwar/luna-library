import * as React from "react";
import { cn } from "../../lib/utils";

type MetricComparisonItem = {
  label: React.ReactNode;
  value: React.ReactNode;
  description?: React.ReactNode;
};

type MetricComparisonProps = Omit<React.ComponentProps<"dl">, "children"> & {
  items: readonly [
    MetricComparisonItem,
    MetricComparisonItem,
    ...MetricComparisonItem[],
  ];
};

function MetricComparison({
  className,
  items,
  ...props
}: MetricComparisonProps) {
  return (
    <dl
      data-slot="metric-comparison"
      className={cn(
        "grid min-w-0 grid-cols-[repeat(auto-fit,minmax(min(8rem,100%),1fr))] gap-4",
        className,
      )}
      {...props}
    >
      {items.map((item, index) => (
        <div
          key={index}
          data-slot="metric-comparison-item"
          className="grid min-w-0 gap-1"
        >
          <dt className="break-words text-label font-medium text-foreground-secondary">
            {item.label}
          </dt>
          <dd className="break-words text-body-lg font-semibold tabular-nums text-foreground">
            <bdi>{item.value}</bdi>
          </dd>
          {item.description ? (
            <dd className="break-words text-body-sm text-pretty text-foreground-secondary">
              {item.description}
            </dd>
          ) : null}
        </div>
      ))}
    </dl>
  );
}

export {
  MetricComparison,
  type MetricComparisonItem,
  type MetricComparisonProps,
};
