import * as React from "react";

import { cn } from "../../lib/utils";

type ApprovalTimelineTone =
  "neutral" | "info" | "success" | "warning" | "danger";

const indicatorToneClasses: Record<ApprovalTimelineTone, string> = {
  neutral: "border-border bg-surface-muted text-foreground-secondary",
  info: "border-info-border bg-info-subtle text-info",
  success: "border-success-border bg-success-subtle text-success",
  warning: "border-warning-border bg-warning-subtle text-warning",
  danger: "border-danger-border bg-danger-subtle text-danger",
};

const statusToneClasses: Record<ApprovalTimelineTone, string> = {
  neutral: "border-border bg-surface-muted",
  info: "border-info-border bg-info-subtle",
  success: "border-success-border bg-success-subtle",
  warning: "border-warning-border bg-warning-subtle",
  danger: "border-danger-border bg-danger-subtle",
};

type ApprovalTimelineProps = React.ComponentProps<"ol">;

/**
 * A read-only sequence of approval or review steps.
 *
 * The component does not derive state or execute workflow transitions. The
 * consumer supplies every status label, semantic tone, timestamp, and actor.
 */
function ApprovalTimeline({ className, ...props }: ApprovalTimelineProps) {
  return (
    <ol
      data-slot="approval-timeline"
      className={cn("m-0 grid min-w-0 list-none p-0", className)}
      {...props}
    />
  );
}

type ApprovalTimelineItemProps = Omit<
  React.ComponentProps<"li">,
  "children" | "title"
> & {
  title: React.ReactNode;
  /** Visible, localizable status text; status meaning never relies on color. */
  status: React.ReactNode;
  /** Visual treatment only. It does not determine or enforce workflow state. */
  tone?: ApprovalTimelineTone;
  /** Decorative icon. The visible `status` must carry the same meaning. */
  marker?: React.ReactNode;
  /** Optional actor, timestamp, or other consumer-formatted metadata. */
  meta?: React.ReactNode;
  /** Optional explanatory detail for the step. */
  children?: React.ReactNode;
};

function ApprovalTimelineItem({
  children,
  className,
  marker,
  meta,
  status,
  title,
  tone = "neutral",
  ...props
}: ApprovalTimelineItemProps) {
  return (
    <li
      data-slot="approval-timeline-item"
      data-tone={tone}
      className={cn(
        "relative grid min-w-0 grid-cols-[2rem_minmax(0,1fr)] gap-x-3 pb-5 after:pointer-events-none after:absolute after:top-8 after:bottom-0 after:start-[calc(1rem-0.5px)] after:w-px after:bg-border last:pb-0 last:after:hidden",
        className,
      )}
      {...props}
    >
      <span
        data-slot="approval-timeline-marker"
        aria-hidden="true"
        className={cn(
          "relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border [&_svg]:size-4",
          indicatorToneClasses[tone],
        )}
      >
        {marker ?? <span className="size-2 rounded-full bg-current" />}
      </span>

      <div data-slot="approval-timeline-content" className="grid min-w-0 gap-1">
        <div className="flex min-w-0 flex-wrap items-start justify-between gap-x-3 gap-y-1">
          <p
            data-slot="approval-timeline-title"
            className="min-w-0 break-words text-body font-semibold text-foreground [overflow-wrap:anywhere]"
          >
            {title}
          </p>
          <span
            data-slot="approval-timeline-status"
            className={cn(
              "inline-flex max-w-full shrink-0 items-center break-words rounded-full border px-2 py-0.5 text-caption font-medium text-foreground [overflow-wrap:anywhere]",
              statusToneClasses[tone],
            )}
          >
            {status}
          </span>
        </div>

        {meta ? (
          <div
            data-slot="approval-timeline-meta"
            className="min-w-0 break-words text-caption tabular-nums text-muted-foreground [overflow-wrap:anywhere]"
          >
            {meta}
          </div>
        ) : null}

        {children ? (
          <div
            data-slot="approval-timeline-description"
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
  ApprovalTimeline,
  ApprovalTimelineItem,
  type ApprovalTimelineItemProps,
  type ApprovalTimelineProps,
  type ApprovalTimelineTone,
};
