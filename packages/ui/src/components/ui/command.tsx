"use client";

import * as React from "react";
import { SearchIcon } from "../../icons";
import { cn } from "../../lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./dialog";

type CommandItem = {
  value: string;
  label: string;
  description?: string;
  keywords?: string[];
  shortcut?: string;
  group?: string;
  disabled?: boolean;
  icon?: React.ReactNode;
};

type CommandProps = {
  items: CommandItem[];
  "aria-label": string;
  "aria-describedby"?: string;
  "aria-labelledby"?: string;
  query?: string;
  defaultQuery?: string;
  onQueryChange?: (query: string) => void;
  onSelect: (item: CommandItem) => void;
  placeholder?: string;
  emptyText?: string;
  resultsLabel?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  loop?: boolean;
  className?: string;
  inputClassName?: string;
  listClassName?: string;
};

type CommandDialogProps = Omit<CommandProps, "className"> & {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  closeOnSelect?: boolean;
  title?: string;
  description?: string;
  className?: string;
  contentClassName?: string;
};

function Command({
  items,
  "aria-label": ariaLabel,
  "aria-describedby": ariaDescribedBy,
  "aria-labelledby": ariaLabelledBy,
  autoFocus,
  className,
  defaultQuery = "",
  disabled,
  emptyText = "No results found.",
  inputClassName,
  listClassName,
  loop = true,
  onQueryChange,
  onSelect,
  placeholder = "Search commands...",
  query,
  resultsLabel = "Command results",
}: CommandProps) {
  const generatedId = React.useId();
  const listId = `${generatedId}-list`;
  const [internalQuery, setInternalQuery] = React.useState(defaultQuery);
  const [activeValue, setActiveValue] = React.useState<string>();
  const currentQuery = query ?? internalQuery;
  const normalizedQuery = currentQuery.trim().toLocaleLowerCase();
  const visibleItems = React.useMemo(
    () =>
      items.filter((item) => {
        if (!normalizedQuery) return true;

        return [
          item.label,
          item.value,
          item.description,
          ...(item.keywords ?? []),
        ]
          .filter(Boolean)
          .join(" ")
          .toLocaleLowerCase()
          .includes(normalizedQuery);
      }),
    [items, normalizedQuery],
  );
  const selectableItems = visibleItems.filter((item) => !item.disabled);
  const activeItem =
    selectableItems.find((item) => item.value === activeValue) ??
    selectableItems[0];
  const activeItemIndex = activeItem
    ? visibleItems.findIndex((item) => item.value === activeItem.value)
    : -1;
  const groupedItems = visibleItems.reduce<Map<string, CommandItem[]>>(
    (groups, item) => {
      const group = item.group ?? "";
      const groupItems = groups.get(group) ?? [];
      groupItems.push(item);
      groups.set(group, groupItems);
      return groups;
    },
    new Map(),
  );

  function updateQuery(nextQuery: string) {
    if (query === undefined) setInternalQuery(nextQuery);
    setActiveValue(undefined);
    onQueryChange?.(nextQuery);
  }

  function moveActiveItem(direction: 1 | -1) {
    if (selectableItems.length === 0) return;

    const currentIndex = activeItem
      ? selectableItems.findIndex((item) => item.value === activeItem.value)
      : direction === 1
        ? -1
        : 0;
    const nextIndex = currentIndex + direction;
    const boundedIndex = loop
      ? (nextIndex + selectableItems.length) % selectableItems.length
      : Math.min(Math.max(nextIndex, 0), selectableItems.length - 1);

    setActiveValue(selectableItems[boundedIndex]?.value);
  }

  return (
    <div
      data-slot="command"
      className={cn(
        "overflow-hidden rounded-lg border border-border bg-popover text-popover-foreground shadow-sm",
        className,
      )}
    >
      <div className="flex items-center gap-2 border-b border-border px-3">
        <SearchIcon
          className="size-4 shrink-0 text-muted-foreground"
          aria-hidden="true"
        />
        <input
          role="combobox"
          type="text"
          inputMode="search"
          value={currentQuery}
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledBy}
          aria-describedby={ariaDescribedBy}
          aria-controls={listId}
          aria-expanded="true"
          aria-autocomplete="list"
          aria-activedescendant={
            activeItemIndex >= 0
              ? `${listId}-option-${activeItemIndex}`
              : undefined
          }
          autoFocus={autoFocus}
          disabled={disabled}
          placeholder={placeholder}
          className={cn(
            "h-control-lg w-full min-w-0 bg-transparent text-body text-foreground outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
            inputClassName,
          )}
          onChange={(event) => updateQuery(event.currentTarget.value)}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown") {
              event.preventDefault();
              moveActiveItem(1);
            } else if (event.key === "ArrowUp") {
              event.preventDefault();
              moveActiveItem(-1);
            } else if (event.key === "Home") {
              event.preventDefault();
              setActiveValue(selectableItems[0]?.value);
            } else if (event.key === "End") {
              event.preventDefault();
              setActiveValue(selectableItems.at(-1)?.value);
            } else if (event.key === "Enter" && activeItem) {
              event.preventDefault();
              onSelect(activeItem);
            }
          }}
        />
      </div>

      <div
        id={listId}
        role={visibleItems.length > 0 ? "listbox" : undefined}
        aria-label={visibleItems.length > 0 ? resultsLabel : undefined}
        className={cn("max-h-72 overflow-y-auto p-1.5", listClassName)}
      >
        {visibleItems.length === 0 ? (
          <p
            role="status"
            className="px-3 py-6 text-center text-body text-muted-foreground"
          >
            {emptyText}
          </p>
        ) : (
          Array.from(groupedItems.entries()).map(([group, groupItems]) => (
            <div
              key={group || "ungrouped"}
              role="group"
              aria-label={group || undefined}
              className="not-first:mt-1 not-first:border-t not-first:border-border-subtle not-first:pt-1"
            >
              {group ? (
                <p className="px-2 py-1 text-caption font-medium text-muted-foreground">
                  {group}
                </p>
              ) : null}
              {groupItems.map((item) => {
                const itemIndex = visibleItems.findIndex(
                  (visibleItem) => visibleItem.value === item.value,
                );
                const isActive = item.value === activeItem?.value;

                return (
                  <button
                    key={item.value}
                    id={`${listId}-option-${itemIndex}`}
                    type="button"
                    role="option"
                    aria-selected={isActive}
                    disabled={disabled || item.disabled}
                    tabIndex={-1}
                    className="flex min-h-control-md w-full items-center gap-3 rounded-md px-2.5 py-2 text-start text-body outline-none aria-selected:bg-primary-subtle aria-selected:text-primary-active hover:bg-muted disabled:pointer-events-none disabled:opacity-50"
                    onMouseDown={(event) => event.preventDefault()}
                    onMouseMove={() => setActiveValue(item.value)}
                    onClick={() => onSelect(item)}
                  >
                    {item.icon ? (
                      <span className="flex size-5 shrink-0 items-center justify-center text-muted-foreground [&_svg]:size-4">
                        {item.icon}
                      </span>
                    ) : null}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium">
                        {item.label}
                      </span>
                      {item.description ? (
                        <span className="block truncate text-body-sm text-muted-foreground">
                          {item.description}
                        </span>
                      ) : null}
                    </span>
                    {item.shortcut ? (
                      <kbd className="shrink-0 rounded-sm border border-border bg-surface px-1.5 py-0.5 font-mono text-caption text-muted-foreground">
                        {item.shortcut}
                      </kbd>
                    ) : null}
                  </button>
                );
              })}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function CommandDialog({
  className,
  closeOnSelect = true,
  contentClassName,
  defaultOpen = false,
  description,
  onOpenChange,
  onSelect,
  open,
  title = "Command menu",
  ...commandProps
}: CommandDialogProps) {
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
  const currentOpen = open ?? internalOpen;

  function updateOpen(nextOpen: boolean) {
    if (open === undefined) setInternalOpen(nextOpen);
    onOpenChange?.(nextOpen);
  }

  return (
    <Dialog
      open={currentOpen}
      onOpenChange={(nextOpen) => updateOpen(nextOpen)}
    >
      <DialogContent
        showCloseButton={false}
        className={cn(
          "gap-0 overflow-hidden p-0 sm:max-w-lg",
          contentClassName,
        )}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>{title}</DialogTitle>
          {description ? (
            <DialogDescription>{description}</DialogDescription>
          ) : null}
        </DialogHeader>
        <Command
          {...commandProps}
          autoFocus
          className={cn("rounded-none border-0 shadow-none", className)}
          onSelect={(item) => {
            onSelect(item);
            if (closeOnSelect) updateOpen(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}

export { Command, CommandDialog };
export type { CommandDialogProps, CommandItem, CommandProps };
