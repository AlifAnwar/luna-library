import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "cn";
import { CloseIcon } from "../../icons";

const alertVariants = cva(
  "relative flex w-full items-start gap-3 rounded-xl border p-4 text-body [&>svg]:size-4 [&>svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "border-border bg-surface text-foreground",
        info: "border-info-border bg-info-subtle text-foreground",
        success: "border-success-border bg-success-subtle text-foreground",
        warning: "border-warning-border bg-warning-subtle text-foreground",
        destructive: "border-danger-border bg-danger-subtle text-foreground",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

const alertIconVariants = cva(
  "flex size-8 shrink-0 items-center justify-center rounded-full bg-white [&>svg]:size-5",
  {
    variants: {
      variant: {
        default: "text-foreground-secondary",
        info: "text-info",
        success: "text-success",
        warning: "text-warning",
        destructive: "text-destructive",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

function Alert({
  className,
  variant,
  children,
  onClose,
  ...props
}: React.ComponentProps<"div"> &
  VariantProps<typeof alertVariants> & { onClose?: () => void }) {
  const childArray = React.Children.toArray(children);
  const icon = childArray.find(
    (child): child is React.ReactElement =>
      React.isValidElement(child) &&
      child.type !== AlertTitle &&
      child.type !== AlertDescription,
  );
  const rest = childArray.filter((child) => child !== icon);

  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    >
      {icon ? (
        <span className={cn(alertIconVariants({ variant }))}>{icon}</span>
      ) : null}
      <div className="grid flex-1 gap-1 self-center">{rest}</div>
      {onClose ? (
        <button
          type="button"
          onClick={onClose}
          aria-label="Dismiss"
          className="shrink-0 text-foreground-secondary transition-colors hover:text-foreground"
        >
          <CloseIcon className="size-4" />
        </button>
      ) : null}
    </div>
  );
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn("font-semibold", className)}
      {...props}
    />
  );
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn("text-body-sm text-foreground-secondary", className)}
      {...props}
    />
  );
}

export { Alert, AlertTitle, AlertDescription, alertVariants };
