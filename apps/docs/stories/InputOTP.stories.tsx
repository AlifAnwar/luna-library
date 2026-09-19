import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { InputOTP } from "@withalif/luna";

const meta: Meta<typeof InputOTP> = {
  title: "Luna/OTP Input",
  component: InputOTP,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 8 }}>
      <label htmlFor="otp-story" style={{ fontSize: 13, fontWeight: 500 }}>
        Verification code
      </label>
      <InputOTP id="otp-story" aria-describedby="otp-help" />
      <span
        id="otp-help"
        style={{ color: "var(--muted-foreground)", fontSize: 13 }}
      >
        Enter or paste the six-digit code.
      </span>
    </div>
  ),
};

export const PartiallyFilled: Story = {
  args: { defaultValue: "123", "aria-label": "Verification code" },
};

export const Invalid: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 8 }}>
      <InputOTP
        aria-label="Verification code"
        aria-invalid="true"
        aria-describedby="otp-error"
        defaultValue="123456"
      />
      <span
        id="otp-error"
        style={{ color: "var(--destructive)", fontSize: 13 }}
      >
        This code is incorrect.
      </span>
    </div>
  ),
};

export const Disabled: Story = {
  args: {
    disabled: true,
    defaultValue: "123456",
    "aria-label": "Verification code",
  },
};
