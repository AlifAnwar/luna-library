"use client";

import * as React from "react";
import { EyeIcon, EyeOffIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { cn } from "cn";

import { Input } from "./input";

type PasswordInputProps = Omit<React.ComponentProps<"input">, "type">;

function PasswordInput({
  className,
  disabled,
  id: idProp,
  ...props
}: PasswordInputProps) {
  const [visible, setVisible] = React.useState(false);
  const generatedId = React.useId();
  const id = idProp ?? generatedId;

  return (
    <div data-slot="password-input" className="relative w-full">
      <Input
        {...props}
        id={id}
        type={visible ? "text" : "password"}
        disabled={disabled}
        className={cn("pr-11", className)}
      />
      <button
        type="button"
        aria-label={visible ? "Hide password" : "Show password"}
        aria-controls={id}
        aria-pressed={visible}
        disabled={disabled}
        onClick={() => setVisible((current) => !current)}
        className="absolute inset-y-0 right-1 my-auto flex size-control-xs items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
      >
        <HugeiconsIcon
          icon={visible ? EyeOffIcon : EyeIcon}
          size={18}
          strokeWidth={1.5}
          aria-hidden="true"
        />
      </button>
    </div>
  );
}

export { PasswordInput, type PasswordInputProps };
