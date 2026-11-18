import * as React from "react";
import { cn } from "../../lib/utils.js";

type DashboardGridProps = React.ComponentProps<"div">;

type DashboardGridItemProps = React.ComponentProps<"div"> & {
  /** Columns occupied in the four-column layout. Spans above two fill the two-column layout. */
  span?: 1 | 2 | 3 | 4;
};

/** The grid responds to its own available width, including within a sidebar layout. */
function DashboardGrid({ children, className, ...props }: DashboardGridProps) {
  return (
    <div
      {...props}
      data-slot="dashboard-grid"
      className={cn("@container/dashboard min-w-0", className)}
    >
      <div
        data-slot="dashboard-grid-layout"
        className="grid min-w-0 grid-cols-1 items-stretch gap-4 @min-[40rem]/dashboard:grid-cols-2 @min-[64rem]/dashboard:grid-cols-4"
      >
        {children}
      </div>
    </div>
  );
}

function DashboardGridItem({
  className,
  span = 1,
  ...props
}: DashboardGridItemProps) {
  return (
    <div
      {...props}
      data-slot="dashboard-grid-item"
      data-span={span}
      className={cn(
        "min-w-0 [&>[data-slot=dashboard-widget]]:h-full",
        span >= 2 && "@min-[40rem]/dashboard:col-span-2",
        span === 2 && "@min-[64rem]/dashboard:col-span-2",
        span === 3 && "@min-[64rem]/dashboard:col-span-3",
        span === 4 && "@min-[64rem]/dashboard:col-span-4",
        className,
      )}
    />
  );
}

export {
  DashboardGrid,
  DashboardGridItem,
  type DashboardGridProps,
  type DashboardGridItemProps,
};
