import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import {
  AreaChart,
  type CartesianChartDatum,
  type CartesianChartSeries,
} from "@withalif/luna";

const dailyData = [
  { category: "Mon", current: 64, baseline: 52 },
  { category: "Tue", current: 72, baseline: 58 },
  { category: "Wed", current: 68, baseline: 61 },
  { category: "Thu", current: 81, baseline: 67 },
  { category: "Fri", current: 89, baseline: 73 },
  { category: "Sat", current: 76, baseline: 69 },
  { category: "Sun", current: 84, baseline: 71 },
] satisfies readonly CartesianChartDatum[];

const currentSeries = [
  { dataKey: "current", label: "Current period" },
] satisfies readonly CartesianChartSeries[];

const meta = {
  title: "Luna/AreaChart",
  component: AreaChart,
  args: {
    title: "Daily utilization",
    description: "Utilization across the selected seven-day period.",
    data: dailyData,
    series: currentSeries,
    formatValue: (value) => `${value}%`,
    formatYAxis: (value) => `${value}%`,
  },
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="w-[min(48rem,calc(100vw-2rem))] rounded-lg border border-border bg-card p-4 shadow-xs">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof AreaChart>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Modern: Story = {
  args: { variant: "modern" },
};

export const SolidFill: Story = {
  args: {
    fill: "solid",
    variant: "modern",
    series: [{ dataKey: "current", label: "Current period", marker: "dot" }],
  },
};

export const GradientFill: Story = {
  args: {
    title: "Utilization trend",
    description: "Current and baseline utilization across the selected period.",
    fill: "gradient",
    variant: "modern",
    series: [
      { dataKey: "current", label: "Current period", marker: "dot" },
      {
        dataKey: "baseline",
        label: "Baseline",
        color: "chart-2",
        marker: "dot",
      },
    ],
  },
};

export const MultipleSeries: Story = {
  args: {
    description: "Current utilization compared with the operational baseline.",
    series: [
      ...currentSeries,
      { dataKey: "baseline", label: "Baseline", marker: "dash" },
    ],
  },
};

export const Loading: Story = {
  args: { loading: true, loadingLabel: "Loading utilization" },
};

export const Empty: Story = {
  args: {
    data: [],
    emptyTitle: "No utilization data",
    emptyDescription: "Utilization will appear after activity is recorded.",
  },
};

export const CustomFormatter: Story = {
  args: {
    formatValue: (value) => `${value.toFixed(1)} percent`,
    formatYAxis: (value) => `${value.toFixed(0)}%`,
  },
};

export const LowAndNegativeValues: Story = {
  args: {
    title: "Daily variance",
    description:
      "Variance from baseline, including fractional and negative values.",
    data: [
      { category: "Mon", current: 0.4 },
      { category: "Tue", current: -1.2 },
      { category: "Wed", current: 0 },
      { category: "Thu", current: 2.8 },
      { category: "Fri", current: -0.6 },
    ],
    formatValue: (value) => `${value.toFixed(1)} points`,
    formatYAxis: (value) => value.toFixed(1),
  },
};

export const LongLabels: Story = {
  args: {
    title:
      "Daily utilization throughout the selected operational reporting period",
    description:
      "Long surrounding copy and category labels wrap without clipping the visualization or its accessible alternative.",
    data: dailyData.map((datum) => ({
      ...datum,
      category: `${datum.category} reporting day`,
    })),
    series: [
      {
        dataKey: "current",
        label: "Current operational reporting period",
      },
      {
        dataKey: "baseline",
        label: "Established operational utilization baseline",
        marker: "dash",
      },
    ],
  },
};

export const Responsive: Story = {
  decorators: [
    (Story) => (
      <div className="w-72">
        <Story />
      </div>
    ),
  ],
  args: { size: "sm" },
};
