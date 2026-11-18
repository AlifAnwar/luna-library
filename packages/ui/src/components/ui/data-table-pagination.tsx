"use client";

import * as React from "react";

import {
  ChevronLeftIcon,
  ChevronRightIcon,
  FirstPageIcon,
  LastPageIcon,
} from "../../icons/index.js";
import { cn } from "../../lib/utils.js";
import { Button } from "./button.js";
import { Pagination, PaginationContent, PaginationItem } from "./pagination.js";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select.js";

type DataTablePaginationProps = Omit<
  React.ComponentProps<"nav">,
  "children" | "onChange"
> & {
  /**
   * The current page, 1-based. Luna clamps what it emits to the available
   * range but never corrects the value it is given.
   */
  page: number;
  /** How many pages there are in total. Anything below 1 is treated as 1. */
  pageCount: number;
  onPageChange: (page: number) => void;
  /** Rows per page. Required for the page-size control to appear. */
  pageSize?: number;
  pageSizeOptions?: readonly number[];
  /**
   * Receives the new page size and nothing else — Luna does not reset the page
   * or recalculate anything on the consumer's behalf. Omit it and the
   * page-size control is left out rather than rendered inert.
   */
  onPageSizeChange?: (pageSize: number) => void;
  /** Hides the first and last page buttons, leaving previous and next. */
  showFirstLast?: boolean;
  /** Disables every control, e.g. while a page is in flight. */
  disabled?: boolean;
  pageSizeLabel?: string;
  firstPageLabel?: string;
  previousPageLabel?: string;
  nextPageLabel?: string;
  lastPageLabel?: string;
  /** Replaces the "Page 2 of 12" status text. */
  renderPageStatus?: (page: number, pageCount: number) => React.ReactNode;
};

const defaultPageSizeOptions = [10, 25, 50, 100] as const;

/**
 * Controlled pagination for a data table.
 *
 * Every number is owned by the consumer. Luna only reports which page or page
 * size the user asked for, which keeps it usable against a server that pages
 * the rows as well as against an array held in memory.
 */
function DataTablePagination({
  page,
  pageCount,
  onPageChange,
  pageSize,
  pageSizeOptions = defaultPageSizeOptions,
  onPageSizeChange,
  showFirstLast = true,
  disabled = false,
  pageSizeLabel = "Rows per page",
  firstPageLabel = "Go to first page",
  previousPageLabel = "Go to previous page",
  nextPageLabel = "Go to next page",
  lastPageLabel = "Go to last page",
  renderPageStatus,
  className,
  "aria-label": ariaLabel = "Pagination",
  ...props
}: DataTablePaginationProps) {
  const pageSizeLabelId = React.useId();
  const lastPage = Math.max(1, Math.round(pageCount));
  const currentPage = Math.min(Math.max(1, Math.round(page)), lastPage);
  const isFirstPage = currentPage <= 1;
  const isLastPage = currentPage >= lastPage;
  const showPageSize = pageSize !== undefined && onPageSizeChange !== undefined;

  function goToPage(nextPage: number) {
    const clamped = Math.min(Math.max(1, nextPage), lastPage);

    // A boundary button is already disabled, so this only guards a
    // programmatic call — never emit a page the consumer is already on.
    if (clamped !== currentPage) {
      onPageChange(clamped);
    }
  }

  return (
    <Pagination
      data-slot="data-table-pagination"
      aria-label={ariaLabel}
      className={cn(
        "mx-0 w-full min-w-0 flex-wrap items-center justify-between gap-x-6 gap-y-3",
        className,
      )}
      {...props}
    >
      {showPageSize ? (
        <div className="flex min-w-0 items-center gap-2">
          <span
            id={pageSizeLabelId}
            className="text-body-sm whitespace-nowrap text-muted-foreground"
          >
            {pageSizeLabel}
          </span>
          <Select
            value={String(pageSize)}
            disabled={disabled}
            onValueChange={(value) => {
              onPageSizeChange(Number(value));
            }}
          >
            <SelectTrigger size="sm" aria-labelledby={pageSizeLabelId}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="start">
              {pageSizeOptions.map((option) => (
                <SelectItem key={option} value={String(option)}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : null}

      {/*
       * The status is the answer to "where am I?", so it is announced when it
       * changes rather than left for the user to go looking for.
       */}
      <p
        role="status"
        className="text-body-sm whitespace-nowrap tabular-nums text-muted-foreground"
      >
        {renderPageStatus
          ? renderPageStatus(currentPage, lastPage)
          : `Page ${currentPage} of ${lastPage}`}
      </p>

      <PaginationContent>
        {showFirstLast ? (
          <PaginationItem>
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              aria-label={firstPageLabel}
              disabled={disabled || isFirstPage}
              onClick={() => goToPage(1)}
            >
              <FirstPageIcon aria-hidden="true" />
            </Button>
          </PaginationItem>
        ) : null}

        <PaginationItem>
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            aria-label={previousPageLabel}
            disabled={disabled || isFirstPage}
            onClick={() => goToPage(currentPage - 1)}
          >
            <ChevronLeftIcon aria-hidden="true" />
          </Button>
        </PaginationItem>

        <PaginationItem>
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            aria-label={nextPageLabel}
            disabled={disabled || isLastPage}
            onClick={() => goToPage(currentPage + 1)}
          >
            <ChevronRightIcon aria-hidden="true" />
          </Button>
        </PaginationItem>

        {showFirstLast ? (
          <PaginationItem>
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              aria-label={lastPageLabel}
              disabled={disabled || isLastPage}
              onClick={() => goToPage(lastPage)}
            >
              <LastPageIcon aria-hidden="true" />
            </Button>
          </PaginationItem>
        ) : null}
      </PaginationContent>
    </Pagination>
  );
}

export { DataTablePagination };
export type { DataTablePaginationProps };
