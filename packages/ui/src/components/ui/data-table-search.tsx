"use client";

import * as React from "react";

import { CloseIcon, SearchIcon } from "../../icons/index.js";
import { cn } from "../../lib/utils.js";
import { Button } from "./button.js";
import { Input } from "./input.js";

type DataTableSearchProps = Omit<
  React.ComponentProps<"input">,
  "className" | "onChange" | "type" | "value"
> & {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  clearLabel?: string;
  className?: string;
  inputClassName?: string;
};

/** A controlled search field. Query interpretation stays with the consumer. */
function DataTableSearch({
  value,
  onValueChange,
  placeholder = "Search...",
  label = "Search table",
  clearLabel = "Clear search",
  className,
  inputClassName,
  disabled,
  id,
  ...props
}: DataTableSearchProps) {
  const generatedId = React.useId();
  const inputId = id ?? generatedId;

  return (
    <div
      data-slot="data-table-search"
      className={cn("relative w-full min-w-0 sm:w-64", className)}
    >
      <label htmlFor={inputId} className="sr-only">
        {label}
      </label>
      <SearchIcon
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 start-3 z-10 size-4 -translate-y-1/2 text-muted-foreground"
      />
      <Input
        {...props}
        id={inputId}
        type="search"
        inputMode="search"
        value={value}
        disabled={disabled}
        placeholder={placeholder}
        className={cn(
          "pe-9 ps-9 text-body-lg focus-visible:ring-3 sm:text-body [&::-webkit-search-cancel-button]:appearance-none",
          inputClassName,
        )}
        onChange={(event) => onValueChange(event.currentTarget.value)}
      />
      {value ? (
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          aria-label={clearLabel}
          disabled={disabled}
          className="absolute top-1/2 end-1.5 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          onClick={() => onValueChange("")}
        >
          <CloseIcon aria-hidden="true" />
        </Button>
      ) : null}
    </div>
  );
}

export { DataTableSearch };
export type { DataTableSearchProps };
