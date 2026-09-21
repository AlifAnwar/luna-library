import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Separator } from "@withalif/luna";

const meta = {
  title: "Luna/Separator",
  component: Separator,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof Separator>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Horizontal: Story = {
  render: () => (
    <div className="grid w-64 gap-3 text-body">
      <span>Overview</span>
      <Separator />
      <span>Details</span>
    </div>
  ),
};

export const Vertical: Story = {
  render: () => (
    <div className="flex h-6 items-center gap-3 text-body">
      <span>Overview</span>
      <Separator orientation="vertical" />
      <span>Details</span>
    </div>
  ),
};
