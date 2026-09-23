import * as React from "react";

import { CheckIcon } from "../../icons";
import { cn } from "../../lib/utils";

type StepperOrientation = "horizontal" | "vertical";

type StepStatus = "completed" | "current" | "upcoming";

type StepperContextValue = {
  currentStep: number;
  orientation: StepperOrientation;
};

const StepperContext = React.createContext<StepperContextValue | null>(null);

function useStepper(componentName: string) {
  const context = React.useContext(StepperContext);

  if (!context) {
    throw new Error(`${componentName} must be used within Stepper.`);
  }

  return context;
}

type StepperItemContextValue = {
  status: StepStatus;
  step: number;
};

const StepperItemContext = React.createContext<StepperItemContextValue | null>(
  null,
);

function useStepperItem(componentName: string) {
  const context = React.useContext(StepperItemContext);

  if (!context) {
    throw new Error(`${componentName} must be used within StepperItem.`);
  }

  return context;
}

type StepperProps = React.ComponentProps<"ol"> & {
  currentStep: number;
  orientation?: StepperOrientation;
};

/**
 * Steps are an ordered sequence, so the stepper renders as `<ol>` and each
 * `StepperItem` as `<li>`. That gives assistive technology the step count and
 * each step's position for free. Tailwind's preflight strips list styling and
 * the `flex` display below overrides `list-item`, so the visual result is
 * unchanged.
 */
function Stepper({
  className,
  currentStep,
  orientation = "horizontal",
  ...props
}: StepperProps) {
  const context = React.useMemo<StepperContextValue>(
    () => ({ currentStep, orientation }),
    [currentStep, orientation],
  );

  return (
    <StepperContext.Provider value={context}>
      <ol
        data-slot="stepper"
        data-orientation={orientation}
        className={cn(
          "flex w-full",
          orientation === "horizontal"
            ? "flex-row items-start"
            : "flex-col items-stretch",
          className,
        )}
        {...props}
      />
    </StepperContext.Provider>
  );
}

type StepperItemProps = React.ComponentProps<"li"> & {
  step: number;
};

function StepperItem({ className, step, ...props }: StepperItemProps) {
  const { currentStep, orientation } = useStepper("StepperItem");
  const status: StepStatus =
    step < currentStep
      ? "completed"
      : step === currentStep
        ? "current"
        : "upcoming";
  const itemContext = React.useMemo<StepperItemContextValue>(
    () => ({ status, step }),
    [status, step],
  );

  return (
    <StepperItemContext.Provider value={itemContext}>
      <li
        data-slot="stepper-item"
        data-status={status}
        aria-current={status === "current" ? "step" : undefined}
        className={cn(
          "group/stepper-item flex flex-1",
          orientation === "horizontal"
            ? "flex-col items-center gap-2 text-center"
            : "flex-row items-start gap-3 text-left",
          className,
        )}
        {...props}
      />
    </StepperItemContext.Provider>
  );
}

function StepperIndicator({
  children,
  className,
  ...props
}: React.ComponentProps<"span">) {
  const { status, step } = useStepperItem("StepperIndicator");

  return (
    <span
      data-slot="stepper-indicator"
      data-status={status}
      className={cn(
        "flex size-10 shrink-0 items-center justify-center rounded-full border-2 border-transparent transition-colors",
        status === "current" && "border-dashed border-primary",
      )}
    >
      <span
        data-slot="stepper-indicator-circle"
        className={cn(
          "flex size-8 items-center justify-center rounded-full text-label font-medium transition-colors",
          status === "upcoming" &&
            "border-2 border-border bg-transparent text-muted-foreground",
          status === "current" && "bg-primary text-primary-foreground",
          status === "completed" && "bg-success text-success-foreground",
          className,
        )}
        {...props}
      >
        {children ??
          (status === "completed" ? (
            <CheckIcon className="size-4" aria-hidden="true" />
          ) : (
            step + 1
          ))}
      </span>
    </span>
  );
}

function StepperStepLabel({
  className,
  ...props
}: React.ComponentProps<"span">) {
  const { status } = useStepperItem("StepperStepLabel");

  return (
    <span
      data-slot="stepper-step-label"
      data-status={status}
      className={cn(
        "text-caption font-medium text-muted-foreground uppercase tracking-wide group-data-[status=current]/stepper-item:text-primary",
        className,
      )}
      {...props}
    />
  );
}

function StepperTitle({ className, ...props }: React.ComponentProps<"span">) {
  const { status } = useStepperItem("StepperTitle");

  return (
    <span
      data-slot="stepper-title"
      data-status={status}
      className={cn(
        "text-body font-medium text-foreground group-data-[status=upcoming]/stepper-item:text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

function StepperDescription({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="stepper-description"
      className={cn("text-body-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

type StepperSeparatorProps = React.ComponentProps<"li"> & {
  step?: number;
};

/**
 * Rendered as `<li>` because it sits between `StepperItem`s inside the `<ol>`,
 * where a `<div>` would be invalid. It stays hidden from assistive technology,
 * so it adds no entry to the announced step list.
 */
function StepperSeparator({
  className,
  step,
  ...props
}: StepperSeparatorProps) {
  const { currentStep, orientation } = useStepper("StepperSeparator");
  const completed = step !== undefined && step < currentStep;

  return (
    <li
      data-slot="stepper-separator"
      data-completed={completed ? "" : undefined}
      role="presentation"
      aria-hidden="true"
      className={cn(
        "transition-colors",
        completed ? "bg-success" : "bg-border",
        orientation === "horizontal"
          ? "mt-6 h-0.5 flex-1 self-start"
          : "ml-6 my-1 min-h-8 w-0.5 flex-1",
        className,
      )}
      {...props}
    />
  );
}

export {
  Stepper,
  StepperDescription,
  StepperIndicator,
  StepperItem,
  StepperSeparator,
  StepperStepLabel,
  StepperTitle,
  type StepperProps,
  type StepperSeparatorProps,
  type StepStatus,
};
