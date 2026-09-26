import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import {
  Button,
  ChartContainer,
  ChartHeader,
  ChartLegend,
  type ChartLegendItem,
} from "@withalif/luna";

const legendItems = [
  { id: "current", label: "Current period", color: "chart-1", marker: "line" },
  {
    id: "previous",
    label: "Previous period",
    color: "chart-2",
    marker: "dash",
  },
] satisfies readonly ChartLegendItem[];

function RendererSlot() {
  return (
    <div
      role="img"
      aria-label="Visualization renderer placeholder"
      className="grid min-h-full place-content-center rounded-md border border-dashed border-border bg-surface-subtle p-6 text-center text-body-sm text-foreground-secondary"
    >
      Visualization renderer mounts here
    </div>
  );
}

const meta = {
  title: "Luna/ChartContainer",
  component: ChartContainer,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="w-[min(48rem,calc(100vw-2rem))] rounded-lg border border-border bg-card p-4 shadow-xs">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ChartContainer>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    header: (
      <ChartHeader
        title="Processed records"
        description="Daily completed records for the selected reporting period."
      />
    ),
    legend: <ChartLegend items={legendItems} />,
    children: <RendererSlot />,
  },
};

export const LegendBelowPlot: Story = {
  args: {
    ...Default.args,
    legendPosition: "bottom",
  },
};

export const WithHeaderAction: Story = {
  args: {
    header: (
      <ChartHeader
        title="Processed records"
        description="Daily completed records for the selected reporting period."
        action={
          <Button size="sm" variant="outline">
            View details
          </Button>
        }
      />
    ),
    legend: <ChartLegend items={legendItems} />,
    children: <RendererSlot />,
  },
};

export const Responsive: Story = {
  args: {
    size: "sm",
    header: (
      <ChartHeader
        title="Processed records"
        description="The shell wraps its caption, legend, and actions without page-level overflow."
      />
    ),
    legend: <ChartLegend items={legendItems} />,
    children: <RendererSlot />,
  },
};

export const LongLabels: Story = {
  args: {
    header: (
      <ChartHeader
        title="Processed records across the current rolling thirty-day reporting period"
        description="This intentionally long description verifies that translated or expanded content wraps without clipping the visualization or its surrounding controls."
      />
    ),
    legend: (
      <ChartLegend
        items={[
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
        ]}
      />
    ),
    children: <RendererSlot />,
  },
};
