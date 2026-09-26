import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ChartLoadingState } from "@withalif/luna";

const meta = {
  title: "Luna/ChartLoadingState",
  component: ChartLoadingState,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="grid min-h-64 w-[min(40rem,calc(100vw-2rem))] rounded-lg border border-border bg-card p-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ChartLoadingState>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const LocalizedAnnouncement: Story = {
  args: { label: "Memuat visualisasi" },
};
