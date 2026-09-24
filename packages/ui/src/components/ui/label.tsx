import * as React from "react";
import { cn } from "../../lib/utils";

type LabelProps = React.ComponentProps<"label"> & {
  disabled?: boolean;
  required?: boolean;
  requiredIndicator?: React.ReactNode;
};

function Label({
  children,
  className,
  disabled = false,
  required = false,
  requiredIndicator = "*",
  ...props
}: LabelProps) {
  return (
    <label
      data-slot="label"
      data-disabled={disabled || undefined}
      className={cn(
        "inline-flex w-fit items-center gap-1 text-label font-medium text-foreground peer-disabled:cursor-not-allowed data-disabled:cursor-not-allowed",
        className,
      )}
      {...props}
    >
      {children}
      {required ? (
        <span className="text-destructive">
          <span aria-hidden="true">{requiredIndicator}</span>
          <span className="sr-only"> (required)</span>
        </span>
      ) : null}
    </label>
  );
}

export { Label, type LabelProps };
