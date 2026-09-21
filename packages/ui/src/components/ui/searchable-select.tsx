import * as React from "react";
import { Combobox as ComboboxPrimitive } from "@base-ui/react/combobox";
import { cn } from "cn";
import { CheckIcon, ChevronDownIcon, SearchIcon } from "../../icons";

type SearchableSelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

type SearchableSelectProps = Omit<
  ComboboxPrimitive.Root.Props<string, false, SearchableSelectOption>,
  "children" | "disabled" | "id" | "items" | "multiple" | "required"
> & {
  items: SearchableSelectOption[];
  "aria-label": string;
  "aria-describedby"?: string;
  "aria-invalid"?: React.AriaAttributes["aria-invalid"];
  "aria-labelledby"?: string;
  "aria-required"?: React.AriaAttributes["aria-required"];
  disabled?: boolean;
  id?: string;
  required?: boolean;
  placeholder?: string;
  searchPlaceholder?: string;
  searchLabel?: string;
  emptyText?: string;
  triggerClassName?: string;
  contentClassName?: string;
};

function SearchableSelect({
  items,
  "aria-label": ariaLabel,
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
  "aria-labelledby": ariaLabelledBy,
  "aria-required": ariaRequired,
  disabled,
  id,
  placeholder = "Select an option",
  searchPlaceholder = "Search...",
  searchLabel = "Search options",
  emptyText = "No options found.",
  triggerClassName,
  contentClassName,
  required,
  ...props
}: SearchableSelectProps) {
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
      disabled={disabled}
      id={id}
      required={required}
      {...props}
    >
      <ComboboxPrimitive.Trigger
        data-slot="searchable-select-trigger"
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        aria-describedby={ariaDescribedBy}
        aria-invalid={ariaInvalid}
        aria-required={ariaRequired ?? required}
        disabled={disabled}
        className={cn(
          "flex h-control-md w-full items-center justify-between gap-2 rounded-md border border-input bg-surface px-3 text-body text-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 data-placeholder:text-muted-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0",
          triggerClassName,
        )}
      >
        <span className="min-w-0 flex-1 truncate text-left">
          <ComboboxPrimitive.Value placeholder={placeholder} />
        </span>
        <ComboboxPrimitive.Icon
          render={
            <ChevronDownIcon
              className="size-4 text-muted-foreground"
              aria-hidden="true"
            />
          }
        />
      </ComboboxPrimitive.Trigger>
      <ComboboxPrimitive.Portal>
        <ComboboxPrimitive.Positioner
          side="bottom"
          sideOffset={4}
          align="start"
          className="isolate z-50"
        >
          <ComboboxPrimitive.Popup
            data-slot="searchable-select-content"
            aria-label={ariaLabel}
            className={cn(
              "relative isolate z-50 flex max-h-(--available-height) w-(--anchor-width) min-w-36 flex-col overflow-hidden rounded-lg border border-border bg-popover text-popover-foreground shadow-sm duration-100 data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
              contentClassName,
            )}
          >
            <div className="flex shrink-0 items-center gap-2 border-b border-border px-3">
              <SearchIcon
                className="size-4 shrink-0 text-muted-foreground"
                aria-hidden="true"
              />
              <ComboboxPrimitive.Input
                data-slot="searchable-select-input"
                aria-label={searchLabel}
                placeholder={searchPlaceholder}
                className="h-control-md w-full min-w-0 bg-transparent text-body text-foreground outline-none placeholder:text-muted-foreground"
              />
            </div>
            <div className="min-h-0 overflow-y-auto p-1">
              <ComboboxPrimitive.Empty className="px-2 py-1.5 text-body text-muted-foreground">
                {emptyText}
              </ComboboxPrimitive.Empty>
              <ComboboxPrimitive.List>
                {(item: SearchableSelectOption) => (
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

export { SearchableSelect };
export type { SearchableSelectOption, SearchableSelectProps };
