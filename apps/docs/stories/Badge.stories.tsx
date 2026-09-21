import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Badge, CheckIcon } from "@withalif/luna";

const meta = {
  title: "Luna/Badge",
  component: Badge,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof Badge>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { children: "New" } };

export const Variants: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Badge>Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="outline">Outline</Badge>
      <Badge variant="destructive">Destructive</Badge>
    </div>
  ),
};

export const WithIcon: Story = {
  render: () => (
    <Badge variant="secondary">
      <CheckIcon aria-hidden="true" />
      Ready
    </Badge>
  ),
};
