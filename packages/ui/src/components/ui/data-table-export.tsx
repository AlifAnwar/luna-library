"use client";

import * as React from "react";

import { ChevronDownIcon, DownloadIcon } from "../../icons";
import { cn } from "../../lib/utils";
import { Button } from "./button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./dropdown-menu";

type DataTableExportFormat = "csv" | "excel";

/**
 * What the consumer is asked to export. Luna never decides what either scope
 * contains: "current-view" might be the visible page or every filtered row,
 * and "selected" is resolved from the selection the consumer already holds.
 */
type DataTableExportScope = "current-view" | "selected";

type DataTableExportRequest = {
  format: DataTableExportFormat;
  scope: DataTableExportScope;
};

type DataTableExportProps = {
  /** Emits the export intent. Building and downloading the file stays with the consumer. */
  onExport: (request: DataTableExportRequest) => void;
  /**
   * The formats the consumer can produce, in menu order. Anything left out is
   * not offered at all, and an empty list renders nothing.
   */
  formats?: readonly DataTableExportFormat[];
  /**
   * Leave undefined when the surface cannot export a selection; the selected
   * group is then omitted. At `0` the group stays, disabled, so the menu does
   * not change shape the moment a row is selected.
   */
  selectedCount?: number;
  /** Shows a busy trigger and ignores further export requests. */
  loading?: boolean;
  disabled?: boolean;
  /** Applied to the trigger. */
  className?: string;
};

const DEFAULT_FORMATS: readonly DataTableExportFormat[] = ["csv", "excel"];

const formatLabels: Record<DataTableExportFormat, string> = {
  csv: "CSV",
  excel: "Excel",
};

function selectedRowsLabel(count: number): string {
  return `${count} selected ${count === 1 ? "row" : "rows"}`;
}

/**
 * A menu that asks the application for an export.
 *
 * Luna renders the choices and reports `{ format, scope }`; which rows and
 * columns go in, how the file is written, what it is called and whether it is
 * built in the browser or by a backend job all stay with the consumer.
 */
function DataTableExport({
  onExport,
  formats = DEFAULT_FORMATS,
  selectedCount,
  loading = false,
  disabled = false,
  className,
}: DataTableExportProps) {
  const [open, setOpen] = React.useState(false);
  const hintId = React.useId();
  const blocked = loading || disabled;
  const uniqueFormats = [...new Set(formats)];

  if (uniqueFormats.length === 0) {
    return null;
  }

  const supportsSelected = selectedCount !== undefined;
  const hasSelection = supportsSelected && selectedCount > 0;

  function requestExport(request: DataTableExportRequest) {
    if (blocked) {
      return;
    }

    onExport(request);
  }

  return (
    <>
      <DropdownMenu
        // A menu left open when the consumer starts loading or disables the
        // control would still accept a second request, so it closes instead.
        open={open && !blocked}
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen && !blocked);
        }}
      >
        <DropdownMenuTrigger
          disabled={disabled}
          render={
            <Button
              type="button"
              variant="outline"
              data-slot="data-table-export"
              loading={loading}
              disabled={disabled}
              // Focus returns here after an item is chosen, which is usually
              // the moment the consumer starts loading. A natively disabled
              // button would drop that focus to the page, so the busy trigger
              // stays focusable and announces itself as unavailable instead.
              focusableWhenDisabled={loading && !disabled}
              // Not natively disabled while loading, so switch the hover
              // treatment off by hand rather than invite a click.
              className={cn(
                "max-w-full min-w-0 data-loading:pointer-events-none",
                className,
              )}
            />
          }
        >
          {loading ? null : (
            <DownloadIcon aria-hidden="true" className="size-4" />
          )}
          <span className="min-w-0 truncate">Export</span>
          <ChevronDownIcon aria-hidden="true" className="size-4" />
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuGroup>
            <DropdownMenuLabel>Current view</DropdownMenuLabel>
            {uniqueFormats.map((format) => (
              <DropdownMenuItem
                key={format}
                aria-label={`Export current view as ${formatLabels[format]}`}
                onClick={() => requestExport({ format, scope: "current-view" })}
              >
                {formatLabels[format]}
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>

          {supportsSelected ? (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuLabel className="tabular-nums">
                  Selected ({hasSelection ? selectedCount : 0})
                </DropdownMenuLabel>
                {hasSelection ? null : (
                  <p
                    id={hintId}
                    className="px-2 pb-1.5 text-caption text-muted-foreground"
                  >
                    Select rows to export them.
                  </p>
                )}
                {uniqueFormats.map((format) => (
                  <DropdownMenuItem
                    key={format}
                    // Disabled items stay reachable with the arrow keys, so
                    // the hint above tells a screen reader user why.
                    disabled={!hasSelection}
                    aria-describedby={hasSelection ? undefined : hintId}
                    aria-label={
                      hasSelection
                        ? `Export ${selectedRowsLabel(selectedCount)} as ${formatLabels[format]}`
                        : `Export selected rows as ${formatLabels[format]}`
                    }
                    onClick={() => requestExport({ format, scope: "selected" })}
                  >
                    {formatLabels[format]}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>

      {/*
       * `aria-busy` on a button is rarely announced, so the busy state gets its
       * own polite region. It is always mounted, empty until loading, which is
       * what makes the announcement reliable.
       */}
      <span role="status" className="sr-only">
        {loading ? "Export in progress" : ""}
      </span>
    </>
  );
}

export { DataTableExport };
export type {
  DataTableExportFormat,
  DataTableExportProps,
  DataTableExportRequest,
  DataTableExportScope,
};
