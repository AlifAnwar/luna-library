import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";
import { GaugeChart, TrendIndicator } from "@withalif/luna";

const meta = {
  title: "Luna/GaugeChart",
  component: GaugeChart,
  args: {
    title: "Target completion",
    description: "Completed work against this quarter's target.",
    value: 70.8,
    formatValue: (value) => `${value}%`,
    centerLabel: "Of quarterly target",
  },
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="w-[min(22rem,calc(100vw-2rem))] rounded-lg border border-border bg-card p-4 shadow-xs">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof GaugeChart>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const meter = within(canvasElement).getByRole("meter", {
      name: "Target completion",
    });

    await expect(meter).toHaveAttribute("aria-valuenow", "70.8");
    await expect(meter).toHaveAttribute("aria-valuemin", "0");
    await expect(meter).toHaveAttribute("aria-valuemax", "100");
    await expect(meter).toHaveAttribute("aria-valuetext", "70.8%");
  },
};

export const Segmented: Story = {
  args: { variant: "segmented" },
};

export const CustomScale: Story = {
  args: {
    title: "Storage used",
    description: "Workspace storage used against the plan allowance.",
    value: 684,
    max: 1000,
    color: "chart-2",
    formatValue: (value) => `${value} GB`,
    centerLabel: "of 1,000 GB",
    valueText: "684 of 1,000 gigabytes",
  },
};

export const OverMax: Story = {
  args: {
    title: "Seats assigned",
    description: "Assigned seats against the licensed seat count.",
    value: 132,
    max: 120,
    color: "chart-4",
    formatValue: (value) => `${value} seats`,
    centerLabel: "Licensed for 120",
  },
};

export const KpiCard: Story = {
  args: { showHeader: false, variant: "segmented", size: "lg" },
  render: (args) => (
    <div className="grid gap-4">
      <p className="text-card-title font-semibold">Target completion</p>
      <GaugeChart {...args} />
      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-1 rounded-md bg-surface-muted p-3">
          <p className="text-body-sm text-foreground-secondary">
            Items completed
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-card-title font-semibold tabular-nums">2,343</p>
            <TrendIndicator direction="up" value="4.5%" tone="neutral" />
          </div>
        </div>
        <div className="grid gap-1 rounded-md bg-surface-muted p-3">
          <p className="text-body-sm text-foreground-secondary">
            Items remaining
          </p>
          <p className="text-card-title font-semibold tabular-nums">967</p>
        </div>
      </div>
    </div>
  ),
};

export const Small: Story = {
  args: { size: "sm" },
};

export const Loading: Story = {
  args: { loading: true, loadingLabel: "Loading target completion" },
};

export const Empty: Story = {
  args: {
    value: null,
    emptyTitle: "No target set",
    emptyDescription: "Progress appears once a quarterly target is set.",
  },
};

export const Responsive: Story = {
  args: { variant: "segmented" },
  decorators: [
    (Story) => (
      <div className="w-56">
        <Story />
      </div>
    ),
  ],
};
