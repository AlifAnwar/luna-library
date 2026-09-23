import { Avatar as AvatarPrimitive } from "@base-ui/react/avatar";
import { cn } from "../../lib/utils";

function Avatar({
  className,
  size = "default",
  ...props
}: AvatarPrimitive.Root.Props & { size?: "sm" | "default" | "lg" }) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      data-size={size}
      className={cn(
        "relative inline-flex size-10 shrink-0 overflow-hidden rounded-full bg-muted text-body text-muted-foreground data-[size=sm]:size-8 data-[size=lg]:size-12",
        className,
      )}
      {...props}
    />
  );
}

function AvatarImage({ className, ...props }: AvatarPrimitive.Image.Props) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn("size-full object-cover", className)}
      {...props}
    />
  );
}

function AvatarFallback({
  className,
  ...props
}: AvatarPrimitive.Fallback.Props) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        "flex size-full items-center justify-center font-medium text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

export { Avatar, AvatarImage, AvatarFallback };
