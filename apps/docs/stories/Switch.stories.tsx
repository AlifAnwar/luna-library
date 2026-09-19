import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Switch } from "@withalif/luna";

const meta = {
  title: "Luna/Switch",
  component: Switch,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof Switch>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Off: Story = {
  args: { "aria-label": "Notifications" },
};

export const On: Story = {
  args: { "aria-label": "Notifications", defaultChecked: true },
};

export const WithLabel: Story = {
  render: () => (
    <label className="flex items-center gap-3 text-body">
      <Switch defaultChecked />
      Email notifications
    </label>
  ),
};

export const Disabled: Story = {
  render: () => (
    <label className="flex items-center gap-3 text-body text-muted-foreground">
      <Switch defaultChecked disabled />
      Locked setting
    </label>
  ),
};
