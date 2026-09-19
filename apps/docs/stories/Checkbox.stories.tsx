import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Checkbox } from "@withalif/luna";

const meta = {
  title: "Luna/Checkbox",
  component: Checkbox,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof Checkbox>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Unchecked: Story = {
  args: { "aria-label": "Select record" },
};

export const Checked: Story = {
  args: { "aria-label": "Select record", defaultChecked: true },
};

export const Indeterminate: Story = {
  args: { "aria-label": "Select all records", indeterminate: true },
};

export const WithLabel: Story = {
  render: () => (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <Checkbox id="checkbox-updates" defaultChecked />
      <label htmlFor="checkbox-updates" style={{ fontSize: 14 }}>
        Email me updates
      </label>
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <Checkbox id="checkbox-disabled" disabled defaultChecked />
      <label htmlFor="checkbox-disabled" style={{ fontSize: 14 }}>
        Locked setting
      </label>
    </div>
  ),
};

export const Invalid: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 6 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Checkbox
          id="checkbox-invalid"
          aria-invalid="true"
          aria-describedby="checkbox-error"
        />
        <label htmlFor="checkbox-invalid" style={{ fontSize: 14 }}>
          Accept terms
        </label>
      </div>
      <span
        id="checkbox-error"
        style={{ color: "var(--destructive)", fontSize: 13 }}
      >
        Accept the terms to continue.
      </span>
    </div>
  ),
};
