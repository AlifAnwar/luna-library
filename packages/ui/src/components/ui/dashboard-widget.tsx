import * as React from "react";
import { cn } from "../../lib/utils.js";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./card.js";
import { Skeleton } from "./skeleton.js";

type DashboardWidgetStatus = "default" | "loading" | "empty";

type DashboardWidgetProps = Omit<
  React.ComponentProps<typeof Card>,
  "children" | "role" | "title"
> & {
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  children?: React.ReactNode;
  /** Match the surrounding page's heading outline. Defaults to h2. */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
  status?: DashboardWidgetStatus;
  loadingLabel?: string;
  emptyTitle?: React.ReactNode;
  emptyDescription?: React.ReactNode;
  emptyAction?: React.ReactNode;
};

/**
 * A named card for dashboard content. Charts keep ownership of their own plot,
 * legend, tooltip and data states; use `showHeader={false}` when the widget
 * title should be the only visible heading above a chart.
 */
function DashboardWidget({
  "aria-busy": ariaBusy,
  "aria-describedby": ariaDescribedby,
  "aria-labelledby": ariaLabelledby,
  action,
  children,
  className,
  description,
  emptyAction,
  emptyDescription = "Data will appear when it becomes available.",
  emptyTitle = "No data available",
  headingLevel = 2,
  loadingLabel = "Loading widget",
  status = "default",
  title,
  ...props
}: DashboardWidgetProps) {
  const titleId = React.useId();
  const descriptionId = React.useId();
  const Heading = `h${headingLevel}` as const;
  const loading = status === "loading";

  return (
    <Card
      {...props}
      data-slot="dashboard-widget"
      data-state={status}
      role="region"
      aria-busy={loading || ariaBusy}
      aria-labelledby={ariaLabelledby ?? titleId}
      aria-describedby={
        ariaDescribedby ?? (description ? descriptionId : undefined)
      }
      className={cn("min-w-0", className)}
    >
      <CardHeader className="flex min-w-0 flex-wrap items-start justify-between gap-3">
        <div className="grid min-w-0 flex-[1_1_16rem] gap-1">
          <CardTitle>
            <Heading id={titleId} className="break-words text-balance">
              {title}
            </Heading>
          </CardTitle>
          {description ? (
            <CardDescription className="text-body-sm text-pretty break-words">
              <p id={descriptionId}>{description}</p>
            </CardDescription>
          ) : null}
        </div>
        {action ? (
          <CardAction className="ms-auto flex max-w-full flex-wrap items-center gap-2">
            {action}
          </CardAction>
        ) : null}
      </CardHeader>
      <CardContent className="min-w-0 flex-1">
        <span role="status" className="sr-only">
          {loading ? loadingLabel : ""}
        </span>
        {loading ? (
          <div
            data-slot="dashboard-widget-loading"
            aria-hidden="true"
            className="grid min-h-48 gap-3"
          >
            <Skeleton className="h-4 w-1/3 motion-reduce:animate-none" />
            <Skeleton className="min-h-40 w-full motion-reduce:animate-none" />
          </div>
        ) : status === "empty" ? (
          <div
            data-slot="dashboard-widget-empty"
            className="grid min-h-48 min-w-0 place-content-center justify-items-center gap-3 text-center"
          >
            <div className="grid min-w-0 max-w-md gap-1">
              <p className="break-words text-body font-medium text-balance">
                {emptyTitle}
              </p>
              {emptyDescription ? (
                <p className="break-words text-body-sm text-pretty text-foreground-secondary">
                  {emptyDescription}
                </p>
              ) : null}
            </div>
            {emptyAction ? <div>{emptyAction}</div> : null}
          </div>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
}

export {
  DashboardWidget,
  type DashboardWidgetProps,
  type DashboardWidgetStatus,
};
