import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import {
  DonutChart,
  Separator,
  TrendIndicator,
  type DistributionChartDatum,
} from "@withalif/luna";

const formatCount = (value: number) =>
  new Intl.NumberFormat("en-US").format(value);

// Shares are supplied by the application, rounded the way it reports them.
const requestData = [
  { category: "Resolved", value: 4820, percentage: 58.1 },
  { category: "In progress", value: 1935, percentage: 23.3 },
  { category: "Awaiting reply", value: 1012, percentage: 12.2 },
  { category: "Escalated", value: 531, percentage: 6.4 },
] satisfies readonly DistributionChartDatum[];

const meta = {
  title: "Luna/DonutChart",
  component: DonutChart,
  args: {
    title: "Requests by status",
    description: "Open and closed requests in the current reporting period.",
    data: requestData,
    centerValue: "8,298",
    centerLabel: "Total requests",
    formatValue: formatCount,
  },
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="w-[min(40rem,calc(100vw-2rem))] rounded-lg border border-border bg-card p-4 shadow-xs">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DonutChart>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Modern: Story = {
  args: { variant: "modern" },
};

export const SliceLabels: Story = {
  args: { sliceLabel: "percentage", size: "lg" },
};

export const SliceLabelsModern: Story = {
  args: { sliceLabel: "percentage", variant: "modern" },
};

const orderData = [
  { category: "New orders", value: 1_842, percentage: 58.9 },
  { category: "Returning orders", value: 912, percentage: 29.2 },
  { category: "Trial orders", value: 374, percentage: 11.9 },
] satisfies readonly DistributionChartDatum[];

export const HalfArc: Story = {
  args: {
    arc: "half",
    title: "Orders by customer type",
    description: "Orders placed this week by customer type.",
    data: orderData,
    centerValue: "3,128",
    centerLabel: "Total orders",
  },
};

export const HalfArcModern: Story = {
  args: {
    ...HalfArc.args,
    variant: "modern",
    size: "lg",
    showHeader: false,
    legendPosition: "bottom",
  },
  decorators: [
    (Story) => (
      <div className="w-[min(22rem,calc(100vw-4rem))]">
        <Story />
      </div>
    ),
  ],
};

export const HalfArcSliceLabels: Story = {
  args: { ...HalfArc.args, sliceLabel: "percentage", size: "lg" },
};

export const WithoutPercentage: Story = {
  args: {
    description: "Requests in the current reporting period by status.",
    data: requestData.map(({ category, value }) => ({ category, value })),
  },
};

export const CustomFormatter: Story = {
  args: {
    title: "Storage by content type",
    description: "Storage used across the workspace by content type.",
    data: [
      { category: "Documents", value: 412.6, percentage: 44 },
      { category: "Images", value: 268.1, percentage: 29 },
      { category: "Video", value: 171.4, percentage: 18 },
      { category: "Archives", value: 84.9, percentage: 9 },
    ],
    centerValue: "937 GB",
    centerLabel: "of 1 TB used",
    valueLabel: "Storage",
    percentageLabel: "Share of used storage",
    formatValue: (value) => `${value.toFixed(1)} GB`,
    formatPercentage: (percentage) => `${percentage} %`,
  },
};

export const LegendBottom: Story = {
  args: { legendPosition: "bottom" },
  decorators: [
    (Story) => (
      <div className="w-[min(20rem,calc(100vw-4rem))]">
        <Story />
      </div>
    ),
  ],
};

export const LongLabels: Story = {
  args: {
    title: "Requests by resolution status across all service desks",
    description:
      "The legend wraps and moves below the chart when translated labels need more room.",
    data: [
      {
        category: "Resolved within the agreed service level",
        value: 4820,
        percentage: 58.1,
      },
      {
        category: "In progress with the assigned team",
        value: 1935,
        percentage: 23.3,
      },
      {
        category: "Awaiting a reply from the requester",
        value: 1012,
        percentage: 12.2,
      },
      {
        category: "Escalated to a second-line team",
        value: 531,
        percentage: 6.4,
      },
    ],
  },
};

export const HighValues: Story = {
  args: {
    title: "Events by source",
    description: "Ingested events by source in the last 30 days.",
    data: [
      { category: "API", value: 184_620_300, percentage: 61.4 },
      { category: "Webhooks", value: 72_915_040, percentage: 24.3 },
      { category: "Batch import", value: 43_180_220, percentage: 14.3 },
    ],
    centerValue: "300.7M",
    centerLabel: "Events",
    formatValue: (value) =>
      new Intl.NumberFormat("en-US", {
        notation: "compact",
        maximumFractionDigits: 1,
      }).format(value),
  },
};

export const LowValues: Story = {
  args: {
    title: "Incidents by severity",
    description:
      "Incidents this week. A severity with no incidents stays in the legend without an arc.",
    data: [
      { category: "Low", value: 5 },
      { category: "Medium", value: 2 },
      { category: "High", value: 1 },
      { category: "Critical", value: 0 },
    ],
    centerValue: "8",
    centerLabel: "Incidents",
  },
};

// Donuts read at a glance only up to about five parts. Group the long tail
// into "Other" in the application and pin colors so they follow the category.
export const GroupedLongTail: Story = {
  args: {
    title: "Sessions by region",
    description: "Sessions this month, with smaller regions grouped as Other.",
    data: [
      { category: "North America", value: 18_240, color: "chart-1" },
      { category: "Europe", value: 12_880, color: "chart-2" },
      { category: "Asia Pacific", value: 9_310, color: "chart-3" },
      { category: "Latin America", value: 3_420, color: "chart-4" },
      { category: "Other (6 regions)", value: 1_950, color: "chart-5" },
    ],
    centerValue: "45.8K",
    centerLabel: "Sessions",
  },
};

export const KpiCard: Story = {
  args: {
    showHeader: false,
    size: "sm",
    variant: "modern",
    centerValue: "58%",
    centerLabel: "Resolved",
  },
  decorators: [
    (Story) => (
      <div className="w-[min(24rem,calc(100vw-4rem))]">
        <Story />
      </div>
    ),
  ],
  render: (args) => (
    <div className="grid gap-4">
      <div className="grid gap-1">
        <p className="text-body-sm text-foreground-secondary">
          Requests this period
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-3xl font-medium tracking-tight tabular-nums">
            8,298
          </p>
          <TrendIndicator
            direction="up"
            value="4.2%"
            tone="neutral"
            label="vs. last period"
          />
        </div>
      </div>
      <Separator />
      <DonutChart {...args} />
    </div>
  ),
};

export const Spark: Story = {
  args: {
    size: "spark",
    showHeader: false,
    variant: "modern",
  },
  decorators: [
    (Story) => (
      <div className="flex items-center gap-3">
        <Story />
        <span className="grid gap-0.5">
          <span className="text-body font-medium tabular-nums">58.1%</span>
          <span className="text-caption text-foreground-secondary">
            Resolved
          </span>
        </span>
      </div>
    ),
  ],
};

// `size` covers the common presets; `plotClassName` sets any other diameter
// and `className` bounds the whole chart, legend included.
export const CustomSize: Story = {
  args: {
    className: "max-w-xl",
    plotClassName: "h-64 w-64",
  },
};

export const Loading: Story = {
  args: { loading: true, loadingLabel: "Loading requests by status" },
};

export const Empty: Story = {
  args: {
    data: [],
    emptyTitle: "No requests yet",
    emptyDescription: "Requests will appear after the first one is submitted.",
  },
};

export const Responsive: Story = {
  args: { size: "sm" },
  decorators: [
    (Story) => (
      <div className="w-full max-w-72">
        <Story />
      </div>
    ),
  ],
};

export const KeyboardNavigation: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const surface = canvas.getByRole("group", { name: "Requests by status" });

    await userEvent.tab();
    await expect(surface).toHaveFocus();
    await expect(surface).toHaveAccessibleDescription(
      "Use the arrow keys to move between segments.",
    );

    await userEvent.keyboard("{ArrowRight}");
    await waitFor(() =>
      expect(within(document.body).getByRole("tooltip")).toHaveTextContent(
        /Resolved.*4,820.*58\.1%/,
      ),
    );
    await expect(surface).toHaveTextContent("Resolved: 4,820, 58.1%");

    await userEvent.keyboard("{End}");
    await waitFor(() =>
      expect(within(document.body).getByRole("tooltip")).toHaveTextContent(
        /Escalated/,
      ),
    );

    await userEvent.keyboard("{ArrowRight}");
    await waitFor(() =>
      expect(within(document.body).getByRole("tooltip")).toHaveTextContent(
        /Resolved/,
      ),
    );

    await userEvent.keyboard("{Escape}");
    await waitFor(() =>
      expect(within(document.body).queryByRole("tooltip")).toBeNull(),
    );
  },
};

export const LegendHighlight: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const legend = canvas.getByRole("list", { name: "Chart legend" });
    const [first, second] = within(legend).getAllByRole("listitem");

    await userEvent.hover(second!);
    await expect(second).toHaveAttribute("data-active");
    await expect(first).toHaveAttribute("data-dimmed");
    await waitFor(() =>
      expect(within(document.body).getByRole("tooltip")).toHaveTextContent(
        /In progress/,
      ),
    );

    await userEvent.unhover(second!);
    await expect(first).not.toHaveAttribute("data-dimmed");
  },
};
