"use client";

import * as React from "react";

import { cn } from "../../lib/utils.js";
import { Checkbox } from "./checkbox.js";
import { Skeleton } from "./skeleton.js";

type DataTableAlign = "start" | "center" | "end";

/**
 * The direction a column is currently sorted in. `undefined` is the unsorted
 * state — Luna never sorts data, so this only describes what the consumer has
 * already applied upstream.
 */
type DataTableSortDirection = "asc" | "desc";

const ariaSortValues = {
  asc: "ascending",
  desc: "descending",
} as const;

/**
 * The ids of the selected rows, as `getRowId` produces them, stringified. The
 * consuming application owns this list: Luna reads it to draw the checkboxes
 * and reports every toggle back, but never edits it itself.
 */
type DataTableSelectionState = readonly string[];

const alignClasses: Record<DataTableAlign, string> = {
  start: "text-start",
  center: "text-center",
  end: "text-end",
};

/**
 * A column describes how one vertical slice of the data is labelled and
 * rendered. `cell` receives the whole row, so consumers keep full type safety
 * over their own data shape without Luna having to know anything about it.
 */
type DataTableColumn<TData> = {
  /** Stable identity for the column. Also used as the React key. */
  id: string;
  /** Header content. Plain text gives the column its accessible name. */
  header: React.ReactNode;
  /** Renders the body cell for a row. */
  cell: (row: TData, rowIndex: number) => React.ReactNode;
  /** Text alignment for both the header and the body cells. */
  align?: DataTableAlign;
  /**
   * Renders this column's body cells as `<th scope="row">` instead of `<td>`,
   * so screen readers announce it as the label for the rest of the row. Use it
   * for the one column that identifies the record.
   */
  rowHeader?: boolean;
  /**
   * Announces the column as sortable, which renders `aria-sort` on the header
   * cell. It is an ARIA hint only: the sorting itself, and the control that
   * triggers it, stay with the consumer — pair it with `DataTableColumnHeader`
   * in `header`.
   */
  sortable?: boolean;
  /**
   * The direction this column is sorted in, mirrored into `aria-sort`. Only
   * read when `sortable` is true.
   */
  sortDirection?: DataTableSortDirection;
  /** Suggested column width, passed through to the header cell. */
  width?: string | number;
  headerClassName?: string;
  cellClassName?: string;
};

/**
 * Horizontally scrollable wrapper around the table.
 *
 * A scroll container is only reachable with a keyboard if something inside it
 * is focusable, and a plain data table has nothing focusable at all. So the
 * container joins the tab order — but only while it actually overflows, to
 * avoid a tab stop that does nothing. When it does, it is exposed as a named
 * `region` so screen reader users can find and scroll it.
 */
function DataTableContainer({
  className,
  children,
  role,
  tabIndex,
  ...props
}: React.ComponentProps<"div">) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const [isScrollable, setIsScrollable] = React.useState(false);

  React.useEffect(() => {
    const container = containerRef.current;

    if (!container || typeof ResizeObserver === "undefined") {
      return;
    }

    const measure = () => {
      setIsScrollable(container.scrollWidth > container.clientWidth);
    };

    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(container);

    // The table grows independently of the container when content changes, so
    // observe it too rather than relying on the container's own box changing.
    const table = container.firstElementChild;
    if (table) {
      observer.observe(table);
    }

    return () => observer.disconnect();
  }, []);

  const hasAccessibleName =
    props["aria-label"] !== undefined || props["aria-labelledby"] !== undefined;

  return (
    <div
      ref={containerRef}
      data-slot="data-table-container"
      data-scrollable={isScrollable ? "" : undefined}
      // An unnamed region is noise in the landmark list, so the role is only
      // added once the container is both scrollable and labelled.
      role={role ?? (isScrollable && hasAccessibleName ? "region" : undefined)}
      tabIndex={tabIndex ?? (isScrollable ? 0 : undefined)}
      className={cn(
        "w-full overflow-x-auto rounded-lg border border-border bg-card shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

function DataTableRoot({ className, ...props }: React.ComponentProps<"table">) {
  return (
    <table
      data-slot="data-table"
      className={cn(
        "w-full caption-top border-collapse text-body text-foreground",
        className,
      )}
      {...props}
    />
  );
}

function DataTableCaption({
  className,
  ...props
}: React.ComponentProps<"caption">) {
  return (
    <caption
      data-slot="data-table-caption"
      className={cn(
        "border-b border-border-subtle px-3 py-2 text-start text-body-sm text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

function DataTableHeader({
  className,
  ...props
}: React.ComponentProps<"thead">) {
  return (
    <thead
      data-slot="data-table-header"
      className={cn("border-b border-border bg-surface-subtle", className)}
      {...props}
    />
  );
}

function DataTableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="data-table-body"
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    />
  );
}

function DataTableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="data-table-row"
      className={cn(
        "border-b border-border-subtle transition-colors duration-150 hover:bg-muted/50 data-selected:bg-primary-subtle data-selected:hover:bg-primary-subtle",
        className,
      )}
      {...props}
    />
  );
}

// The native `align` attribute is deprecated and only accepts the legacy
// `left | center | right` values, so it is dropped in favour of Luna's own
// logical alignment, which follows the writing direction.
type DataTableHeadProps = Omit<React.ComponentProps<"th">, "align"> & {
  align?: DataTableAlign;
};

function DataTableHead({
  align = "start",
  className,
  scope = "col",
  ...props
}: DataTableHeadProps) {
  return (
    <th
      data-slot="data-table-head"
      scope={scope}
      className={cn(
        "h-table-row px-3 align-middle text-label font-medium whitespace-nowrap text-foreground-secondary",
        alignClasses[align],
        className,
      )}
      {...props}
    />
  );
}

type DataTableCellProps = Omit<React.ComponentProps<"td">, "align"> & {
  align?: DataTableAlign;
};

function DataTableCell({
  align = "start",
  className,
  ...props
}: DataTableCellProps) {
  return (
    <td
      data-slot="data-table-cell"
      className={cn(
        "h-table-row px-3 py-2 align-middle text-body text-foreground",
        alignClasses[align],
        className,
      )}
      {...props}
    />
  );
}

type DataTableEmptyStateProps = React.ComponentProps<"div"> & {
  icon?: React.ReactNode;
  title?: React.ReactNode;
  description?: React.ReactNode;
};

/**
 * The block shown in place of rows when there is nothing to list. It is
 * presentation only: deciding *why* the table is empty, and what to offer
 * instead, belongs to the application, which passes its own copy and actions.
 */
function DataTableEmptyState({
  className,
  icon,
  title = "No data",
  description,
  children,
  ...props
}: DataTableEmptyStateProps) {
  return (
    <div
      data-slot="data-table-empty-state"
      className={cn(
        "flex flex-col items-center justify-center gap-1 px-6 py-12 text-center",
        className,
      )}
      {...props}
    >
      {icon ? (
        <span
          aria-hidden="true"
          className="mb-2 flex items-center justify-center text-foreground-muted [&_svg]:size-6"
        >
          {icon}
        </span>
      ) : null}
      {title ? (
        <p className="text-body font-medium text-foreground">{title}</p>
      ) : null}
      {description ? (
        <p className="max-w-prose text-body text-muted-foreground">
          {description}
        </p>
      ) : null}
      {children ? <div className="mt-3">{children}</div> : null}
    </div>
  );
}

type DataTableProps<TData> = Omit<React.ComponentProps<"table">, "children"> & {
  /** Column definitions, in display order. */
  columns: readonly DataTableColumn<TData>[];
  /** The rows to render. Filtering, sorting and paging happen upstream. */
  data: readonly TData[];
  /**
   * Stable key per row. Defaults to the row's own `id` when it has a string or
   * number one, and to the array index otherwise — pass this explicitly when
   * rows can reorder, so React keeps cell state attached to the right record.
   */
  getRowId?: (row: TData, index: number) => React.Key;
  /** Describes the table. Rendered in a `<caption>`. */
  caption?: React.ReactNode;
  /** Keeps the caption in the accessibility tree but hides it visually. */
  hideCaption?: boolean;
  /** Swaps the rows for placeholders while data is in flight. */
  loading?: boolean;
  /** How many placeholder rows to show while loading. */
  loadingRowCount?: number;
  /** Announced politely while `loading` is true. */
  loadingLabel?: string;
  /** Replaces the rows when `data` is empty and `loading` is false. */
  emptyState?: React.ReactNode;
  /** Applied to the scroll container that wraps the table. */
  containerClassName?: string;
  /** Called per row to add row-level classes, e.g. a status tint. */
  rowClassName?: (row: TData, index: number) => string | undefined;
  /**
   * The currently selected row ids. Passing this together with
   * `onSelectionChange` adds the selection column, which is structural: it is
   * not one of `columns`, so column-visibility controls cannot hide it.
   */
  selectedRowIds?: DataTableSelectionState;
  /**
   * Receives the next selection as a new array. Luna only ever reports intent —
   * what a selection means, and how long it lives, stays with the consumer.
   */
  onSelectionChange?: (selectedRowIds: string[]) => void;
  /**
   * Rows this returns `false` for get a disabled checkbox and are left out of
   * select-all and of the select-all state.
   */
  isRowSelectable?: (row: TData, index: number) => boolean;
  /**
   * Names a row's checkbox. Without it the name is built from the row-header
   * column when there is one, and falls back to the row's position.
   */
  getRowSelectionLabel?: (row: TData, index: number) => string;
  /** Accessible name for the select-all checkbox. */
  selectAllLabel?: string;
  /** Leading half of a generated row-checkbox name, e.g. "Select row" + name. */
  selectRowLabel?: string;
};

function defaultGetRowId<TData>(row: TData, index: number): React.Key {
  if (typeof row === "object" && row !== null && "id" in row) {
    const { id } = row as { id: unknown };

    if (typeof id === "string" || typeof id === "number") {
      return id;
    }
  }

  return index;
}

/**
 * A generic, presentation-only table.
 *
 * Luna renders what it is given and reports interaction back through
 * callbacks. Fetching, filtering, sorting, paging and permissions stay in the
 * consuming application.
 */
function DataTable<TData>({
  columns,
  data,
  getRowId = defaultGetRowId,
  caption,
  hideCaption = false,
  loading = false,
  loadingRowCount = 5,
  loadingLabel = "Loading data",
  emptyState,
  className,
  containerClassName,
  rowClassName,
  selectedRowIds,
  onSelectionChange,
  isRowSelectable,
  getRowSelectionLabel,
  selectAllLabel = "Select all rows on this page",
  selectRowLabel = "Select row",
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  ...props
}: DataTableProps<TData>) {
  const captionId = React.useId();
  const selectRowLabelId = React.useId();
  const rowHeaderIdPrefix = React.useId();
  const isEmpty = !loading && data.length === 0;

  // Selection needs both halves to work, so a missing callback leaves the
  // column out entirely rather than rendering checkboxes that do nothing.
  const selectable =
    selectedRowIds !== undefined && onSelectionChange !== undefined;
  const hasRowHeader = columns.some((column) => column.rowHeader);
  const selectedIds = new Set(selectedRowIds ?? []);

  // Only the rows on screen take part in select-all. Rows a filter or another
  // page is hiding stay exactly as the consumer left them.
  const selectableIds =
    selectable && !loading
      ? data.flatMap((row, index) =>
          (isRowSelectable?.(row, index) ?? true)
            ? [String(getRowId(row, index))]
            : [],
        )
      : [];
  const selectedVisibleCount = selectableIds.filter((id) =>
    selectedIds.has(id),
  ).length;
  const allVisibleSelected =
    selectableIds.length > 0 && selectedVisibleCount === selectableIds.length;
  const someVisibleSelected = selectedVisibleCount > 0 && !allVisibleSelected;

  function toggleRow(id: string, checked: boolean) {
    const current = selectedRowIds ?? [];

    onSelectionChange?.(
      checked
        ? current.includes(id)
          ? [...current]
          : [...current, id]
        : current.filter((value) => value !== id),
    );
  }

  function toggleAllVisible(checked: boolean) {
    const current = selectedRowIds ?? [];

    if (!checked) {
      const visible = new Set(selectableIds);

      onSelectionChange?.(current.filter((id) => !visible.has(id)));
      return;
    }

    // Append only what is missing, so the order the consumer already has is
    // left alone.
    onSelectionChange?.([
      ...current,
      ...selectableIds.filter((id) => !selectedIds.has(id)),
    ]);
  }

  // The container needs its own name to be worth exposing as a region. Prefer
  // the caption, which is already the table's name, and otherwise reuse
  // whatever label the consumer put on the table.
  const containerLabel = caption
    ? { "aria-labelledby": captionId }
    : ariaLabelledBy
      ? { "aria-labelledby": ariaLabelledBy }
      : ariaLabel
        ? { "aria-label": ariaLabel }
        : {};

  return (
    <div data-slot="data-table-wrapper" className="w-full">
      {/*
       * A live region has to exist before its text changes to be announced
       * reliably, so it is always rendered and only its contents swap.
       */}
      <div role="status" aria-live="polite" className="sr-only">
        {loading ? loadingLabel : ""}
      </div>

      {/*
       * Rendered once and referenced by every row checkbox, so each one reads
       * as "Select row, <the row's own heading>" without repeating the text.
       */}
      {selectable && !getRowSelectionLabel && hasRowHeader ? (
        <span id={selectRowLabelId} className="sr-only">
          {selectRowLabel}
        </span>
      ) : null}

      <DataTableContainer className={containerClassName} {...containerLabel}>
        <DataTableRoot
          aria-busy={loading || undefined}
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledBy}
          className={className}
          {...props}
        >
          {caption ? (
            <DataTableCaption
              id={captionId}
              className={hideCaption ? "sr-only" : undefined}
            >
              {caption}
            </DataTableCaption>
          ) : null}

          <DataTableHeader>
            <DataTableRow className="hover:bg-transparent">
              {selectable ? (
                <DataTableHead align="center" className="w-px">
                  <Checkbox
                    checked={allVisibleSelected}
                    indeterminate={someVisibleSelected}
                    disabled={selectableIds.length === 0}
                    aria-label={selectAllLabel}
                    onCheckedChange={toggleAllVisible}
                  />
                </DataTableHead>
              ) : null}
              {columns.map((column) => (
                <DataTableHead
                  key={column.id}
                  align={column.align}
                  aria-sort={
                    column.sortable
                      ? (column.sortDirection &&
                          ariaSortValues[column.sortDirection]) ||
                        "none"
                      : undefined
                  }
                  className={column.headerClassName}
                  style={column.width ? { width: column.width } : undefined}
                >
                  {column.header}
                </DataTableHead>
              ))}
            </DataTableRow>
          </DataTableHeader>

          <DataTableBody>
            {loading
              ? Array.from({ length: loadingRowCount }, (_, rowIndex) => (
                  <DataTableRow
                    key={`data-table-skeleton-${rowIndex}`}
                    className="hover:bg-transparent"
                  >
                    {selectable ? (
                      <DataTableCell align="center" className="w-px">
                        <Skeleton className="size-4 rounded-sm" />
                      </DataTableCell>
                    ) : null}
                    {columns.map((column) => (
                      <DataTableCell key={column.id} align={column.align}>
                        <Skeleton className="h-4 w-full max-w-40" />
                      </DataTableCell>
                    ))}
                  </DataTableRow>
                ))
              : isEmpty
                ? // The empty state lives in a cell that spans every column so
                  // the table keeps a valid row structure and assistive
                  // technology still reads it as part of the table.
                  [
                    <DataTableRow
                      key="data-table-empty"
                      className="hover:bg-transparent"
                    >
                      <DataTableCell
                        colSpan={columns.length + (selectable ? 1 : 0) || 1}
                        className="h-auto p-0"
                      >
                        {emptyState ?? <DataTableEmptyState />}
                      </DataTableCell>
                    </DataTableRow>,
                  ]
                : data.map((row, rowIndex) => {
                    const rowId = String(getRowId(row, rowIndex));
                    const isSelected = selectable && selectedIds.has(rowId);
                    const isSelectable =
                      isRowSelectable?.(row, rowIndex) ?? true;
                    const explicitLabel = getRowSelectionLabel?.(row, rowIndex);
                    const rowHeaderId = `${rowHeaderIdPrefix}-${rowIndex}`;

                    return (
                      <DataTableRow
                        key={getRowId(row, rowIndex)}
                        data-selected={isSelected ? "" : undefined}
                        className={rowClassName?.(row, rowIndex)}
                      >
                        {selectable ? (
                          <DataTableCell align="center" className="w-px">
                            <Checkbox
                              checked={isSelected}
                              disabled={!isSelectable}
                              onCheckedChange={(checked) => {
                                toggleRow(rowId, checked);
                              }}
                              {...(explicitLabel
                                ? { "aria-label": explicitLabel }
                                : hasRowHeader
                                  ? {
                                      "aria-labelledby": `${selectRowLabelId} ${rowHeaderId}`,
                                    }
                                  : {
                                      "aria-label": `${selectRowLabel} ${rowIndex + 1}`,
                                    })}
                            />
                          </DataTableCell>
                        ) : null}
                        {columns.map((column) =>
                          column.rowHeader ? (
                            <DataTableHead
                              key={column.id}
                              id={rowHeaderId}
                              scope="row"
                              align={column.align}
                              className={cn(
                                "font-normal text-foreground",
                                column.cellClassName,
                              )}
                            >
                              {column.cell(row, rowIndex)}
                            </DataTableHead>
                          ) : (
                            <DataTableCell
                              key={column.id}
                              align={column.align}
                              className={column.cellClassName}
                            >
                              {column.cell(row, rowIndex)}
                            </DataTableCell>
                          ),
                        )}
                      </DataTableRow>
                    );
                  })}
          </DataTableBody>
        </DataTableRoot>
      </DataTableContainer>
    </div>
  );
}

export {
  DataTable,
  DataTableBody,
  DataTableCaption,
  DataTableCell,
  DataTableContainer,
  DataTableEmptyState,
  DataTableHead,
  DataTableHeader,
  DataTableRoot,
  DataTableRow,
};

export type {
  DataTableAlign,
  DataTableCellProps,
  DataTableColumn,
  DataTableEmptyStateProps,
  DataTableHeadProps,
  DataTableProps,
  DataTableSelectionState,
  DataTableSortDirection,
};
