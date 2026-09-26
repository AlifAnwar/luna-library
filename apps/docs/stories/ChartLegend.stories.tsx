import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ChartLegend } from "@withalif/luna";

const meta = {
  title: "Luna/ChartLegend",
  component: ChartLegend,
  args: {
    items: [
      {
        id: "current",
        label: "Current period",
        color: "chart-1",
        marker: "line",
      },
      {
        id: "previous",
        label: "Previous period",
        color: "chart-2",
        marker: "dash",
      },
    ],
  },
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="w-[min(40rem,calc(100vw-2rem))] rounded-lg border border-border bg-card p-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ChartLegend>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const MultipleSeries: Story = {
  args: {
    items: [
      { id: "one", label: "Series one", color: "chart-1", marker: "line" },
      { id: "two", label: "Series two", color: "chart-2", marker: "dash" },
      { id: "three", label: "Series three", color: "chart-3", marker: "dot" },
      { id: "four", label: "Series four", color: "chart-4", marker: "square" },
      {
        id: "five",
        label: "Series five",
        color: "chart-5",
        marker: "diamond",
      },
    ],
  },
};

export const Vertical: Story = {
  args: {
    orientation: "vertical",
  },
};

export const LongLabels: Story = {
  args: {
    items: [
      {
        id: "current",
        label: "Current rolling thirty-day reporting period",
        color: "chart-1",
        marker: "line",
      },
      {
        id: "previous",
        label: "Immediately preceding thirty-day reporting period",
        color: "chart-2",
        marker: "dash",
      },
    ],
  },
};
