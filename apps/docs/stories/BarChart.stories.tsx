import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import {
  ArrowRightIcon,
  BarChart,
  Button,
  CheckCircleIcon,
  MoreHorizontalIcon,
  Separator,
  TrendIndicator,
  type CartesianChartDatum,
  type CartesianChartSeries,
} from "@withalif/luna";

const teamData = [
  { category: "North", completed: 1840, pending: 320 },
  { category: "South", completed: 1560, pending: 410 },
  { category: "East", completed: 2120, pending: 280 },
  { category: "West", completed: 1730, pending: 360 },
] satisfies readonly CartesianChartDatum[];

const completedSeries = [
  { dataKey: "completed", label: "Completed" },
] satisfies readonly CartesianChartSeries[];

const meta = {
  title: "Luna/BarChart",
  component: BarChart,
  args: {
    title: "Records by region",
    description: "Completed records across operating regions.",
    data: teamData,
    series: completedSeries,
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
} satisfies Meta<typeof BarChart>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Modern: Story = {
  args: { fill: "solid", variant: "modern" },
};

export const GradientFill: Story = {
  args: {
    fill: "gradient",
    variant: "modern",
  },
};

export const StackedModern: Story = {
  args: {
    title: "Sales by channel",
    description: "Closed sales and pipeline stages by sales channel.",
    data: [
      { category: "Direct", sales: 8, qualified: 4, opportunity: 6 },
      { category: "Partners", sales: 29, qualified: 8, opportunity: 11 },
      { category: "Retail", sales: 16, qualified: 5, opportunity: 6 },
      { category: "Online", sales: 13, qualified: 4, opportunity: 6 },
    ],
    series: [
      { dataKey: "sales", label: "Closed sales", color: "chart-3" },
      {
        dataKey: "qualified",
        label: "Qualified pipeline",
        color: "chart-2",
      },
      {
        dataKey: "opportunity",
        label: "Remaining opportunity",
        color: "chart-1",
      },
    ],
    fill: "solid",
    layout: "stacked",
    variant: "modern",
    formatValue: (value) => `${value} B`,
    formatYAxis: (value) => `${value} B`,
  },
};

export const KpiSparkBars: Story = {
  args: {
    title: "Project progress",
    description: "Overall completion rate across all projects.",
    data: [
      { category: "Performing progress", completion: 89, change: 10.2 },
      { category: "Target sales", completion: 67, change: 2.2 },
    ],
    series: [
      { dataKey: "completion", label: "Completion" },
      { dataKey: "change", label: "Change vs. last week" },
    ],
    showHeader: false,
    variant: "meter",
    formatValue: (value) => `${value}%`,
    getValueTone: (value) =>
      value > 0 ? "success" : value < 0 ? "danger" : "neutral",
  },
  decorators: [
    (Story) => (
      <div className="w-[min(26rem,calc(100vw-4rem))]">
        <Story />
      </div>
    ),
  ],
  render: (args) => (
    <div className="grid gap-5">
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-surface text-foreground shadow-xs ring-1 ring-border [&_svg]:size-5"
        >
          <CheckCircleIcon />
        </span>
        <div className="grid min-w-0 flex-1 gap-0.5">
          <p className="text-card-title font-semibold text-foreground">
            Project progress
          </p>
          <p className="text-body-sm text-pretty text-foreground-secondary">
            Overall completion rate across all projects.
          </p>
        </div>
        <Button variant="ghost" size="icon-sm" aria-label="Project options">
          <MoreHorizontalIcon />
        </Button>
      </div>
      <Separator />
      <BarChart {...args} />
      <a
        href="#project-report"
        className="flex items-center justify-between gap-3 rounded-md bg-success-subtle px-3 py-2.5 text-body-sm text-foreground"
      >
        Up 6% from last week. Great momentum!
        <ArrowRightIcon aria-hidden="true" className="size-4 text-success" />
      </a>
    </div>
  ),
};

const channelMixData = [
  { category: "Dine in", orders: 412 },
  { category: "Pick-up", orders: 238 },
  { category: "Delivery", orders: 196 },
] satisfies readonly CartesianChartDatum[];

export const Segmented: Story = {
  args: {
    title: "Orders by service channel",
    description: "Share of this week's orders by service channel.",
    data: channelMixData,
    series: [{ dataKey: "orders", label: "Share of orders", color: "chart-4" }],
    showHeader: false,
    variant: "segmented",
  },
  render: (args) => (
    <div className="grid gap-4">
      <div className="grid gap-1">
        <p className="text-body-sm text-foreground-secondary">
          Avg. cheque size
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-3xl font-medium tracking-tight tabular-nums">
            $37.12
          </p>
          <TrendIndicator
            direction="up"
            value="28.84%"
            tone="success"
            toneLabel="above forecast"
          />
        </div>
      </div>
      <Separator />
      <BarChart {...args} />
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-body-sm">
        <p className="text-foreground-secondary">
          Full report on this week's avg. cheque size
        </p>
        <a
          href="#report"
          className="font-medium text-foreground underline underline-offset-4"
        >
          View report
        </a>
      </div>
    </div>
  ),
};

export const SegmentedCustomFormatter: Story = {
  args: {
    title: "Orders by service channel",
    description: "Orders this week by service channel.",
    data: [...channelMixData, { category: "Catering", orders: 64 }],
    series: [{ dataKey: "orders", label: "Orders", color: "chart-1" }],
    variant: "segmented",
    formatValue: (value) =>
      `${new Intl.NumberFormat("en-US").format(value)} orders`,
  },
};

export const SegmentedSpark: Story = {
  args: {
    ...Segmented.args,
    size: "spark",
  },
};

const formatMinutes = (seconds: number) =>
  `${Math.floor(seconds / 60)}′${String(seconds % 60).padStart(2, "0")}″`;

const formatMinuteChange = (minutes: number) =>
  minutes === 0 ? "0′" : `${minutes > 0 ? "+" : "\u2212"}${Math.abs(minutes)}′`;

export const SegmentedList: Story = {
  args: {
    title: "Completion time by service channel",
    description:
      "Share of orders, change since last week, and average completion time by service channel.",
    data: [
      { category: "Dine in", orders: 312, change: -2, time: 919 },
      { category: "Pickup", orders: 176, change: -3, time: 620 },
      { category: "Delivery", orders: 308, change: 1, time: 1097 },
    ],
    series: [
      { dataKey: "orders", label: "Share of orders", color: "chart-3" },
      { dataKey: "change", label: "Change vs. last week" },
      { dataKey: "time", label: "Avg. completion time" },
    ],
    showHeader: false,
    variant: "segmented-list",
    formatValue: (value, series) => {
      if (series.dataKey === "change") return formatMinuteChange(value);
      if (series.dataKey === "time") return formatMinutes(value);
      return `${value} orders`;
    },
    // Less time is better, so a drop reads as good news.
    getValueTone: (value, series) =>
      series.dataKey !== "change" || value === 0
        ? "neutral"
        : value < 0
          ? "success"
          : "danger",
  },
  decorators: [
    (Story) => (
      <div className="w-[min(20rem,calc(100vw-4rem))]">
        <Story />
      </div>
    ),
  ],
  render: (args) => (
    <div className="grid gap-4">
      <div className="grid gap-1">
        <p className="text-body-sm text-foreground-secondary">
          Avg. completion time
        </p>
        <p className="text-3xl font-medium tracking-tight tabular-nums">
          14′27″
        </p>
        <TrendIndicator
          direction="down"
          value="3′"
          tone="success"
          toneLabel="faster"
          label="vs. last week"
        />
      </div>
      <Separator />
      <BarChart {...args} />
    </div>
  ),
};

export const MultipleSeries: Story = {
  args: {
    description: "Completed and pending records across operating regions.",
    series: [
      ...completedSeries,
      { dataKey: "pending", label: "Pending", marker: "diamond" },
    ],
  },
};

export const Loading: Story = {
  args: { loading: true, loadingLabel: "Loading regional records" },
};

export const Empty: Story = {
  args: {
    data: [],
    emptyTitle: "No regional records",
    emptyDescription: "Records will appear after a region reports activity.",
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

export const NegativeValues: Story = {
  args: {
    title: "Net record movement",
    description: "Positive and negative changes by operating region.",
    data: [
      { category: "North", completed: 420 },
      { category: "South", completed: -180 },
      { category: "East", completed: 260 },
      { category: "West", completed: -90 },
    ],
  },
};

export const LongLabels: Story = {
  args: {
    title: "Records completed across all operating regions",
    description:
      "The axis and surrounding copy adapt when categories and translated labels require more room.",
    data: teamData.map((datum) => ({
      ...datum,
      category: `${datum.category} operating region`,
    })),
    series: [
      {
        dataKey: "completed",
        label: "Records completed during the selected period",
      },
      {
        dataKey: "pending",
        label: "Records pending at the end of the selected period",
        marker: "diamond",
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
