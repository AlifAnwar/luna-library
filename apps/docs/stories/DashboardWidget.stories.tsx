import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";
import { shouldRunStoryPlay } from "./story-play";
import {
  Button,
  DashboardWidget,
  LineChart,
  type CartesianChartDatum,
  type CartesianChartSeries,
} from "@withalif/luna";

const activity = [
  { category: "Apr", completed: 1280 },
  { category: "May", completed: 1460 },
  { category: "Jun", completed: 1380 },
  { category: "Jul", completed: 1710 },
  { category: "Aug", completed: 1840 },
  { category: "Sep", completed: 1920 },
] satisfies readonly CartesianChartDatum[];

const series = [
  { dataKey: "completed", label: "Completed" },
] satisfies readonly CartesianChartSeries[];

const meta = {
  title: "Luna/DashboardWidget",
  component: DashboardWidget,
  args: {
    title: "Monthly activity",
    description: "Completed records in the current reporting period.",
    children: <p>1,920 records were completed in September.</p>,
  },
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="w-[min(40rem,calc(100vw-2rem))]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DashboardWidget>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithChart: Story = {
  args: {
    children: (
      <LineChart
        title="Completed records by month"
        description="Monthly completed records in the current reporting period."
        showHeader={false}
        data={activity}
        series={series}
      />
    ),
  },
};

export const OptionalActions: Story = {
  args: {
    action: (
      <Button size="sm" variant="outline">
        View details
      </Button>
    ),
  },
  play: async ({ canvasElement }) => {
    if (!shouldRunStoryPlay()) return;
    const canvas = within(canvasElement);
    const widget = canvas.getByRole("region", { name: "Monthly activity" });
    await expect(widget).toHaveAccessibleDescription(
      "Completed records in the current reporting period.",
    );
    await userEvent.tab();
    await expect(
      canvas.getByRole("button", { name: "View details" }),
    ).toHaveFocus();
  },
};

export const Loading: Story = {
  args: { status: "loading", loadingLabel: "Loading monthly activity" },
};

export const Empty: Story = {
  args: {
    status: "empty",
    emptyTitle: "No activity yet",
    emptyDescription: "Completed records will appear after the next update.",
    emptyAction: (
      <Button size="sm" variant="outline">
        View sources
      </Button>
    ),
  },
};

export const LongTitle: Story = {
  args: {
    title:
      "Completed records across all locations in the current rolling thirty-day reporting period",
    description:
      "This widget includes a longer description to show how the header and actions wrap when space is limited.",
    action: (
      <Button size="sm" variant="outline">
        View details
      </Button>
    ),
  },
  decorators: [
    (Story) => (
      <div className="w-72 max-w-full">
        <Story />
      </div>
    ),
  ],
  play: async ({ canvasElement }) => {
    if (!shouldRunStoryPlay()) return;
    const canvas = within(canvasElement);
    const widget = canvas.getByRole("region");
    const action = canvas.getByRole("button", { name: "View details" });
    const widgetBounds = widget.getBoundingClientRect();
    const actionBounds = action.getBoundingClientRect();

    await expect(widget.scrollWidth).toBeLessThanOrEqual(widget.clientWidth);
    await expect(actionBounds.right).toBeLessThanOrEqual(widgetBounds.right);
  },
};

export const NarrowViewport: Story = {
  args: {
    action: (
      <Button size="sm" variant="outline">
        View details
      </Button>
    ),
  },
  decorators: [
    (Story) => (
      <div className="w-72 max-w-full">
        <Story />
      </div>
    ),
  ],
  play: async ({ canvasElement }) => {
    if (!shouldRunStoryPlay()) return;
    const canvas = within(canvasElement);
    const widget = canvas.getByRole("region", { name: "Monthly activity" });
    const action = canvas.getByRole("button", { name: "View details" });
    const widgetBounds = widget.getBoundingClientRect();
    const actionBounds = action.getBoundingClientRect();

    await expect(actionBounds.right).toBeLessThanOrEqual(widgetBounds.right);
    await expect(actionBounds.left).toBeGreaterThanOrEqual(widgetBounds.left);
    await userEvent.tab();
    await expect(action).toHaveFocus();
  },
};
