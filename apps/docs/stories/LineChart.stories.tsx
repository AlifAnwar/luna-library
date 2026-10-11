import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import {
  LineChart,
  type CartesianChartDatum,
  type CartesianChartSeries,
} from "@withalif/luna";

const monthlyData = [
  { category: "Apr", current: 1280, previous: 1120 },
  { category: "May", current: 1460, previous: 1240 },
  { category: "Jun", current: 1380, previous: 1310 },
  { category: "Jul", current: 1710, previous: 1490 },
  { category: "Aug", current: 1840, previous: 1570 },
  { category: "Sep", current: 1920, previous: 1680 },
] satisfies readonly CartesianChartDatum[];

const currentSeries = [
  { dataKey: "current", label: "Current period" },
] satisfies readonly CartesianChartSeries[];

const comparisonSeries = [
  ...currentSeries,
  {
    dataKey: "previous",
    label: "Previous period",
    marker: "dash",
  },
] satisfies readonly CartesianChartSeries[];

const meta = {
  title: "Luna/LineChart",
  component: LineChart,
  args: {
    title: "Processed records",
    description: "Monthly completed records for the selected period.",
    data: monthlyData,
    series: currentSeries,
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
} satisfies Meta<typeof LineChart>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Modern: Story = {
  args: { variant: "modern" },
};

export const MultipleSeries: Story = {
  args: { series: comparisonSeries },
};

export const Loading: Story = {
  args: { loading: true, loadingLabel: "Loading processed records" },
};

export const Empty: Story = {
  args: {
    data: [],
    emptyTitle: "No processed records",
    emptyDescription: "Records will appear after the next synchronization.",
  },
};

export const CustomFormatter: Story = {
  args: {
    formatValue: (value) =>
      `${new Intl.NumberFormat("en-US").format(value)} records`,
    formatYAxis: (value) =>
      new Intl.NumberFormat("en-US", { notation: "compact" }).format(value),
  },
};

export const HighLowAndNegativeValues: Story = {
  args: {
    title: "Net processing change",
    description:
      "Values include large, fractional, zero, and negative changes.",
    data: [
      { category: "Week 1", current: 9876543 },
      { category: "Week 2", current: 0.0042 },
      { category: "Week 3", current: 0 },
      { category: "Week 4", current: -128400 },
    ],
    formatValue: (value) =>
      new Intl.NumberFormat("en-US", { maximumFractionDigits: 4 }).format(
        value,
      ),
    formatYAxis: (value) =>
      new Intl.NumberFormat("en-US", { notation: "compact" }).format(value),
  },
};

export const LongLabels: Story = {
  args: {
    title:
      "Processed records across the current rolling thirty-day reporting period",
    description:
      "This expanded description verifies that the chart remains readable when localization produces substantially longer interface text.",
    data: monthlyData.map((datum) => ({
      ...datum,
      category: `${datum.category} reporting period`,
    })),
    series: [
      {
        dataKey: "current",
        label: "Current rolling thirty-day reporting period",
      },
      {
        dataKey: "previous",
        label: "Immediately preceding thirty-day reporting period",
        marker: "dash",
      },
    ],
  },
};

export const Responsive: Story = {
  decorators: [
    (Story) => (
      <div className="w-full max-w-72">
        <Story />
      </div>
    ),
  ],
  args: { series: comparisonSeries, size: "sm" },
};
