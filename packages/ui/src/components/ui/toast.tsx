import { Toast as ToastPrimitive } from "@base-ui/react/toast";
import { cva, type VariantProps } from "class-variance-authority";

import {
  CancelIcon,
  CheckCircleIcon,
  CloseIcon,
  InfoIcon,
  WarningIcon,
} from "../../icons";
import { cn } from "../../lib/utils";

const ToastProvider = ToastPrimitive.Provider;
const useToast = ToastPrimitive.useToastManager;

const toastIconVariants = cva(
  "flex size-8 shrink-0 items-center justify-center rounded-full bg-white [&>svg]:size-4",
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

function Toast({ className, toast, ...props }: ToastPrimitive.Root.Props) {
  const variant = toast.type ?? "default";
  const Icon = (
    {
      info: InfoIcon,
      success: CheckCircleIcon,
      warning: WarningIcon,
      destructive: CancelIcon,
    } as Record<string, typeof InfoIcon | undefined>
  )[variant];

  return (
    <ToastPrimitive.Root
      data-slot="toast"
      data-variant={variant}
      toast={toast}
      className={cn(
        "pointer-events-auto relative w-full rounded-xl border border-border bg-surface p-4 text-body text-foreground shadow-sm data-[variant=info]:border-info-border data-[variant=info]:bg-info-subtle data-[variant=success]:border-success-border data-[variant=success]:bg-success-subtle data-[variant=warning]:border-warning-border data-[variant=warning]:bg-warning-subtle data-[variant=destructive]:border-danger-border data-[variant=destructive]:bg-danger-subtle data-ending-style:opacity-0 data-starting-style:opacity-0",
        className,
      )}
      {...props}
    >
      <ToastPrimitive.Content className="flex items-start gap-3">
        {Icon && (
          <span
            className={cn(
              toastIconVariants({
                variant: variant as VariantProps<
                  typeof toastIconVariants
                >["variant"],
              }),
            )}
          >
            <Icon aria-hidden="true" />
          </span>
        )}
        <div className="min-w-0 flex-1 self-center">
          <ToastPrimitive.Title className="font-semibold" />
          <ToastPrimitive.Description className="mt-0.5 text-body-sm text-foreground-secondary" />
          {toast.actionProps && (
            <ToastPrimitive.Action className="mt-2 rounded-md text-label font-medium text-primary outline-none hover:text-primary-hover focus-visible:ring-2 focus-visible:ring-ring" />
          )}
        </div>
        <ToastPrimitive.Close
          aria-label="Dismiss notification"
          className="shrink-0 rounded-md p-0.5 text-foreground-secondary outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
        >
          <CloseIcon className="size-4" aria-hidden="true" />
        </ToastPrimitive.Close>
      </ToastPrimitive.Content>
    </ToastPrimitive.Root>
  );
}

function ToastViewport({ className, ...props }: ToastPrimitive.Viewport.Props) {
  return (
    <ToastPrimitive.Portal>
      <ToastPrimitive.Viewport
        data-slot="toast-viewport"
        className={cn(
          "fixed top-4 right-4 z-100 flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-2 outline-none",
          className,
        )}
        {...props}
      >
        <ToastList />
      </ToastPrimitive.Viewport>
    </ToastPrimitive.Portal>
  );
}

function ToastList() {
  const { toasts } = useToast();
  return toasts.map((toast) => <Toast key={toast.id} toast={toast} />);
}

export { Toast, ToastProvider, ToastViewport, useToast };
