import { Search01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Input } from "@withalif/luna";

const meta: Meta<typeof Input> = {
  title: "Luna/Input",
  component: Input,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  args: { "aria-label": "Name" },
  decorators: [
    (Story) => (
      <div style={{ width: 280 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { defaultValue: "Acme Corporation" },
};

export const Placeholder: Story = {
  args: { placeholder: "Enter a name" },
};

export const WithLabel: Story = {
  render: () => (
    <div style={{ width: 280, display: "grid", gap: 6 }}>
      <label htmlFor="input-email" style={{ fontSize: 13, fontWeight: 500 }}>
        Work email
      </label>
      <Input id="input-email" type="email" placeholder="name@company.com" />
    </div>
  ),
};

export const WithHelperText: Story = {
  render: () => (
    <div style={{ width: 280, display: "grid", gap: 6 }}>
      <label htmlFor="input-code" style={{ fontSize: 13, fontWeight: 500 }}>
        Reference code
      </label>
      <Input
        id="input-code"
        aria-describedby="input-code-help"
        placeholder="INV-001"
      />
      <span
        id="input-code-help"
        style={{ color: "var(--muted-foreground)", fontSize: 13 }}
      >
        Use the code shown on your invoice.
      </span>
    </div>
  ),
};

export const WithIcon: Story = {
  render: () => (
    <div style={{ position: "relative", width: 280 }}>
      <HugeiconsIcon
        icon={Search01Icon}
        size={18}
        strokeWidth={1.5}
        aria-hidden="true"
        style={{
          position: "absolute",
          left: 12,
          top: "50%",
          transform: "translateY(-50%)",
          pointerEvents: "none",
          color: "var(--muted-foreground)",
        }}
      />
      <Input
        aria-label="Search records"
        placeholder="Search records"
        style={{ paddingLeft: 38 }}
      />
    </div>
  ),
};

export const Invalid: Story = {
  render: () => (
    <div style={{ width: 280, display: "grid", gap: 6 }}>
      <label htmlFor="input-invalid" style={{ fontSize: 13, fontWeight: 500 }}>
        Work email
      </label>
      <Input
        id="input-invalid"
        type="email"
        defaultValue="not-an-email"
        aria-invalid="true"
        aria-describedby="input-invalid-error"
      />
      <span
        id="input-invalid-error"
        style={{ color: "var(--destructive)", fontSize: 13 }}
      >
        Enter a valid email address.
      </span>
    </div>
  ),
};

export const Disabled: Story = {
  args: { disabled: true, defaultValue: "Cannot edit this field" },
};
