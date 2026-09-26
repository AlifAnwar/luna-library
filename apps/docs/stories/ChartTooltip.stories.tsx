import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ChartTooltip } from "@withalif/luna";

const meta = {
  title: "Luna/ChartTooltip",
  component: ChartTooltip,
  args: {
    "aria-label": "Data point details",
    label: "24 Sep 2026",
    items: [
      {
        id: "current",
        label: "Current period",
        value: 1842,
        color: "chart-1",
        marker: "line",
      },
      {
        id: "previous",
        label: "Previous period",
        value: 1678,
        color: "chart-2",
        marker: "dash",
      },
    ],
  },
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof ChartTooltip>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const CustomFormatter: Story = {
  args: {
    formatValue: (value) =>
      `${new Intl.NumberFormat("en-US").format(value)} records`,
  },
};

export const HighLowAndNegativeValues: Story = {
  args: {
    label: "Observed range",
    items: [
      {
        id: "high",
        label: "Highest",
        value: 9876543210,
        color: "chart-1",
        marker: "line",
      },
      {
        id: "low",
        label: "Lowest",
        value: 0.0042,
        color: "chart-3",
        marker: "dot",
      },
      {
        id: "negative",
        label: "Net change",
        value: -128400,
        color: "chart-2",
        marker: "dash",
      },
    ],
    formatValue: (value) =>
      new Intl.NumberFormat("en-US", { maximumFractionDigits: 4 }).format(
        value,
      ),
  },
};

export const Inactive: Story = {
  args: { active: false },
};
