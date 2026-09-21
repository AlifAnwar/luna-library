import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Skeleton } from "@withalif/luna";

const meta = {
  title: "Luna/Skeleton",
  component: Skeleton,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof Skeleton>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Text: Story = {
  render: () => (
    <div className="grid w-64 gap-2" aria-label="Loading text">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  ),
};

export const Card: Story = {
  render: () => (
    <div
      className="grid w-64 gap-3 rounded-lg border border-border bg-card p-4"
      aria-label="Loading card"
    >
      <Skeleton className="h-5 w-1/2" />
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  ),
};
