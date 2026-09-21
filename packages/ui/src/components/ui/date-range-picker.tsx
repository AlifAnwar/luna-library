"use client";

import * as React from "react";
import type { DateRange } from "@daypicker/react";
import { cn } from "cn";
import { CalendarIcon, ChevronDownIcon, CloseIcon } from "../../icons";
import { Button } from "./button";
import {
  Calendar,
  formatDate,
  toDateInputValue,
  type DatePickerCalendarProps,
} from "./date-picker-calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

type DateRangePickerProps = {
  "aria-label": string;
  "aria-describedby"?: string;
  "aria-invalid"?: React.AriaAttributes["aria-invalid"];
  "aria-labelledby"?: string;
  "aria-required"?: React.AriaAttributes["aria-required"];
  calendarProps?: DatePickerCalendarProps;
  className?: string;
  clearLabel?: string;
  contentClassName?: string;
  disabled?: boolean;
  endName?: string;
  formatOptions?: Intl.DateTimeFormatOptions;
  id?: string;
  locale?: Intl.LocalesArgument;
  onValueChange: (value: DateRange | undefined) => void;
  placeholder?: string;
  required?: boolean;
  startName?: string;
  value?: DateRange;
};

function getDatePart(
  value: Date,
  part: Intl.DateTimeFormatPartTypes,
  locale?: Intl.LocalesArgument,
) {
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    year: "2-digit",
  })
    .formatToParts(value)
    .find((item) => item.type === part)?.value;
}

function formatCompactRange(
  value: DateRange,
  locale?: Intl.LocalesArgument,
  options?: Intl.DateTimeFormatOptions,
) {
  if (!value.from) return undefined;

  if (options) {
    return value.to
      ? `${formatDate(value.from, locale, options)} – ${formatDate(value.to, locale, options)}`
      : `${formatDate(value.from, locale, options)} – …`;
  }

  const startDay = getDatePart(value.from, "day", locale);
  const startMonth = getDatePart(value.from, "month", locale);
  const startYear = getDatePart(value.from, "year", locale);

  if (!value.to) {
    return `${startDay} ${startMonth} ${startYear} – …`;
  }

  const endDay = getDatePart(value.to, "day", locale);
  const endMonth = getDatePart(value.to, "month", locale);
  const endYear = getDatePart(value.to, "year", locale);
  const isSameYear = value.from.getFullYear() === value.to.getFullYear();
  const isSameMonth =
    isSameYear && value.from.getMonth() === value.to.getMonth();

  if (isSameMonth) return `${startDay} – ${endDay} ${endMonth} ${endYear}`;
  if (isSameYear) {
    return `${startDay} ${startMonth} – ${endDay} ${endMonth} ${endYear}`;
  }

  return `${startDay} ${startMonth} ${startYear} – ${endDay} ${endMonth} ${endYear}`;
}

function DateRangePicker({
  "aria-label": ariaLabel,
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
  "aria-labelledby": ariaLabelledBy,
  "aria-required": ariaRequired,
  calendarProps,
  className,
  clearLabel = "Clear date range",
  contentClassName,
  disabled,
  endName,
  formatOptions,
  id,
  locale,
  onValueChange,
  placeholder = "Select a date range",
  required,
  startName,
  value,
}: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false);
  const hasValue = Boolean(value?.from);
  const displayValue = value?.from
    ? formatCompactRange(value, locale, formatOptions)
    : placeholder;

  return (
    <Popover open={open} onOpenChange={(nextOpen) => setOpen(nextOpen)}>
      <div className="relative">
        <PopoverTrigger
          render={
            <Button
              id={id}
              type="button"
              variant="outline"
              aria-label={ariaLabel}
              aria-labelledby={ariaLabelledBy}
              aria-describedby={ariaDescribedBy}
              aria-invalid={ariaInvalid}
              aria-required={ariaRequired ?? required}
              data-placeholder={!hasValue || undefined}
              disabled={disabled}
              className={cn(
                "relative w-full justify-start px-3 pr-9 font-normal data-placeholder:text-muted-foreground",
                hasValue && "pr-16",
                className,
              )}
            />
          }
        >
          <CalendarIcon
            className="size-4 shrink-0 text-muted-foreground"
            aria-hidden="true"
          />
          <span className="min-w-0 flex-1 truncate text-left">
            {displayValue}
          </span>
          <ChevronDownIcon
            className="absolute right-2 size-4 shrink-0 text-muted-foreground transition-transform group-aria-expanded/button:rotate-180"
            aria-hidden="true"
          />
        </PopoverTrigger>
        {hasValue ? (
          <button
            type="button"
            aria-label={clearLabel}
            disabled={disabled}
            className="absolute top-1/2 right-8 z-10 inline-flex size-7 -translate-y-1/2 items-center justify-center rounded-sm text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50"
            onClick={() => {
              onValueChange(undefined);
              setOpen(false);
            }}
          >
            <CloseIcon className="size-3.5" aria-hidden="true" />
          </button>
        ) : null}
      </div>
      <PopoverContent
        align="start"
        className={cn(
          "w-auto max-w-[calc(100vw-2rem)] overflow-auto p-0 shadow-md",
          contentClassName,
        )}
      >
        <Calendar
          {...calendarProps}
          mode="range"
          required={required}
          numberOfMonths={calendarProps?.numberOfMonths ?? 1}
          selected={value}
          defaultMonth={calendarProps?.defaultMonth ?? value?.from}
          onSelect={(nextValue: DateRange | undefined) => {
            onValueChange(nextValue);
            const wasSelectingRange =
              value?.from &&
              (!value.to || value.from.getTime() === value.to.getTime());
            const completedMultiDayRange =
              nextValue?.from &&
              nextValue.to &&
              nextValue.from.getTime() !== nextValue.to.getTime();

            if (wasSelectingRange && completedMultiDayRange) {
              setOpen(false);
            }
          }}
        />
      </PopoverContent>
      {startName ? (
        <input
          type="hidden"
          name={startName}
          value={value?.from ? toDateInputValue(value.from) : ""}
          disabled={disabled}
        />
      ) : null}
      {endName ? (
        <input
          type="hidden"
          name={endName}
          value={value?.to ? toDateInputValue(value.to) : ""}
          disabled={disabled}
        />
      ) : null}
    </Popover>
  );
}

export { DateRangePicker };
export type { DateRange, DateRangePickerProps };
