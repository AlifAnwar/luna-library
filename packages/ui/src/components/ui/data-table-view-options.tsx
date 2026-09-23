"use client";

import * as React from "react";

import { ChevronDownIcon, ColumnsIcon } from "../../icons";
import { cn } from "../../lib/utils";
import { Badge } from "./badge";
import { Button } from "./button";
import { Checkbox } from "./checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTitle,
  PopoverTrigger,
} from "./popover";
import { Separator } from "./separator";

/** One switchable column in the view menu. */
type DataTableViewOption = {
  /** Matches the `id` of the `DataTableColumn` it controls. */
  id: string;
  label: string;
  /**
   * Set to `false` for a column the table cannot do without. It stays checked
   * and is shown as disabled rather than silently refusing the click.
   */
  canHide?: boolean;
};

/**
 * Which columns are visible, keyed by column id. A column with no entry counts
 * as visible, so consumers only have to track what they hide.
 */
type DataTableColumnVisibility = Record<string, boolean>;

type DataTableViewOptionsProps = {
  /** The columns offered in the menu, in display order. */
  columns: readonly DataTableViewOption[];
  visibility: DataTableColumnVisibility;
  /** Receives a new visibility object. The one passed in is never mutated. */
  onVisibilityChange: (visibility: DataTableColumnVisibility) => void;
  /** Trigger label, also the menu's accessible name. */
  label?: string;
  /** Label for the action that restores every hidden column. */
  resetLabel?: string;
  disabled?: boolean;
  className?: string;
  contentClassName?: string;
};

function isColumnVisible(
  visibility: DataTableColumnVisibility,
  id: string,
): boolean {
  return visibility[id] !== false;
}

/**
 * A controlled menu for showing and hiding columns.
 *
 * Luna renders the switches and reports the next visibility map; applying it
 * to the table, and persisting it anywhere, stays with the consumer.
 */
function DataTableViewOptions({
  columns,
  visibility,
  onVisibilityChange,
  label = "Columns",
  resetLabel = "Show all columns",
  disabled,
  className,
  contentClassName,
}: DataTableViewOptionsProps) {
  const [open, setOpen] = React.useState(false);
  const titleId = React.useId();
  const optionIdPrefix = React.useId();
  const hidableColumns = columns.filter((column) => column.canHide !== false);
  const hiddenCount = hidableColumns.filter(
    (column) => !isColumnVisible(visibility, column.id),
  ).length;

  function setColumnVisible(id: string, visible: boolean) {
    onVisibilityChange({ ...visibility, [id]: visible });
  }

  function showAllColumns() {
    const next = { ...visibility };

    for (const column of hidableColumns) {
      next[column.id] = true;
    }

    onVisibilityChange(next);
    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="outline"
            disabled={disabled}
            data-active={hiddenCount > 0 ? "" : undefined}
            className={cn(
              "max-w-full min-w-0 justify-between data-active:border-primary data-active:bg-primary-subtle data-active:text-primary-active",
              className,
            )}
          />
        }
      >
        <ColumnsIcon aria-hidden="true" className="size-4" />
        <span className="min-w-0 truncate">{label}</span>
        {hiddenCount > 0 ? (
          <Badge
            variant="secondary"
            className="min-w-5 justify-center px-1.5 tabular-nums"
          >
            {hiddenCount}
          </Badge>
        ) : null}
        <ChevronDownIcon aria-hidden="true" className="size-4" />
      </PopoverTrigger>

      <PopoverContent
        align="end"
        aria-labelledby={titleId}
        className={cn("w-64 p-1", contentClassName)}
      >
        {/* The trigger right above already names the menu, so the heading is
            there for assistive technology only. */}
        <PopoverTitle id={titleId} className="sr-only">
          {label}
        </PopoverTitle>

        <div
          role="group"
          aria-labelledby={titleId}
          className="max-h-72 overflow-y-auto overscroll-contain"
        >
          {columns.map((column, index) => {
            const optionId = `${optionIdPrefix}-${index}`;
            const locked = column.canHide === false;
            const checked = locked || isColumnVisible(visibility, column.id);

            return (
              <label
                key={column.id}
                htmlFor={optionId}
                className={cn(
                  "flex min-h-control-md w-full cursor-pointer items-center gap-2 rounded-md px-2.5 py-2 text-body text-foreground hover:bg-muted has-[:focus-visible]:bg-muted",
                  (disabled || locked) &&
                    "cursor-not-allowed text-muted-foreground opacity-50",
                )}
              >
                <Checkbox
                  id={optionId}
                  checked={checked}
                  disabled={disabled || locked}
                  onCheckedChange={(nextChecked) => {
                    setColumnVisible(column.id, nextChecked);
                  }}
                />
                <span className="min-w-0 flex-1 break-words text-start">
                  {column.label}
                </span>
              </label>
            );
          })}
        </div>

        {hiddenCount > 0 ? (
          <>
            <Separator className="my-1" />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="w-full justify-center"
              onClick={showAllColumns}
            >
              {resetLabel}
            </Button>
          </>
        ) : null}
      </PopoverContent>
    </Popover>
  );
}

export { DataTableViewOptions };
export type {
  DataTableColumnVisibility,
  DataTableViewOption,
  DataTableViewOptionsProps,
};
