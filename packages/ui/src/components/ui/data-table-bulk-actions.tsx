"use client";

import * as React from "react";

import { cn } from "../../lib/utils";
import { Button } from "./button";
import { Separator } from "./separator";

type DataTableBulkActionsProps = React.ComponentProps<"div"> & {
  /**
   * How many rows the consumer currently has selected. The toolbar hides
   * itself at zero unless `alwaysVisible` is set.
   */
  selectedCount: number;
  /** Emits the intent to drop the selection. Clearing it stays with the consumer. */
  onClearSelection?: () => void;
  clearLabel?: string;
  /**
   * Replaces the default "3 selected" text. Take this over parsing the
   * default string when the surface has to be translated or pluralised.
   */
  selectedLabel?: (count: number) => React.ReactNode;
  /**
   * Keeps the toolbar mounted at zero selected, which holds the row's height
   * steady and keeps its live region in the DOM between selections.
   */
  alwaysVisible?: boolean;
};

/**
 * The surface that appears once rows are selected.
 *
 * It contributes the count, the layout and the clear action; the actions
 * themselves are children, because what can be done to a selection — and
 * whether it needs confirming first — is the application's to decide. Luna
 * runs nothing and confirms nothing.
 */
function DataTableBulkActions({
  selectedCount,
  onClearSelection,
  clearLabel = "Clear selection",
  selectedLabel,
  alwaysVisible = false,
  className,
  children,
  ...props
}: DataTableBulkActionsProps) {
  const hasSelection = selectedCount > 0;

  if (!hasSelection && !alwaysVisible) {
    return null;
  }

  return (
    <div
      data-slot="data-table-bulk-actions"
      data-active={hasSelection ? "" : undefined}
      className={cn(
        "flex w-full min-w-0 flex-wrap items-center gap-x-3 gap-y-2 rounded-lg border border-border bg-surface-subtle px-3 py-1.5",
        className,
      )}
      {...props}
    >
      {/*
       * The count is the one thing that changes as the user works, so it is
       * the live region; keeping the toolbar mounted with `alwaysVisible`
       * makes those announcements reliable. It also reserves the height of a
       * small control, so the row measures the same with actions and without
       * and the table below it does not jump when a selection starts.
       */}
      <p
        role="status"
        aria-atomic="true"
        className="flex min-h-control-sm items-center text-body-sm font-medium tabular-nums text-foreground"
      >
        {selectedLabel
          ? selectedLabel(selectedCount)
          : `${selectedCount} selected`}
      </p>

      {hasSelection && children ? (
        <>
          <Separator
            orientation="vertical"
            className="hidden h-5 sm:block"
            aria-hidden="true"
          />
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            {children}
          </div>
        </>
      ) : null}

      {hasSelection && onClearSelection ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="ms-auto"
          onClick={onClearSelection}
        >
          {clearLabel}
        </Button>
      ) : null}
    </div>
  );
}

export { DataTableBulkActions };
export type { DataTableBulkActionsProps };
