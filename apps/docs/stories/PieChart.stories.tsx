import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { shouldRunStoryPlay } from "./story-play";
import { PieChart, type DistributionChartDatum } from "@withalif/luna";

const formatCount = (value: number) =>
  new Intl.NumberFormat("en-US").format(value);

const channelData = [
  { category: "Web", value: 6240, percentage: 48 },
  { category: "Mobile app", value: 3900, percentage: 30 },
  { category: "Email", value: 1820, percentage: 14 },
  { category: "Phone", value: 1040, percentage: 8 },
] satisfies readonly DistributionChartDatum[];

const meta = {
  title: "Luna/PieChart",
  component: PieChart,
  args: {
    title: "Submissions by channel",
    description: "Submissions received this quarter by intake channel.",
    data: channelData,
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
} satisfies Meta<typeof PieChart>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Modern: Story = {
  args: { variant: "modern" },
};

export const SliceLabels: Story = {
  args: {
    title: "Budget by cost center",
    description: "Share of this year's approved budget by cost center.",
    data: [
      { category: "Operations", value: 1_530_000, percentage: 30 },
      { category: "Engineering", value: 1_377_000, percentage: 27 },
      { category: "Sales", value: 1_020_000, percentage: 20 },
      { category: "Support", value: 714_000, percentage: 14 },
      { category: "Administration", value: 459_000, percentage: 9 },
    ],
    sliceLabel: "percentage",
    size: "lg",
    formatValue: (value) =>
      new Intl.NumberFormat("en-US", {
        notation: "compact",
        maximumFractionDigits: 2,
      }).format(value),
  },
};

export const SliceLabelsModern: Story = {
  args: { ...SliceLabels.args, variant: "modern" },
};

export const CustomFormatter: Story = {
  args: {
    valueLabel: "Submissions",
    percentageLabel: "Share of submissions",
    formatValue: (value) => `${formatCount(value)} submissions`,
    formatPercentage: (percentage) =>
      new Intl.NumberFormat("en-US", {
        style: "percent",
        maximumFractionDigits: 0,
      }).format(percentage / 100),
  },
};

export const LegendBottom: Story = {
  args: { legendPosition: "bottom", size: "sm" },
  decorators: [
    (Story) => (
      <div className="w-[min(18rem,calc(100vw-4rem))]">
        <Story />
      </div>
    ),
  ],
};

export const LongLabels: Story = {
  args: {
    title: "Submissions received this quarter by intake channel",
    description:
      "Legend rows wrap long and translated category names without truncating them.",
    data: channelData.map((datum) => ({
      ...datum,
      category: `${datum.category} intake channel for the service portal`,
    })),
  },
};

export const SingleCategory: Story = {
  args: {
    description: "Only one channel reported submissions this quarter.",
    data: [
      { category: "Web", value: 6240, percentage: 100 },
      { category: "Mobile app", value: 0, percentage: 0 },
    ],
  },
};

export const Large: Story = {
  args: { size: "lg", variant: "modern" },
};

export const Loading: Story = {
  args: { loading: true, loadingLabel: "Loading submissions by channel" },
};

export const Empty: Story = {
  args: {
    data: [],
    emptyTitle: "No submissions",
    emptyDescription: "Submissions will appear once a channel reports them.",
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

export const SliceHover: Story = {
  tags: ["phase6c-reference"],
  play: async ({ canvasElement }) => {
    if (!shouldRunStoryPlay()) return;
    const canvas = within(canvasElement);
    const slices = canvasElement.querySelectorAll<SVGPathElement>(
      ".recharts-pie-sector path",
    );

    await expect(slices).toHaveLength(channelData.length);

    await userEvent.hover(slices[0]!);
    await waitFor(() =>
      expect(within(document.body).getByRole("tooltip")).toHaveTextContent(
        /Web.*6,240.*48%/,
      ),
    );

    const legend = canvas.getByRole("list", { name: "Chart legend" });
    const [web, mobile] = within(legend).getAllByRole("listitem");
    await expect(web).toHaveAttribute("data-active");
    await expect(mobile).toHaveAttribute("data-dimmed");

    await userEvent.unhover(
      canvas.getByRole("group", { name: "Submissions by channel" }),
    );
    await waitFor(() =>
      expect(within(document.body).queryByRole("tooltip")).toBeNull(),
    );
  },
};
