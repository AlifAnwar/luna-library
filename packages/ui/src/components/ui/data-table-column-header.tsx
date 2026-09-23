"use client";

import * as React from "react";

import { ChevronDownIcon, ChevronUpIcon, UnfoldMoreIcon } from "../../icons";
import { cn } from "../../lib/utils";
import type { DataTableSortDirection } from "./data-table";

/**
 * The cycle a sortable header walks on each activation. Unsorted leads to
 * ascending, ascending to descending, and descending back to unsorted, so a
 * user can always undo a sort with the same control that applied it.
 */
const sortCycle: Record<string, DataTableSortDirection | undefined> = {
  unsorted: "asc",
  asc: "desc",
  desc: undefined,
};

type DataTableColumnHeaderProps = Omit<
  React.ComponentProps<"button">,
  "children" | "title" | "type"
> & {
  /** The column label. Plain text gives the control its accessible name. */
  title: React.ReactNode;
  /**
   * Forces a plain, non-interactive header. A header is also plain whenever no
   * `onSortChange` is given, so a column never renders a control that cannot
   * do anything.
   */
  sortable?: boolean;
  /** The direction this column is currently sorted in, or nothing when unsorted. */
  sortDirection?: DataTableSortDirection;
  /** Receives the next direction in the cycle. Sorting the data stays upstream. */
  onSortChange?: (direction: DataTableSortDirection | undefined) => void;
};

/**
 * A header label that doubles as the sort control for its column.
 *
 * It reports the next direction in the cycle and nothing else: Luna never
 * reorders rows, and the current direction is whatever the consumer passes
 * back in. Pair it with `sortable` and `sortDirection` on the matching
 * `DataTableColumn` so the header cell also carries `aria-sort`.
 */
function DataTableColumnHeader({
  title,
  sortable = true,
  sortDirection,
  onSortChange,
  className,
  disabled,
  onClick,
  ...props
}: DataTableColumnHeaderProps) {
  const isSortable = sortable && Boolean(onSortChange);

  if (!isSortable) {
    return (
      <span data-slot="data-table-column-header" className={className}>
        {title}
      </span>
    );
  }

  const SortIcon =
    sortDirection === "asc"
      ? ChevronUpIcon
      : sortDirection === "desc"
        ? ChevronDownIcon
        : UnfoldMoreIcon;

  return (
    <button
      type="button"
      data-slot="data-table-column-header"
      data-active={sortDirection ? "" : undefined}
      disabled={disabled}
      className={cn(
        // The negative inline margin cancels the button's own padding plus its
        // transparent border, so the label keeps the header cell's text edge
        // and stays aligned with the body cells below it, while the hover shape
        // still extends past that edge.
        "group/column-header -mx-[9px] inline-flex h-control-xs items-center gap-1 rounded-md border border-transparent px-2 align-middle text-label font-medium whitespace-nowrap text-foreground-secondary transition-colors duration-150 outline-none select-none hover:bg-muted hover:text-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 data-active:text-foreground",
        className,
      )}
      onClick={(event) => {
        onClick?.(event);

        if (event.defaultPrevented) {
          return;
        }

        onSortChange?.(sortCycle[sortDirection ?? "unsorted"]);
      }}
      {...props}
    >
      <span>{title}</span>
      {/*
       * The icon box is always the same size and always present, so cycling
       * the direction swaps the glyph without moving the label. The three
       * states differ by glyph as well as by weight, so the sort is never
       * carried by color alone.
       */}
      <SortIcon
        aria-hidden="true"
        className={cn(
          "size-3.5 shrink-0 transition-opacity duration-150 group-hover/column-header:opacity-100 group-focus-visible/column-header:opacity-100",
          sortDirection
            ? "text-foreground opacity-100"
            : "text-foreground-muted opacity-60",
        )}
      />
    </button>
  );
}

export { DataTableColumnHeader };
export type { DataTableColumnHeaderProps };
