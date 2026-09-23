import * as React from "react";
import { cn } from "../../lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      data-slot="input"
      type={type}
      className={cn(
        "flex h-control-md w-full min-w-0 rounded-md border border-input bg-surface px-3 text-body text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-1.5 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 file:mr-3 file:border-0 file:bg-transparent file:text-body file:font-medium file:text-foreground",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
