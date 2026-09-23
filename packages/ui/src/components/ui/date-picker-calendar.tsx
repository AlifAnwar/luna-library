"use client";

import * as React from "react";
import {
  DayPicker,
  type ChevronProps,
  type DayPickerProps,
} from "@daypicker/react";
import { ChevronRightIcon } from "../../icons";
import { cn } from "../../lib/utils";

function CalendarChevron({
  className,
  disabled,
  orientation = "right",
  size = 16,
  style,
}: ChevronProps) {
  return (
    <ChevronRightIcon
      aria-hidden="true"
      className={cn(
        orientation === "left" && "rotate-180",
        orientation === "up" && "-rotate-90",
        orientation === "down" && "rotate-90",
        disabled && "opacity-50",
        className,
      )}
      height={size}
      width={size}
      style={style}
    />
  );
}

function Calendar({
  className,
  classNames,
  components,
  showOutsideDays = true,
  ...props
}: DayPickerProps) {
  const isRangeMode = props.mode === "range";

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3 text-body-sm text-foreground", className)}
      classNames={{
        root: "relative w-fit",
        months: "flex flex-col gap-4 sm:flex-row",
        month: "space-y-2",
        month_caption: "relative flex h-8 items-center justify-center",
        caption_label: "text-body-sm font-semibold",
        nav: "absolute inset-x-3 top-3 flex items-center justify-between",
        button_previous:
          "inline-flex size-8 items-center justify-center rounded-md border border-transparent text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50",
        button_next:
          "inline-flex size-8 items-center justify-center rounded-md border border-transparent text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50",
        month_grid: "w-full border-collapse",
        weekdays: "flex",
        weekday:
          "flex size-8 items-center justify-center text-caption font-normal text-muted-foreground",
        week: "flex w-full",
        day: "relative size-8 p-0 text-center",
        // Ring width only: `today` below sets this button's border colour via
        // `[&>button]:border-primary`, and DayPicker's class names are not run
        // through `cn`, so a `border-transparent` base here would compete with
        // it on stylesheet order rather than merge.
        day_button:
          "inline-flex size-8 items-center justify-center rounded-md text-body outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50",
        selected: isRangeMode
          ? undefined
          : "[&>button]:bg-primary [&>button]:text-primary-foreground [&>button]:hover:bg-primary-hover",
        today: "[&>button]:border [&>button]:border-primary",
        outside: "text-muted-foreground opacity-50 aria-selected:opacity-100",
        disabled:
          "pointer-events-none text-muted-foreground opacity-40 line-through",
        range_start:
          "rounded-l-md bg-primary-subtle [&>button]:rounded-md [&>button]:bg-primary [&>button]:text-primary-foreground [&>button]:hover:bg-primary-hover",
        range_middle:
          "bg-primary-subtle [&>button]:rounded-none [&>button]:bg-transparent [&>button]:text-primary-active",
        range_end:
          "rounded-r-md bg-primary-subtle [&>button]:rounded-md [&>button]:bg-primary [&>button]:text-primary-foreground [&>button]:hover:bg-primary-hover",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: CalendarChevron,
        ...components,
      }}
      {...props}
    />
  );
}

function formatDate(
  value: Date,
  locale?: Intl.LocalesArgument,
  options?: Intl.DateTimeFormatOptions,
) {
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...options,
  }).format(value);
}

function toDateInputValue(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

type DatePickerCalendarProps = Omit<
  DayPickerProps,
  "mode" | "onSelect" | "selected"
>;

export { Calendar, formatDate, toDateInputValue };
export type { DatePickerCalendarProps };
