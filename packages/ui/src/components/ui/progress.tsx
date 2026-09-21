import { Progress as ProgressPrimitive } from "@base-ui/react/progress";
import { cn } from "cn";

function Progress({
  className,
  children,
  ...props
}: ProgressPrimitive.Root.Props) {
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn("w-full", className)}
      {...props}
    >
      <ProgressPrimitive.Track className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <ProgressPrimitive.Indicator className="h-full rounded-full bg-primary transition-[width] duration-200 data-indeterminate:w-1/3 data-indeterminate:animate-pulse" />
      </ProgressPrimitive.Track>
      {children}
    </ProgressPrimitive.Root>
  );
}

export { Progress };
