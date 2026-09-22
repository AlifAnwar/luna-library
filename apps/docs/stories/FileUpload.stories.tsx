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
