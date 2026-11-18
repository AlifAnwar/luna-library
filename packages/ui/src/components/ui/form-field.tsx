"use client";
import * as React from "react";
import { cn } from "../../lib/utils.js";
import { Label, type LabelProps } from "./label.js";

type FormFieldContextValue = {
  controlId: string;
  descriptionId: string;
  disabled: boolean;
  invalid: boolean;
  labelId: string;
  messageId: string;
  required: boolean;
};

const FormFieldContext = React.createContext<FormFieldContextValue | null>(
  null,
);

function useFormField(componentName: string) {
  const context = React.useContext(FormFieldContext);

  if (!context) {
    throw new Error(`${componentName} must be used within FormField.`);
  }

  return context;
}

type FormFieldProps = React.ComponentProps<"div"> & {
  disabled?: boolean;
  invalid?: boolean;
  required?: boolean;
};

function FormField({
  className,
  disabled = false,
  id,
  invalid = false,
  required = false,
  ...props
}: FormFieldProps) {
  const generatedId = React.useId();
  const fieldId = id ?? `form-field-${generatedId.replaceAll(":", "")}`;
  const context = React.useMemo<FormFieldContextValue>(
    () => ({
      controlId: `${fieldId}-control`,
      descriptionId: `${fieldId}-description`,
      disabled,
      invalid,
      labelId: `${fieldId}-label`,
      messageId: `${fieldId}-message`,
      required,
    }),
    [disabled, fieldId, invalid, required],
  );

  return (
    <FormFieldContext.Provider value={context}>
      <div
        id={fieldId}
        data-slot="form-field"
        data-disabled={disabled || undefined}
        data-invalid={invalid || undefined}
        data-required={required || undefined}
        className={cn("group/form-field grid gap-1.5", className)}
        {...props}
      />
    </FormFieldContext.Provider>
  );
}

function FormLabel({ disabled, htmlFor, id, required, ...props }: LabelProps) {
  const context = useFormField("FormLabel");

  return (
    <Label
      id={id ?? context.labelId}
      htmlFor={htmlFor ?? context.controlId}
      disabled={disabled ?? context.disabled}
      required={required ?? context.required}
      data-slot="form-label"
      {...props}
    />
  );
}

type FormControlChildProps = {
  "aria-describedby"?: string;
  "aria-invalid"?: React.AriaAttributes["aria-invalid"];
  "aria-labelledby"?: string;
  "aria-required"?: React.AriaAttributes["aria-required"];
  disabled?: boolean;
  id?: string;
  required?: boolean;
};

type FormControlProps = {
  children: React.ReactElement<FormControlChildProps>;
};

function mergeIds(...values: Array<string | undefined>) {
  return Array.from(
    new Set(
      values.flatMap((value) => value?.split(/\s+/).filter(Boolean) ?? []),
    ),
  ).join(" ");
}

function FormControl({ children }: FormControlProps) {
  const context = useFormField("FormControl");
  const childProps = children.props;
  const describedBy = mergeIds(
    childProps["aria-describedby"],
    context.descriptionId,
    context.messageId,
  );
  const labelledBy = mergeIds(childProps["aria-labelledby"], context.labelId);

  return React.cloneElement(children, {
    "aria-describedby": describedBy || undefined,
    "aria-invalid": childProps["aria-invalid"] ?? context.invalid,
    "aria-labelledby": labelledBy || undefined,
    "aria-required": childProps["aria-required"] ?? context.required,
    disabled: childProps.disabled ?? context.disabled,
    id: childProps.id ?? context.controlId,
    required: childProps.required ?? context.required,
  });
}

function FormDescription({
  className,
  id,
  ...props
}: React.ComponentProps<"p">) {
  const context = useFormField("FormDescription");

  return (
    <p
      id={id ?? context.descriptionId}
      data-slot="form-description"
      className={cn("text-body-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

function FormMessage({
  children,
  className,
  id,
  role = "alert",
  ...props
}: React.ComponentProps<"p">) {
  const context = useFormField("FormMessage");

  if (
    children === null ||
    children === undefined ||
    children === false ||
    children === ""
  ) {
    return null;
  }

  return (
    <p
      id={id ?? context.messageId}
      role={role}
      data-slot="form-message"
      className={cn("text-body-sm font-medium text-destructive", className)}
      {...props}
    >
      {children}
    </p>
  );
}

export {
  FormControl,
  FormDescription,
  FormField,
  FormLabel,
  FormMessage,
  type FormControlProps,
  type FormFieldProps,
};
