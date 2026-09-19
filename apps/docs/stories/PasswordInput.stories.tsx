import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { PasswordInput } from "@withalif/luna";

const meta: Meta<typeof PasswordInput> = {
  title: "Luna/Password Input",
  component: PasswordInput,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
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
  args: {
    "aria-label": "Password",
    placeholder: "Enter password",
    autoComplete: "current-password",
  },
};

export const WithLabel: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 6 }}>
      <label htmlFor="password-story" style={{ fontSize: 13, fontWeight: 500 }}>
        Password
      </label>
      <PasswordInput
        id="password-story"
        placeholder="Enter password"
        autoComplete="current-password"
      />
    </div>
  ),
};

export const Disabled: Story = {
  args: {
    "aria-label": "Password",
    defaultValue: "secret-password",
    disabled: true,
  },
};
