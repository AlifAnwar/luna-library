import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { MetricComparison } from "@withalif/luna";

const meta = {
  title: "Luna/MetricComparison",
  component: MetricComparison,
  args: {
    items: [
      { label: "Current period", value: "$128,400" },
      { label: "Previous period", value: "$114,240" },
    ],
  },
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="w-[min(32rem,calc(100vw-2rem))] rounded-lg border border-border bg-card p-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof MetricComparison>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    items: [
      { label: "Current period", value: "$128,400" },
      { label: "Previous period", value: "$114,240" },
    ],
  },
};

export const WithDescriptions: Story = {
  args: {
    items: [
      {
        label: "Planned",
        value: "2,000",
        description: "Records scheduled",
      },
      {
        label: "Completed",
        value: "1,896",
        description: "Records processed",
      },
    ],
  },
};

export const HighLowAndNegativeValues: Story = {
  args: {
    items: [
      { label: "Highest", value: "9,876,543,210" },
      { label: "Lowest", value: "0.0042" },
      { label: "Net change", value: "−128,400" },
    ],
  },
};

export const LongLabels: Story = {
  render: () => (
    <div className="w-64">
      <MetricComparison
        items={[
          {
            label: "Current rolling thirty-day reporting period",
            value: "18 hr 42 min",
          },
          {
            label: "Immediately preceding thirty-day reporting period",
            value: "21 hr 06 min",
          },
        ]}
      />
    </div>
  ),
};
