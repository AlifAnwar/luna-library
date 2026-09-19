import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Textarea } from "@withalif/luna";

const meta: Meta<typeof Textarea> = {
  title: "Luna/Textarea",
  component: Textarea,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div style={{ width: 320 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    "aria-label": "Description",
    placeholder: "Add a description...",
  },
};

export const WithLabel: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 6 }}>
      <label htmlFor="textarea-notes" style={{ fontSize: 13, fontWeight: 500 }}>
        Notes
      </label>
      <Textarea
        id="textarea-notes"
        defaultValue="This record needs a follow-up.\nThe owner will review it tomorrow."
      />
    </div>
  ),
};

export const WithHelperText: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 6 }}>
      <label
        htmlFor="textarea-summary"
        style={{ fontSize: 13, fontWeight: 500 }}
      >
        Summary
      </label>
      <Textarea
        id="textarea-summary"
        aria-describedby="textarea-summary-help"
        placeholder="Summarize the change"
        maxLength={500}
      />
      <span
        id="textarea-summary-help"
        style={{ color: "var(--muted-foreground)", fontSize: 13 }}
      >
        Keep it under 500 characters.
      </span>
    </div>
  ),
};

export const Invalid: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 6 }}>
      <label
        htmlFor="textarea-invalid"
        style={{ fontSize: 13, fontWeight: 500 }}
      >
        Reason
      </label>
      <Textarea
        id="textarea-invalid"
        aria-invalid="true"
        aria-describedby="textarea-invalid-error"
        placeholder="Explain your reason"
      />
      <span
        id="textarea-invalid-error"
        style={{ color: "var(--destructive)", fontSize: 13 }}
      >
        A reason is required.
      </span>
    </div>
  ),
};

export const Disabled: Story = {
  args: {
    "aria-label": "Archived notes",
    defaultValue: "This note can no longer be edited.",
    disabled: true,
  },
};
