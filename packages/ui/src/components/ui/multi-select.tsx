"use client";

import * as React from "react";
import { Combobox as ComboboxPrimitive } from "@base-ui/react/combobox";
import { CheckIcon, ChevronDownIcon, CloseIcon } from "../../icons/index.js";
import { cn } from "../../lib/utils.js";

type MultiSelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

type MultiSelectProps = Omit<
  ComboboxPrimitive.Root.Props<string, true, MultiSelectOption>,
  "children" | "disabled" | "id" | "items" | "multiple" | "required"
> & {
  items: MultiSelectOption[];
  "aria-label": string;
  "aria-describedby"?: string;
  "aria-invalid"?: React.AriaAttributes["aria-invalid"];
  "aria-labelledby"?: string;
  "aria-required"?: React.AriaAttributes["aria-required"];
  contentClassName?: string;
  disabled?: boolean;
  emptyText?: string;
  getRemoveLabel?: (item: MultiSelectOption) => string;
  id?: string;
  inputDescription?: (selectedCount: number) => string | undefined;
  placeholder?: string;
  removeDescription?: string;
  required?: boolean;
  searchLabel?: string;
  selectedItemsLabel?: string;
  triggerLabel?: string;
  className?: string;
};

function MultiSelect({
  items,
  "aria-label": ariaLabel,
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
  "aria-labelledby": ariaLabelledBy,
  "aria-required": ariaRequired,
  className,
  contentClassName,
  disabled,
  emptyText = "No options found.",
  getRemoveLabel = (item) => `Remove ${item.label}`,
  id,
  inputDescription = (count) =>
    count > 0
      ? `${count} selected. From the start of the input, press Left Arrow to focus selected items.`
      : undefined,
  placeholder = "Select options",
  removeDescription = "Press Backspace or Delete to remove",
  required,
  searchLabel = "Search options",
  selectedItemsLabel = "Selected options",
  triggerLabel = "Show options",
  onOpenChange,
  ...props
}: MultiSelectProps) {
  const collection = React.useMemo(
    () =>
      ComboboxPrimitive.createItems(items, {
        getValue: (item) => item.value,
        getLabel: (item) => item.label,
      }),
    [items],
  );

  return (
    <ComboboxPrimitive.Root
      items={collection}
      multiple
      disabled={disabled}
      required={required}
      onOpenChange={(open, eventDetails) => {
        if (!open && eventDetails.reason === "item-press") {
          eventDetails.cancel();
        }
        onOpenChange?.(open, eventDetails);
      }}
      {...props}
    >
      <ComboboxPrimitive.InputGroup
        data-slot="multi-select"
        className={cn(
          "flex min-h-control-md w-full items-center gap-1.5 rounded-md border border-input bg-surface px-2.5 py-1 text-body text-foreground outline-none transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 has-aria-invalid:border-destructive has-aria-invalid:ring-3 has-aria-invalid:ring-destructive/20 has-disabled:cursor-not-allowed has-disabled:opacity-50",
          className,
        )}
      >
        <ComboboxPrimitive.Value>
          {(selectedValue: string[]) => {
            const selectedItems = selectedValue.flatMap((value) => {
              const item = items.find((option) => option.value === value);
              return item ? [item] : [];
            });

            return (
              <ComboboxPrimitive.Chips
                aria-label={
                  selectedItems.length > 0 ? selectedItemsLabel : undefined
                }
                className="flex min-w-0 flex-1 flex-wrap items-center gap-1"
              >
                {selectedItems.map((item) => (
                  <ComboboxPrimitive.Chip
                    key={item.value}
                    aria-label={item.label}
                    aria-description={removeDescription}
                    className="flex h-6 max-w-full items-center gap-1 rounded-sm border border-transparent bg-muted px-2 text-label text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 data-disabled:opacity-50"
                  >
                    <span className="truncate">{item.label}</span>
                    <ComboboxPrimitive.ChipRemove
                      aria-label={getRemoveLabel(item)}
                      className="-mr-1 inline-flex size-5 shrink-0 items-center justify-center rounded-sm border border-transparent text-muted-foreground outline-none hover:bg-surface hover:text-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                    >
                      <CloseIcon className="size-3.5" aria-hidden="true" />
                    </ComboboxPrimitive.ChipRemove>
                  </ComboboxPrimitive.Chip>
                ))}
                <ComboboxPrimitive.Input
                  id={id}
                  data-slot="multi-select-input"
                  aria-label={ariaLabel || searchLabel}
                  aria-labelledby={ariaLabelledBy}
                  aria-describedby={ariaDescribedBy}
                  aria-description={inputDescription(selectedItems.length)}
                  aria-invalid={ariaInvalid}
                  aria-required={ariaRequired ?? required}
                  disabled={disabled}
                  placeholder={selectedItems.length > 0 ? "" : placeholder}
                  className="h-6 min-w-20 flex-1 bg-transparent text-body text-foreground outline-none placeholder:text-muted-foreground"
                />
              </ComboboxPrimitive.Chips>
            );
          }}
        </ComboboxPrimitive.Value>
        <ComboboxPrimitive.Trigger
          aria-label={triggerLabel}
          disabled={disabled}
          className="inline-flex size-6 shrink-0 items-center justify-center rounded-sm border border-transparent text-muted-foreground outline-none hover:text-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <ComboboxPrimitive.Icon
            render={<ChevronDownIcon className="size-4" aria-hidden="true" />}
          />
        </ComboboxPrimitive.Trigger>
      </ComboboxPrimitive.InputGroup>

      <ComboboxPrimitive.Portal>
        <ComboboxPrimitive.Positioner
          side="bottom"
          sideOffset={4}
          align="start"
          className="isolate z-50"
        >
          <ComboboxPrimitive.Popup
            data-slot="multi-select-content"
            aria-label={ariaLabel}
            className={cn(
              "relative isolate z-50 flex max-h-(--available-height) w-(--anchor-width) min-w-48 flex-col overflow-hidden rounded-lg border border-border bg-popover text-popover-foreground shadow-sm duration-100 data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
              contentClassName,
            )}
          >
            {/*
             * No search row here: unlike `SearchableSelect`, MultiSelect filters
             * from the input in its own trigger, so a search-styled header in
             * the popup would be a control that cannot be typed into.
             */}
            <div className="min-h-0 overflow-y-auto p-1">
              <ComboboxPrimitive.Empty className="px-2 py-1.5 text-body text-muted-foreground">
                {emptyText}
              </ComboboxPrimitive.Empty>
              <ComboboxPrimitive.List>
                {(item: MultiSelectOption) => (
                  <ComboboxPrimitive.Item
                    key={item.value}
                    value={item.value}
                    disabled={item.disabled}
                    className="relative flex min-h-control-sm w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-body outline-hidden hover:bg-muted data-highlighted:bg-muted data-selected:bg-primary-subtle data-selected:text-primary-active data-disabled:pointer-events-none data-disabled:opacity-50"
                  >
                    <span className="flex-1 truncate">{item.label}</span>
                    <ComboboxPrimitive.ItemIndicator className="pointer-events-none absolute right-2 flex size-4 items-center justify-center">
                      <CheckIcon className="size-4" aria-hidden="true" />
                    </ComboboxPrimitive.ItemIndicator>
                  </ComboboxPrimitive.Item>
                )}
              </ComboboxPrimitive.List>
            </div>
          </ComboboxPrimitive.Popup>
        </ComboboxPrimitive.Positioner>
      </ComboboxPrimitive.Portal>
    </ComboboxPrimitive.Root>
  );
}

export { MultiSelect };
export type { MultiSelectOption, MultiSelectProps };
