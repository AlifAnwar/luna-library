import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { ChevronDownIcon, ChevronUpIcon, MinusIcon } from "../../icons";
import { cn } from "../../lib/utils";

const trendIndicatorVariants = cva(
  "inline-flex min-w-0 w-fit items-center gap-1 rounded-full border px-2 py-0.5 text-caption font-medium text-foreground",
  {
    variants: {
      tone: {
        neutral: "border-border bg-surface-muted",
        success: "border-success-border bg-success-subtle",
        warning: "border-warning-border bg-warning-subtle",
        danger: "border-danger-border bg-danger-subtle",
        info: "border-info-border bg-info-subtle",
      },
    },
    defaultVariants: { tone: "neutral" },
  },
);

const trendIndicatorIconVariants = cva("size-3.5 shrink-0", {
  variants: {
    tone: {
      neutral: "text-foreground-secondary",
      success: "text-success",
      warning: "text-warning",
      danger: "text-danger",
      info: "text-info",
    },
  },
  defaultVariants: { tone: "neutral" },
});

type TrendDirection = "up" | "down" | "neutral";
type TrendTone = NonNullable<
  VariantProps<typeof trendIndicatorVariants>["tone"]
>;

type TrendToneProps =
  | {
      tone?: "neutral";
      toneLabel?: React.ReactNode;
    }
  | {
      tone: Exclude<TrendTone, "neutral">;
      /** Visible text that communicates the semantic tone without relying on color. */
      toneLabel: React.ReactNode;
    };

type TrendIndicatorContentProps = {
  direction: TrendDirection;
  value: React.ReactNode;
  /** Optional context such as “vs previous month”. */
  label?: React.ReactNode;
  /** Localizable direction text announced by assistive technology. */
  directionLabel?: string;
} & TrendToneProps;

type TrendIndicatorProps = Omit<React.ComponentProps<"span">, "children"> &
  TrendIndicatorContentProps;

type MetricTrend = TrendIndicatorContentProps & { className?: string };

const defaultDirectionLabels: Record<TrendDirection, string> = {
  up: "Increased",
  down: "Decreased",
  neutral: "No change",
};

const directionIcons = {
  up: ChevronUpIcon,
  down: ChevronDownIcon,
  neutral: MinusIcon,
} satisfies Record<
  TrendDirection,
  React.ComponentType<React.SVGProps<SVGSVGElement>>
>;

function TrendIndicator({
  className,
  direction,
  directionLabel,
  label,
  tone = "neutral",
  toneLabel,
  value,
  ...props
}: TrendIndicatorProps) {
  const DirectionIcon = directionIcons[direction];

  return (
    <span
      data-slot="trend-indicator"
      data-direction={direction}
      data-tone={tone}
      className={cn(trendIndicatorVariants({ tone }), className)}
      {...props}
    >
      <span className="sr-only">
        {directionLabel ?? defaultDirectionLabels[direction]}:{" "}
      </span>
      <DirectionIcon
        aria-hidden="true"
        focusable="false"
        className={trendIndicatorIconVariants({ tone })}
      />
      <bdi className="tabular-nums">{value}</bdi>
      {toneLabel ? <span>{toneLabel}</span> : null}
      {label ? <span>{label}</span> : null}
    </span>
  );
}

export {
  TrendIndicator,
  trendIndicatorVariants,
  type MetricTrend,
  type TrendDirection,
  type TrendIndicatorProps,
  type TrendTone,
};
