import * as React from "react";

import { cn } from "../../lib/utils";

type ActivityLogProps = React.ComponentProps<"ol">;

/**
 * A chronological, read-only list of application events.
 *
 * Luna owns the visual sequence only. Consumers provide already-formatted
 * event copy, actor context, timestamps, and any structured detail content.
 */
function ActivityLog({ className, ...props }: ActivityLogProps) {
  return (
    <ol
      data-slot="activity-log"
      className={cn("m-0 grid min-w-0 list-none p-0", className)}
      {...props}
    />
  );
}

type ActivityLogItemProps = Omit<
  React.ComponentProps<"li">,
  "children" | "title"
> & {
  /** Complete, localizable event summary, including actor context when useful. */
  title: React.ReactNode;
  /** A consumer-formatted timestamp, preferably rendered with a `<time>`. */
  timestamp: React.ReactNode;
  /** Decorative avatar or icon. Event meaning must remain present in `title`. */
  marker?: React.ReactNode;
  /** Optional message or structured event details. */
  children?: React.ReactNode;
};

function ActivityLogItem({
  children,
  className,
  marker,
  timestamp,
  title,
  ...props
}: ActivityLogItemProps) {
  return (
    <li
      data-slot="activity-log-item"
      className={cn(
        "relative grid min-w-0 grid-cols-[2rem_minmax(0,1fr)] gap-x-3 pb-5 after:pointer-events-none after:absolute after:top-8 after:bottom-0 after:start-[calc(1rem-0.5px)] after:w-px after:bg-border last:pb-0 last:after:hidden",
        className,
      )}
      {...props}
    >
      <span
        data-slot="activity-log-marker"
        aria-hidden="true"
        className="relative z-10 flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-surface text-foreground-secondary [&_svg]:size-4"
      >
        {marker ?? <span className="size-2 rounded-full bg-current" />}
      </span>

      <div data-slot="activity-log-content" className="grid min-w-0 gap-1">
        <div className="flex min-w-0 flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <p
            data-slot="activity-log-title"
            className="min-w-0 break-words text-body font-medium text-foreground [overflow-wrap:anywhere]"
          >
            {title}
          </p>
          <div
            data-slot="activity-log-timestamp"
            className="max-w-full shrink-0 break-words text-caption tabular-nums text-muted-foreground [overflow-wrap:anywhere]"
          >
            {timestamp}
          </div>
        </div>

        {children ? (
          <div
            data-slot="activity-log-description"
            className="min-w-0 break-words text-body-sm text-foreground-secondary [overflow-wrap:anywhere]"
          >
            {children}
          </div>
        ) : null}
      </div>
    </li>
  );
}

export {
  ActivityLog,
  ActivityLogItem,
  type ActivityLogItemProps,
  type ActivityLogProps,
};
