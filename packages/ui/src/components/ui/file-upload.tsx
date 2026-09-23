"use client";

import * as React from "react";
import { CloseIcon, FileIcon, UploadIcon } from "../../icons";
import { cn } from "../../lib/utils";
import { Button } from "./button";

type FileUploadRejectionReason =
  "file-too-large" | "file-type-not-accepted" | "too-many-files";

type FileUploadRejection = {
  file: File;
  reason: FileUploadRejectionReason;
};

type FileUploadProps = Omit<
  React.ComponentProps<"input">,
  | "children"
  | "className"
  | "defaultValue"
  | "onChange"
  | "size"
  | "type"
  | "value"
> & {
  files?: File[];
  defaultFiles?: File[];
  onFilesChange?: (files: File[]) => void;
  onRejectedFiles?: (rejections: FileUploadRejection[]) => void;
  maxFiles?: number;
  maxSize?: number;
  className?: string;
  dropzoneClassName?: string;
  listClassName?: string;
  browseLabel?: string;
  dropLabel?: string;
  helperText?: string;
  getRemoveLabel?: (file: File) => string;
  selectedFilesLabel?: string;
};

function acceptsFile(file: File, accept?: string) {
  if (!accept) return true;

  return accept
    .split(",")
    .map((type) => type.trim().toLowerCase())
    .filter(Boolean)
    .some((type) => {
      if (type.startsWith(".")) {
        return file.name.toLowerCase().endsWith(type);
      }

      if (type.endsWith("/*")) {
        return file.type.toLowerCase().startsWith(type.slice(0, -1));
      }

      return file.type.toLowerCase() === type;
    });
}

function formatFileSize(size: number) {
  if (size < 1024) return `${size} B`;

  const units = ["KB", "MB", "GB", "TB"];
  let value = size / 1024;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  return `${value >= 10 ? value.toFixed(0) : value.toFixed(1)} ${units[unitIndex]}`;
}

function FileUpload({
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
  "aria-label": ariaLabel = "Upload files",
  "aria-labelledby": ariaLabelledBy,
  accept,
  browseLabel = "Browse files",
  className,
  defaultFiles = [],
  disabled,
  dropLabel = "Drag and drop files here",
  dropzoneClassName,
  files,
  getRemoveLabel = (file) => `Remove ${file.name}`,
  helperText,
  id,
  listClassName,
  maxFiles,
  maxSize,
  multiple = false,
  onFilesChange,
  onRejectedFiles,
  required,
  selectedFilesLabel = "Selected files",
  ...inputProps
}: FileUploadProps) {
  const generatedId = React.useId();
  const inputId = id ?? generatedId;
  const inputRef = React.useRef<HTMLInputElement>(null);
  const rootRef = React.useRef<HTMLDivElement>(null);
  const pendingFocusIndex = React.useRef<number | null>(null);
  const [internalFiles, setInternalFiles] = React.useState(defaultFiles);
  const [isDragging, setIsDragging] = React.useState(false);
  const selectedFiles = files ?? internalFiles;
  const isInvalid = ariaInvalid === true || ariaInvalid === "true";

  React.useEffect(() => {
    if (!inputRef.current || typeof DataTransfer === "undefined") return;

    try {
      const transfer = new DataTransfer();
      selectedFiles.forEach((file) => transfer.items.add(file));
      inputRef.current.files = transfer.files;
    } catch {
      // Some browsers expose FileList as read-only. Callbacks remain canonical.
    }
  }, [selectedFiles]);

  /**
   * Removing a file unmounts the control that was focused, which would
   * otherwise drop focus to `<body>`. Move it somewhere deterministic instead:
   * the remove control that took the removed one's place, else the one before
   * it, else the browse trigger once the list is empty.
   *
   * Only ever runs for a removal, because `pendingFocusIndex` is set nowhere
   * else and is cleared as soon as it is read. Adding files, dragging and
   * re-renders driven by the consumer leave focus alone.
   */
  React.useEffect(() => {
    const index = pendingFocusIndex.current;
    if (index === null) return;

    pendingFocusIndex.current = null;

    const root = rootRef.current;
    if (!root) return;

    const removeButtons = root.querySelectorAll<HTMLButtonElement>(
      '[data-slot="file-upload-remove"]',
    );
    const target =
      removeButtons[index] ??
      removeButtons[index - 1] ??
      root.querySelector<HTMLButtonElement>(
        '[data-slot="file-upload-trigger"]',
      );

    target?.focus();
  }, [selectedFiles]);

  function commitFiles(nextFiles: File[]) {
    if (files === undefined) setInternalFiles(nextFiles);
    onFilesChange?.(nextFiles);
  }

  function addFiles(incomingFiles: File[]) {
    const rejections: FileUploadRejection[] = [];
    const acceptedFiles = incomingFiles.filter((file) => {
      if (!acceptsFile(file, accept)) {
        rejections.push({ file, reason: "file-type-not-accepted" });
        return false;
      }

      if (maxSize !== undefined && file.size > maxSize) {
        rejections.push({ file, reason: "file-too-large" });
        return false;
      }

      return true;
    });
    const baseFiles = multiple ? selectedFiles : [];
    const fileLimit = Math.max(0, maxFiles ?? (multiple ? Infinity : 1));
    const availableSlots = Math.max(0, fileLimit - baseFiles.length);
    const nextAcceptedFiles = acceptedFiles.slice(0, availableSlots);

    acceptedFiles.slice(availableSlots).forEach((file) => {
      rejections.push({ file, reason: "too-many-files" });
    });

    commitFiles([...baseFiles, ...nextAcceptedFiles]);
    if (rejections.length > 0) onRejectedFiles?.(rejections);
  }

  function removeFile(index: number) {
    pendingFocusIndex.current = index;
    commitFiles(selectedFiles.filter((_, fileIndex) => fileIndex !== index));
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    // `min-w-0` keeps the component shrinkable when a consumer drops it into a
    // flex or grid layout: as a flex item it would otherwise inherit
    // `min-width: auto`, letting a long file name set its floor and push
    // siblings out of the row. It is inert in normal flow, where `min-width:
    // auto` already computes to 0, so fixed-width containers are unaffected.
    <div
      ref={rootRef}
      data-slot="file-upload"
      className={cn("min-w-0 space-y-3", className)}
    >
      {/*
       * The real file input stays in the DOM so forms, labels and assistive
       * technology still see a file control, but it is taken out of the
       * sequential focus order: it is visually hidden, so focusing it would
       * strand keyboard users on an invisible stop. The visible Browse button
       * below is the intended interaction surface and forwards the click.
       */}
      <input
        {...inputProps}
        ref={inputRef}
        id={inputId}
        type="file"
        accept={accept}
        multiple={multiple}
        required={required}
        disabled={disabled}
        tabIndex={-1}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        aria-describedby={ariaDescribedBy}
        aria-invalid={ariaInvalid}
        className="sr-only"
        onChange={(event) => {
          addFiles(Array.from(event.currentTarget.files ?? []));
        }}
      />
      <div
        data-slot="file-upload-dropzone"
        data-dragging={isDragging || undefined}
        data-invalid={isInvalid || undefined}
        className={cn(
          "flex min-h-32 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-surface-subtle px-4 py-5 text-center transition-colors data-dragging:border-primary data-dragging:bg-primary-subtle data-invalid:border-destructive data-invalid:bg-danger-subtle",
          disabled && "cursor-not-allowed opacity-50",
          dropzoneClassName,
        )}
        onDragEnter={(event) => {
          event.preventDefault();
          if (!disabled) setIsDragging(true);
        }}
        onDragOver={(event) => {
          event.preventDefault();
          if (!disabled) event.dataTransfer.dropEffect = "copy";
        }}
        onDragLeave={(event) => {
          const nextTarget = event.relatedTarget;
          if (
            !(nextTarget instanceof Node) ||
            !event.currentTarget.contains(nextTarget)
          ) {
            setIsDragging(false);
          }
        }}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          if (!disabled) addFiles(Array.from(event.dataTransfer.files));
        }}
      >
        <div className="flex size-9 items-center justify-center rounded-full bg-primary-subtle text-primary">
          <UploadIcon className="size-5" aria-hidden="true" />
        </div>
        <div>
          <p className="text-body font-medium text-foreground">{dropLabel}</p>
          {helperText ? (
            <p className="mt-0.5 text-body-sm text-muted-foreground">
              {helperText}
            </p>
          ) : null}
        </div>
        <Button
          type="button"
          data-slot="file-upload-trigger"
          size="sm"
          variant="outline"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
        >
          {browseLabel}
        </Button>
      </div>

      {selectedFiles.length > 0 ? (
        <ul
          data-slot="file-upload-list"
          aria-label={selectedFilesLabel}
          aria-live="polite"
          className={cn("space-y-1.5", listClassName)}
        >
          {selectedFiles.map((file, index) => (
            <li
              key={`${file.name}-${file.size}-${file.lastModified}-${index}`}
              className="flex min-w-0 items-center gap-3 rounded-md border border-border bg-surface px-3 py-2"
            >
              <FileIcon
                className="size-5 shrink-0 text-muted-foreground"
                aria-hidden="true"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-body font-medium text-foreground">
                  {file.name}
                </p>
                <p className="text-caption text-muted-foreground">
                  {formatFileSize(file.size)}
                </p>
              </div>
              <button
                type="button"
                data-slot="file-upload-remove"
                aria-label={getRemoveLabel(file)}
                disabled={disabled}
                className="inline-flex size-7 shrink-0 items-center justify-center rounded-sm border border-transparent text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50"
                onClick={() => removeFile(index)}
              >
                <CloseIcon className="size-4" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export { FileUpload, formatFileSize };
export type { FileUploadProps, FileUploadRejection, FileUploadRejectionReason };
