"use client";

import * as React from "react";
import { ChevronDownIcon } from "../../icons/index.js";
import { cn } from "../../lib/utils.js";
import { Button } from "./button.js";
import {
  Calendar,
  formatDate,
  toDateInputValue,
  type DatePickerCalendarProps,
} from "./date-picker-calendar.js";
import { Popover, PopoverContent, PopoverTrigger } from "./popover.js";

type DatePickerProps = {
  "aria-label": string;
  "aria-describedby"?: string;
  "aria-invalid"?: React.AriaAttributes["aria-invalid"];
  "aria-labelledby"?: string;
  "aria-required"?: React.AriaAttributes["aria-required"];
  calendarProps?: DatePickerCalendarProps;
  className?: string;
  contentClassName?: string;
  disabled?: boolean;
  formatOptions?: Intl.DateTimeFormatOptions;
  id?: string;
  locale?: Intl.LocalesArgument;
  name?: string;
  onValueChange: (value: Date | undefined) => void;
  placeholder?: string;
  required?: boolean;
  value?: Date;
};

function DatePicker({
  "aria-label": ariaLabel,
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
  "aria-labelledby": ariaLabelledBy,
  calendarProps,
  className,
  contentClassName,
  disabled,
  formatOptions,
  id,
  locale,
  name,
  onValueChange,
  placeholder = "Select a date",
  required,
  value,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={(nextOpen) => setOpen(nextOpen)}>
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
            data-placeholder={!value || undefined}
            disabled={disabled}
            className={cn(
              "w-full justify-between px-3 font-normal data-placeholder:text-muted-foreground",
              className,
            )}
          />
        }
      >
        <span className="truncate">
          {value ? formatDate(value, locale, formatOptions) : placeholder}
        </span>
        <ChevronDownIcon
          className="size-4 shrink-0 text-muted-foreground"
          aria-hidden="true"
        />
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className={cn("w-auto p-0", contentClassName)}
      >
        <Calendar
          {...calendarProps}
          mode="single"
          required={required}
          selected={value}
          defaultMonth={calendarProps?.defaultMonth ?? value}
          onSelect={(nextValue: Date | undefined) => {
            onValueChange(nextValue);
            if (nextValue) {
              setOpen(false);
            }
          }}
        />
      </PopoverContent>
      {name ? (
        <input
          type="hidden"
          name={name}
          value={value ? toDateInputValue(value) : ""}
          disabled={disabled}
        />
      ) : null}
    </Popover>
  );
}

export { DatePicker };
export type { DatePickerProps };
