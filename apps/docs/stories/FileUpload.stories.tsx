import * as React from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";
import {
  FileUpload,
  FormControl,
  FormDescription,
  FormField,
  FormLabel,
  FormMessage,
} from "@withalif/luna";

const meta: Meta<typeof FileUpload> = {
  title: "Luna/File Upload",
  component: FileUpload,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  args: {
    "aria-label": "Upload documents",
    helperText: "PDF or image files up to 5 MB",
  },
  decorators: [
    (Story) => (
      <div className="w-96 max-w-[calc(100vw-2rem)]">
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof meta>;

function ControlledFileUpload({ multiple = false }: { multiple?: boolean }) {
  const [files, setFiles] = React.useState<File[]>([]);

  return (
    <FileUpload
      aria-label="Upload documents"
      files={files}
      onFilesChange={setFiles}
      accept="application/pdf,image/*"
      maxFiles={multiple ? 3 : 1}
      maxSize={5 * 1024 * 1024}
      multiple={multiple}
      helperText="PDF or image files up to 5 MB"
    />
  );
}

export const Default: Story = {
  render: () => <ControlledFileUpload />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText("Upload documents");
    const file = new File(["quarterly report"], "report.pdf", {
      type: "application/pdf",
    });

    await userEvent.upload(input, file);
    await expect(canvas.getByText("report.pdf")).toBeVisible();
    await userEvent.click(
      canvas.getByRole("button", { name: "Remove report.pdf" }),
    );
    await expect(canvas.queryByText("report.pdf")).not.toBeInTheDocument();
  },
};

export const Multiple: Story = {
  render: () => <ControlledFileUpload multiple />,
};

export const Disabled: Story = {
  args: { disabled: true },
};

function InvalidFileUpload() {
  const [files, setFiles] = React.useState<File[]>([]);

  return (
    <FormField invalid required>
      <FormLabel>Supporting documents</FormLabel>
      <FormControl>
        <FileUpload
          aria-label="Supporting documents"
          files={files}
          onFilesChange={setFiles}
          helperText="PDF or image files up to 5 MB"
        />
      </FormControl>
      <FormDescription>
        Attach at least one supporting document.
      </FormDescription>
      <FormMessage>A supporting document is required.</FormMessage>
    </FormField>
  );
}

export const Invalid: Story = {
  render: () => <InvalidFileUpload />,
};

const LONG_FILENAME =
  "Quarterly_Consolidated_Financial_Statement_FY2026_Q3_FINAL_v17_approved_by_compliance.pdf";

function makeFile(name: string, size = 2048) {
  return new File([new Uint8Array(size)], name, { type: "application/pdf" });
}

function PrefilledFileUpload({
  names,
  disabled = false,
}: {
  names: string[];
  disabled?: boolean;
}) {
  const [files, setFiles] = React.useState<File[]>(() =>
    names.map((name) => makeFile(name)),
  );

  return (
    <FileUpload
      aria-label="Upload documents"
      files={files}
      onFilesChange={setFiles}
      multiple
      maxFiles={10}
      disabled={disabled}
      helperText="PDF or image files up to 5 MB"
    />
  );
}

/**
 * Regression: as a flex item the component inherited `min-width: auto`, so a
 * long file name set its floor and it pushed its sibling out of the row.
 */
export const FlexSqueeze: Story = {
  name: "Regression: shrinks inside a flex row",
  decorators: [
    (Story) => (
      <div className="flex w-[420px] gap-3">
        <Story />
        <div
          data-testid="flex-sibling"
          className="w-40 shrink-0 rounded-md bg-muted p-2 text-caption text-muted-foreground"
        >
          sibling
        </div>
      </div>
    ),
  ],
  render: () => <PrefilledFileUpload names={[LONG_FILENAME, "scan.pdf"]} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const row = canvasElement.querySelector<HTMLElement>(
      ".flex.w-\\[420px\\]",
    )!;
    const upload = canvasElement.querySelector<HTMLElement>(
      '[data-slot="file-upload"]',
    )!;
    const sibling = canvas.getByTestId("flex-sibling");

    // The component must fit the row it was given, not its longest file name.
    await expect(upload.getBoundingClientRect().width).toBeLessThanOrEqual(
      row.getBoundingClientRect().width,
    );
    // And the sibling must stay inside the row.
    await expect(
      Math.round(
        sibling.getBoundingClientRect().right -
          row.getBoundingClientRect().right,
      ),
    ).toBeLessThanOrEqual(0);
    // The long name still truncates rather than wrapping or overflowing.
    const name = canvas.getByText(LONG_FILENAME);
    await expect(name.scrollWidth).toBeGreaterThan(name.clientWidth);
    await expect(getComputedStyle(name).textOverflow).toBe("ellipsis");
  },
};

/**
 * Regression: disabled remove controls rendered identically to enabled ones,
 * so they looked clickable and silently did nothing.
 */
export const DisabledWithFiles: Story = {
  name: "Regression: disabled remove is visibly disabled",
  render: () => <PrefilledFileUpload names={["report.pdf"]} disabled />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const remove = canvas.getByRole("button", { name: "Remove report.pdf" });

    await expect(remove).toBeDisabled();
    await expect(getComputedStyle(remove).opacity).toBe("0.5");
    await expect(getComputedStyle(remove).pointerEvents).toBe("none");
    // The file survives an attempted removal.
    await expect(canvas.getByText("report.pdf")).toBeVisible();
  },
};

/**
 * Regression: removing the focused file unmounted its control and dropped
 * focus to `<body>`.
 */
export const FocusAfterRemoval: Story = {
  name: "Regression: focus survives removal",
  render: () => (
    <PrefilledFileUpload names={["first.pdf", "second.pdf", "third.pdf"]} />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Removing a middle file hands focus to whatever took its index.
    canvas.getByRole("button", { name: "Remove second.pdf" }).focus();
    await userEvent.keyboard("{Enter}");
    await expect(canvas.queryByText("second.pdf")).not.toBeInTheDocument();
    await expect(document.activeElement).toBe(
      canvas.getByRole("button", { name: "Remove third.pdf" }),
    );

    // Removing the last file falls back to the preceding control.
    canvas.getByRole("button", { name: "Remove third.pdf" }).focus();
    await userEvent.keyboard("{Enter}");
    await expect(document.activeElement).toBe(
      canvas.getByRole("button", { name: "Remove first.pdf" }),
    );

    // Emptying the list falls back to the browse trigger.
    canvas.getByRole("button", { name: "Remove first.pdf" }).focus();
    await userEvent.keyboard("{Enter}");
    await expect(canvas.queryByText("first.pdf")).not.toBeInTheDocument();
    await expect(document.activeElement).toBe(
      canvas.getByRole("button", { name: "Browse files" }),
    );
    await expect(document.body).not.toBe(document.activeElement);
  },
};
