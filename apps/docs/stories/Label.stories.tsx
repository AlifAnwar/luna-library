import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Checkbox, Input, Label } from "@withalif/luna";

const meta = {
  title: "Luna/Label",
  component: Label,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof Label>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { children: "Email address", htmlFor: "label-default" },
};

export const Required: Story = {
  args: {
    children: "Email address",
    htmlFor: "label-required",
    required: true,
  },
};

export const Disabled: Story = {
  args: {
    children: "Email address",
    disabled: true,
    htmlFor: "label-disabled",
  },
};

export const WithInput: Story = {
  render: () => (
    <div className="grid w-72 gap-1.5">
      <Label htmlFor="label-email">Email address</Label>
      <Input id="label-email" type="email" placeholder="name@company.com" />
    </div>
  ),
};

export const WithCheckbox: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Checkbox id="label-updates" defaultChecked />
      <Label htmlFor="label-updates">Email me updates</Label>
    </div>
  ),
};
