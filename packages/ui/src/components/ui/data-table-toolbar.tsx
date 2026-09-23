import * as React from "react";

import { cn } from "../../lib/utils";

type DataTableToolbarProps = React.ComponentProps<"div">;

/**
 * A presentation-only layout for table controls. Search, filter, and reset
 * state remain owned by the consuming application.
 */
function DataTableToolbar({ className, ...props }: DataTableToolbarProps) {
  return (
    <div
      data-slot="data-table-toolbar"
      className={cn(
        "flex w-full min-w-0 flex-wrap items-center gap-2",
        className,
      )}
      {...props}
    />
  );
}

export { DataTableToolbar };
export type { DataTableToolbarProps };
