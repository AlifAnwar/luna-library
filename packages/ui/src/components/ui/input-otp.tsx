"use client";

import * as React from "react";
import { cn } from "../../lib/utils.js";

type InputOTPProps = Omit<
  React.ComponentProps<"input">,
  "type" | "value" | "defaultValue" | "maxLength" | "size"
> & {
  length?: number;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  onComplete?: (value: string) => void;
};

function normalizeValue(value: string, inputMode: string, length: number) {
  const allowed = inputMode === "numeric" ? value.replace(/\D/g, "") : value;
  return allowed.slice(0, length);
}

function InputOTP({
  length = 6,
  value,
  defaultValue = "",
  onValueChange,
  onComplete,
  onChange,
  onFocus,
  onBlur,
  onClick,
  onPaste,
  inputMode = "numeric",
  autoComplete = "one-time-code",
  className,
  disabled,
  pattern,
  "aria-label": ariaLabel,
  "aria-invalid": ariaInvalid,
  ...props
}: InputOTPProps) {
  const slotCount = Number.isFinite(length)
    ? Math.max(1, Math.floor(length))
    : 6;
  const [internalValue, setInternalValue] = React.useState(() =>
    normalizeValue(defaultValue, inputMode, slotCount),
  );
  const [focused, setFocused] = React.useState(false);
  const currentValue = normalizeValue(
    value ?? internalValue,
    inputMode,
    slotCount,
  );
  const invalid = ariaInvalid === true || ariaInvalid === "true";

  function commit(nextValue: string) {
    if (nextValue === currentValue) return;
    if (value === undefined) setInternalValue(nextValue);
    onValueChange?.(nextValue);
    if (nextValue.length === slotCount && currentValue.length !== slotCount) {
      onComplete?.(nextValue);
    }
  }

  return (
    <div
      data-slot="input-otp"
      className={cn(
        "relative inline-flex max-w-full gap-2",
        disabled && "opacity-50",
        className,
      )}
    >
      {Array.from({ length: slotCount }, (_, index) => (
        <span
          key={index}
          data-slot="input-otp-slot"
          aria-hidden="true"
          className={cn(
            "flex size-control-lg shrink-0 items-center justify-center rounded-md border border-input bg-surface text-body font-medium text-foreground",
            invalid && "border-destructive",
            focused &&
              !disabled &&
              index === Math.min(currentValue.length, slotCount - 1) &&
              (invalid
                ? "border-destructive ring-2 ring-destructive/20"
                : "border-ring ring-2 ring-ring/50"),
          )}
        >
          {currentValue[index] ?? ""}
        </span>
      ))}
      <input
        {...props}
        data-slot="input-otp-field"
        type="text"
        value={currentValue}
        maxLength={slotCount}
        inputMode={inputMode}
        autoComplete={autoComplete}
        pattern={pattern ?? (inputMode === "numeric" ? "[0-9]*" : undefined)}
        disabled={disabled}
        aria-label={ariaLabel ?? "One-time code"}
        aria-invalid={ariaInvalid}
        onChange={(event) => {
          const nextValue = normalizeValue(
            event.currentTarget.value,
            inputMode,
            slotCount,
          );
          event.currentTarget.value = nextValue;
          commit(nextValue);
          onChange?.(event);
        }}
        onPaste={(event) => {
          onPaste?.(event);
          if (event.defaultPrevented) return;
          const nextValue = normalizeValue(
            event.clipboardData.getData("text"),
            inputMode,
            slotCount,
          );
          if (nextValue) {
            event.preventDefault();
            commit(nextValue);
          }
        }}
        onFocus={(event) => {
          setFocused(true);
          event.currentTarget.setSelectionRange(
            currentValue.length,
            currentValue.length,
          );
          onFocus?.(event);
        }}
        onBlur={(event) => {
          setFocused(false);
          onBlur?.(event);
        }}
        onClick={(event) => {
          event.currentTarget.setSelectionRange(
            currentValue.length,
            currentValue.length,
          );
          onClick?.(event);
        }}
        className="absolute inset-0 h-full w-full cursor-text opacity-0"
      />
    </div>
  );
}

export { InputOTP, type InputOTPProps };
