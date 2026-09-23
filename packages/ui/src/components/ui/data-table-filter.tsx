"use client";

import * as React from "react";

import { ChevronDownIcon } from "../../icons";
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
import { RadioGroup, RadioGroupItem } from "./radio-group";
import { Separator } from "./separator";

type DataTableFilterOption = {
  label: string;
  value: string;
  count?: number;
  disabled?: boolean;
  icon?: React.ReactNode;
};

type DataTableFilterBaseProps = {
  label: string;
  options: readonly DataTableFilterOption[];
  disabled?: boolean;
  clearLabel?: string;
  className?: string;
  contentClassName?: string;
};

type DataTableSingleFilterProps = DataTableFilterBaseProps & {
  mode?: "single";
  value?: string;
  onValueChange: (value: string | undefined) => void;
};

type DataTableMultipleFilterProps = DataTableFilterBaseProps & {
  mode: "multiple";
  value: readonly string[];
  onValueChange: (value: string[]) => void;
};

type DataTableFilterProps =
  DataTableSingleFilterProps | DataTableMultipleFilterProps;

function FilterOptionContent({ option }: { option: DataTableFilterOption }) {
  return (
    <>
      {option.icon ? (
        <span
          aria-hidden="true"
          className="flex size-5 shrink-0 items-center justify-center text-muted-foreground [&_svg]:size-4"
        >
          {option.icon}
        </span>
      ) : null}
      <span className="min-w-0 flex-1 break-words text-start">
        {option.label}
      </span>
      {option.count !== undefined ? (
        <span className="shrink-0 text-caption tabular-nums text-muted-foreground">
          {option.count}
        </span>
      ) : null}
    </>
  );
}

/**
 * A controlled single- or multi-select filter. Luna renders selection state
 * and emits intent; applying that selection to rows remains consumer logic.
 */
function DataTableFilter(props: DataTableFilterProps) {
  const {
    label,
    options,
    disabled,
    clearLabel = "Clear filter",
    className,
    contentClassName,
  } = props;
  const [open, setOpen] = React.useState(false);
  const titleId = React.useId();
  const optionIdPrefix = React.useId();
  const selectedValues: readonly string[] =
    props.mode === "multiple"
      ? props.value
      : props.value === undefined
        ? []
        : [props.value];
  const selectedOption = options.find(
    (option) => option.value === selectedValues[0],
  );
  const selectedCount = selectedValues.length;
  const isActive = selectedCount > 0;

  function clearFilter() {
    if (props.mode === "multiple") {
      props.onValueChange([]);
    } else {
      props.onValueChange(undefined);
    }
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
            data-active={isActive ? "" : undefined}
            className={cn(
              "max-w-full min-w-0 justify-between data-active:border-primary data-active:bg-primary-subtle data-active:text-primary-active",
              className,
            )}
          />
        }
      >
        <span className="min-w-0 truncate">
          {selectedCount === 1 && selectedOption
            ? `${label}: ${selectedOption.label}`
            : label}
        </span>
        {props.mode === "multiple" && selectedCount > 1 ? (
          <Badge
            variant="secondary"
            className="min-w-5 justify-center px-1.5 tabular-nums"
          >
            {selectedCount}
          </Badge>
        ) : null}
        <ChevronDownIcon aria-hidden="true" className="size-4" />
      </PopoverTrigger>

      <PopoverContent
        align="start"
        aria-labelledby={titleId}
        className={cn("w-64 p-1", contentClassName)}
      >
        <PopoverTitle id={titleId} className="sr-only">
          {label}
        </PopoverTitle>

        {props.mode === "multiple" ? (
          <div
            role="group"
            aria-labelledby={titleId}
            className="max-h-72 overflow-y-auto overscroll-contain"
          >
            {options.map((option, index) => {
              const optionId = `${optionIdPrefix}-${index}`;
              const checked = props.value.includes(option.value);

              return (
                <label
                  key={option.value}
                  htmlFor={optionId}
                  className={cn(
                    "flex min-h-control-md w-full cursor-pointer items-center gap-2 rounded-md px-2.5 py-2 text-body text-foreground hover:bg-muted has-[:focus-visible]:bg-muted",
                    option.disabled &&
                      "cursor-not-allowed text-muted-foreground opacity-50",
                  )}
                >
                  <Checkbox
                    id={optionId}
                    checked={checked}
                    disabled={disabled || option.disabled}
                    onCheckedChange={(nextChecked) => {
                      const nextValue = nextChecked
                        ? [...props.value, option.value]
                        : props.value.filter((value) => value !== option.value);
                      props.onValueChange(nextValue);
                    }}
                  />
                  <FilterOptionContent option={option} />
                </label>
              );
            })}
          </div>
        ) : (
          <RadioGroup
            aria-labelledby={titleId}
            value={props.value ?? ""}
            className="max-h-72 gap-0 overflow-y-auto overscroll-contain"
            onValueChange={(nextValue) => {
              props.onValueChange(nextValue);
              setOpen(false);
            }}
          >
            {options.map((option, index) => {
              const optionId = `${optionIdPrefix}-${index}`;

              return (
                <label
                  key={option.value}
                  htmlFor={optionId}
                  className={cn(
                    "flex min-h-control-md w-full cursor-pointer items-center gap-2 rounded-md px-2.5 py-2 text-body text-foreground hover:bg-muted has-[:focus-visible]:bg-muted",
                    option.disabled &&
                      "cursor-not-allowed text-muted-foreground opacity-50",
                  )}
                >
                  <RadioGroupItem
                    id={optionId}
                    value={option.value}
                    disabled={disabled || option.disabled}
                  />
                  <FilterOptionContent option={option} />
                </label>
              );
            })}
          </RadioGroup>
        )}

        {isActive ? (
          <>
            <Separator className="my-1" />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="w-full justify-center"
              onClick={clearFilter}
            >
              {clearLabel}
            </Button>
          </>
        ) : null}
      </PopoverContent>
    </Popover>
  );
}

export { DataTableFilter };
export type {
  DataTableFilterOption,
  DataTableFilterProps,
  DataTableMultipleFilterProps,
  DataTableSingleFilterProps,
};
